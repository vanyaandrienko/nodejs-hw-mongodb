import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import { randomBytes } from "node:crypto";
import UserCollection from "../db/models/User.js";
import SessionCollection from '../db/models/Session.js';
import { accessTokenLifeTime, refreshTokenLifeTime } from "../constants/auth.js";

const createSession = (userId) => { // Додано параметр userId
  const accessToken = randomBytes(30).toString("base64");
  const refreshToken = randomBytes(30).toString("base64");
  const accessTokenValidUntil = new Date(Date.now() + accessTokenLifeTime); // Використовуємо new Date()
  const refreshTokenValidUntil = new Date(Date.now() + refreshTokenLifeTime); // Використовуємо new Date()

  return {
    userId, // Повертаємо userId
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  };
};

export const findSession = (query) => SessionCollection.findOne(query);

export const findUser = (query) => UserCollection.findOne(query);

export const registerUser = async (payload) => {
  const { email, password } = payload;
  const user = await findUser({ email });

  if (user) {
    throw createHttpError(409, "Email already in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return await UserCollection.create({ ...payload, password: hashedPassword });
};

export const loginUser = async (payload) => {
  const { email, password } = payload;
  const user = await findUser({ email });
  if (!user) {
    throw createHttpError(401, "Invalid credentials"); // Змінено повідомлення
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw createHttpError(401, "Invalid credentials");  // Змінено повідомлення
  }

  // Оновлено:  Забезпечуємо атомарність операцій
  const session = createSession(user._id); // Передаємо userId у createSession
  try {
      await SessionCollection.findOneAndDelete({ userId: user._id }); // Видаляємо стару сесію
      const newSession = await SessionCollection.create(session);       // Створюємо нову
      return {user, session: newSession};
  } catch(error){
    throw createHttpError(500, "Login failed.  Database error."); // Краще обробити конкретніше
  }
};

export const refreshUser = async ({ refreshToken, sessionId }) => {
  const session = await findSession({ refreshToken, _id: sessionId });
  if (!session) {
    throw createHttpError(401, "Invalid or expired refresh token"); // Змінено повідомлення
  }

  if (session.refreshTokenValidUntil < Date.now()) {
    await SessionCollection.findOneAndDelete({ _id: sessionId });
    throw createHttpError(401, "Refresh token expired");
  }

  const newSession = createSession(session.userId); // Передаємо userId

  try {
    await SessionCollection.findOneAndDelete({ _id: sessionId });
    const createdSession = await SessionCollection.create(newSession);
    return createdSession;
  } catch(error) {
     throw createHttpError(500, "Failed to refresh session");
  }

};

export const logoutUser = (sessionId) => SessionCollection.deleteOne({ _id: sessionId });