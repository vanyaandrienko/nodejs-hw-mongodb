import { Router } from "express";

import { ctrlWrapper } from "../utils/ctrlWrapper.js";

import { validateBody } from "../utils/validateBody.js";

import { authRegisterSchema, authLoginSchema } from "../validation/auth.js";

import { registerController, loginController, refreshController, logoutController } from "../controllers/auth.js";

import { requestResetEmailSchema } from "../validation/auth.js";

import { requestResetEmailController } from "../controllers/auth.js";

import { resetPasswordSchema } from "../validation/auth.js";

import { resetPasswordController } from "../controllers/auth.js";

const authRouter = Router();

authRouter.post("/register", validateBody(authRegisterSchema), ctrlWrapper(registerController));

authRouter.post("/login", validateBody(authLoginSchema), ctrlWrapper(loginController));

authRouter.post("/refresh", ctrlWrapper(refreshController));

authRouter.post("/logout", ctrlWrapper(logoutController));

authRouter.post("/send-reset-email", validateBody(requestResetEmailSchema), ctrlWrapper(requestResetEmailController));

authRouter.post("/reset-pwd", validateBody(resetPasswordSchema), ctrlWrapper(resetPasswordController));

export default authRouter;