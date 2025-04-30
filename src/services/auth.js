
import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import { randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import Handlebars from "handlebars";
import path from "node:path";
import fs from "node:fs/promises";

import UserCollection from "../db/models/User.js";
import SessionCollection from "../db/models/Session.js";

import { SMTP } from "../constants/index.js";
import { getEnvVar } from "../utils/getEnvVar.js";
import { sendEmail } from "../utils/sendMail.js";
import { TEMPLATES_DIR } from "../constants/index.js";

import { accessTokenLifeTime, refreshTokenLifeTime } from "../constants/auth.js";

const createSession = () => {
    const accessToken = randomBytes(30).toString("base64");
    const refreshToken = randomBytes(30).toString("base64");
    const accessTokenValidUntil = Date.now() + accessTokenLifeTime;
    const refreshTokenValidUntil = Date.now() + refreshTokenLifeTime;

    return {
        accessToken,
        refreshToken,
        accessTokenValidUntil,
        refreshTokenValidUntil,
    }
}

export const findSession = query => SessionCollection.findOne(query);

export const findUser = query => UserCollection.findOne(query);

export const registerUser = async payload => {
    const { email, password } = payload;
    const user = await UserCollection.findOne({ email });
    if (user) {
        throw createHttpError(409, "Email in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    return await UserCollection.create({ ...payload, password: hashPassword });
};

export const loginUser = async payload => {
    const { email, password } = payload;
    const user = await UserCollection.findOne({ email });
    if (!user) {
        throw createHttpError(401, "Email or password invalid");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
        throw createHttpError(401, "Email or password invalid");
    }

    await SessionCollection.findOneAndDelete({ userId: user._id });

    const session = createSession();

    return SessionCollection.create({
        userId: user._id,
        ...session,
    });
};

export const requestResetToken = async (email) => {
    const user = await UserCollection.findOne({ email });
    if (!user) {
        throw createHttpError(404, "User not found!");
    }
    const resetToken = jwt.sign(
        {
            sub: user._id,
            email,
        },
        getEnvVar("JWT_SECRET"),
        {
            expiresIn: "5min",
        },
    );

    const resetPasswordTemplatePath = path.join(
        TEMPLATES_DIR,
        "send-reset-email.html",
    );

    const templateSource = (
        await fs.readFile(resetPasswordTemplatePath)
    ).toString();

    // console.log(templateSource);

    const template = Handlebars.compile(templateSource);
    const html = template({
        name: user.name,
        link: `${getEnvVar("APP_DOMAIN")}/reset-pwd?token=${resetToken}`,
    });

    try {
        await sendEmail({
            from: getEnvVar(SMTP.SMTP_FROM),
            to: email,
            subject: 'Reset your password',
            html,
        });
    } catch (err) {
        if (err)
            throw createHttpError(
                500,
                'Failed to send the email, please try again later.',
            );
    }
};

export const resetPassword = async (payload) => {
    let entries;

    try {
        entries = jwt.verify(payload.token, getEnvVar('JWT_SECRET'));
    } catch (err) {
        if (err instanceof Error) throw createHttpError(401, "Token is expired or invalid.");
        throw err;
    }

    const user = await UserCollection.findOne({
        email: entries.email,
        _id: entries.sub,
    });

    if (!user) {
        throw createHttpError(404, 'User not found');
    }

    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    await UserCollection.updateOne(
        { _id: user._id },
        { password: encryptedPassword },
    );

    await SessionCollection.deleteMany({ userId: user._id });
};

export const refreshUser = async (refreshToken, sessionId) => {
    const session = await findSession({ refreshToken, _id: sessionId });

    if (!session) {
        throw createHttpError(401, "Session not found");
    }

    if (session.refreshTokenValidUntil < Date.now()) {
        await SessionCollection.findOneAndDelete({ _id: session._id });
        throw createHttpError(401, "Session token expired");
    }
    await SessionCollection.findOneAndDelete({ _id: session._id });

    const newSession = createSession();

    return SessionCollection.create({
        userId: session.userId,
        ...newSession,
    });

};

export const logoutUser = sessionId => SessionCollection.deleteOne({ _id: sessionId });