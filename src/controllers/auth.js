import { loginUser, registerUser, refreshUser, logoutUser, requestResetToken, resetPassword } from "../services/auth.js";

const setupSession = (response, session) => {
    response.cookie("refreshToken", session.refreshToken, {
        httpOnly: true,
        expires: session.refreshTokenValidUntil,
    });

    response.cookie("sessionId", session._id, {
        httpOnly: true,
        expires: session.refreshTokenValidUntil,
    });
}

export const registerController = async (require, response) => {
    const user = await registerUser(require.body);

    response.status(201).json({
        status: 201,
        message: "Successfully registered a user!",
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
    });
};

export const requestResetEmailController = async (request, response) => {
    await requestResetToken(request.body.email);
    response.json({
        status: 200,
        message: "Reset password email has been successfully sent.",
        data: {},
    })
};

export const resetPasswordController = async (request, response) => {
    await resetPassword(request.body);
    response.json({
        status: 200,
        message: "Password has been successfully reset.",
        data: {},
    });
};

export const loginController = async (require, response) => {
    const session = await loginUser(require.body);

    setupSession(response, session);

    response.json({
        status: 200,
        message: "Successfully logged in an user!",
        data: {
            accessToken: session.accessToken,
        }
    });
};

export const refreshController = async (request, response) => {

    const { refreshToken, sessionId } = request.cookies;
    const session = await refreshUser(refreshToken, sessionId);

    setupSession(response, session);

    response.json({
        status: 200,
        message: "Successfully refreshed a session!",
        data: {
            accessToken: session.accessToken,
        }
    });
};

export const logoutController = async (request, response) => {
    if (request.cookies.sessionId) {
        await logoutUser(request.cookies.sessionId)
    }

    response.clearCookie("sessionId");
    response.clearCookie("refreshToken");

    response.status(204).send();
};