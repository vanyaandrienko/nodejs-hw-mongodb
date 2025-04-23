import createHttpError from "http-errors";
import jwt from "jsonwebtoken";

export const authenticate = async (req, res, next) => {
  const authorization = req.get("Authorization");

  if (!authorization) {
    return next(createHttpError(401, "Authorization header missing"));
  }

  const [bearer, accessToken] = authorization.split(" ");

  if (bearer !== "Bearer") {
    return next(createHttpError(401, "Header must have type Bearer"));
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_ACCESS);
    req.user = { _id: decoded.userId }; // Припускаємо, що в пейлоуді токена є userId
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(createHttpError(401, "Access token expired"));
    }
    return next(createHttpError(401, "Invalid access token"));
  }
};