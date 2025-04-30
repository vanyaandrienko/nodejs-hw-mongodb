import { Router } from "express";

import { ctrlWrapper } from "../utils/ctrlWrapper.js";

import { getContactsController, getContactsByIdController, addContactController, patchContactController, deleteContactController } from "../controllers/contacts.js";

import { validateBody } from "../utils/validateBody.js";

import { contactsAddSchema, contactsUpdateSchema } from "../validation/contacts.js";

import { isValidId } from "../middlewares/isValidId.js";
import { authenticate } from "../middlewares/authenticate.js";

import { upload } from "../middlewares/multer.js";

const contactsRouter = Router();

contactsRouter.use(authenticate);

contactsRouter.get("/", ctrlWrapper(getContactsController));

contactsRouter.get("/:contactId", isValidId, ctrlWrapper(getContactsByIdController));

contactsRouter.post("/", upload.single("photo"), validateBody(contactsAddSchema), ctrlWrapper(addContactController));

contactsRouter.patch("/:contactId", isValidId, upload.single("photo"), validateBody(contactsUpdateSchema), ctrlWrapper(patchContactController));

contactsRouter.delete("/:contactId", isValidId, ctrlWrapper(deleteContactController));

export default contactsRouter;