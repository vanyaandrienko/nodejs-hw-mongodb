import createHttpError from "http-errors";
import { findSession, findUser } from "../services/auth.js";

export const authenticate = async (req, res, next) => {
  const authorization = req.get("Authorization");

  if (!authorization) {
    return next(createHttpError(401, "Authorization header missing"));
  }

  const [bearer, accessToken] = authorization.split(" ");

  if (bearer !== "Bearer" || !accessToken) { // Додано перевірку наявності accessToken
    return next(createHttpError(401, "Invalid authorization format. Expected 'Bearer <token>'"));
  }

  try { // Обернено асинхронні операції в try-catch
    const session = await findSession({ accessToken });
    if (!session) {
      return next(createHttpError(401, "Invalid access token")); // Змінено повідомлення
    }

    if (session.accessTokenValidUntil < Date.now()) {
      return next(createHttpError(401, "Access token expired"));
    }

    const user = await findUser({ _id: session.userId });
    if (!user) {
      return next(createHttpError(401, "User associated with this token not found")); // Змінено повідомлення
    }

    req.user = user;
    next();

  } catch (error) {
    next(error); // Обробка помилок findSession та findUser
  }
};