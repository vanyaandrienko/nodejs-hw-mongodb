import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";

import UserCollection from "../db/models/User.js";
import SessionCollection from '../db/models/Session.js';

import { accessTokenLifeTime, refreshTokenLifeTime } from "../constants/auth.js";

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET_ACCESS, { expiresIn: accessTokenLifeTime / 1000 }); // Переводимо мс в секунди
  const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET_REFRESH, { expiresIn: refreshTokenLifeTime / 1000 }); // Переводимо мс в секунди
  const accessTokenValidUntil = new Date(Date.now() + accessTokenLifeTime);
  const refreshTokenValidUntil = new Date(Date.now() + refreshTokenLifeTime);

  return { accessToken, refreshToken, accessTokenValidUntil, refreshTokenValidUntil };
};

export const findSession = query => SessionCollection.findOne(query);

export const findUser = query => UserCollection.findOne(query);

export const registerUser = async payload => {
  const { email, password } = payload;
  const user = await findUser({ email });

  if (user) {
    throw createHttpError(409, "Email already in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  return await UserCollection.create({ ...payload, password: hashPassword });
};

export const loginUser = async payload => {
  const { email, password } = payload;
  const user = await findUser({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw createHttpError(401, "Email or password invalid");
  }

  await SessionCollection.deleteMany({ userId: user._id }); 
  const { accessToken, refreshToken, accessTokenValidUntil, refreshTokenValidUntil } = generateTokens(user._id);

  return SessionCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });
};

export const refreshUser = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);

    const session = await SessionCollection.findOne({ refreshToken, userId: decoded.userId });
    if (!session) {
      throw createHttpError(401, "Invalid refresh token");
    }

    if (session.refreshTokenValidUntil < new Date()) {
      await SessionCollection.deleteOne({ _id: session._id });
      throw createHttpError(401, "Refresh token expired");
    }

    await SessionCollection.deleteOne({ _id: session._id }); 

    const { accessToken, refreshToken: newRefreshToken, accessTokenValidUntil, refreshTokenValidUntil: newRefreshTokenValidUntil } = generateTokens(decoded.userId);

    return SessionCollection.create({
      userId: decoded.userId,
      accessToken,
      refreshToken: newRefreshToken,
      accessTokenValidUntil,
      refreshTokenValidUntil: newRefreshTokenValidUntil,
    });
  } catch (error) {
    throw createHttpError(401, "Invalid refresh token");
  }
};

export const logoutUser = async (refreshToken) => {
  try {
    return await SessionCollection.deleteOne({ refreshToken });
  } catch (error) {
    console.error("Помилка в logoutUser:", error);
    throw error;
  }
};