import createHttpError from "http-errors";

import { parsePaginationParams } from "../utils/parsePaginationParams.js";
import { parseSortParams } from "../utils/parseSortParams.js";

import { contactSortFields } from "../db/models/Contact.js";

import { getContacts, getContactsById, addContact, updateContact, deleteContactById } from "../services/contacts.js";

import { saveFileToUploadDir } from "../utils/saveFileToUploadDir.js";

import { saveFileToCloudinary } from "../utils/saveFileToCloudinary.js";

import { getEnvVar } from "../utils/getEnvVar.js";

export const getContactsController = async (request, response) => {
    const paginationParams = parsePaginationParams(request.query);
    const sortParams = parseSortParams(request.query, contactSortFields);
    const { _id: userId } = request.user;
    const data = await getContacts({ userId, ...paginationParams, ...sortParams });

    response.json({
        status: 200,
        message: "Successfully found contacts!",
        data,
    });
};

export const getContactsByIdController = async (request, response) => {

    const { contactId } = request.params;
    const { _id: userId } = request.user;

    const data = await getContactsById(contactId, userId);

    if (!data) {
        throw createHttpError(404, "Contact not found")

        // const error = new Error("Contact not found");
        // error.status = 404;
        // throw error;

        // return response.status(404).json({
        //     message: "Contact not found"
        // });
    }

    response.json({
        status: 200,
        message: `Successfully found contact with id ${contactId}!`,
        data,
    });
};

export const addContactController = async (request, response) => {

    const { _id: userId } = request.user;
    const photo = request.file;

    let photoUrl;

    if (photo) {

        if (getEnvVar("ENABLE_CLOUDINARY") === "true") {

            photoUrl = await saveFileToCloudinary(photo);

        } else {
            photoUrl = await saveFileToUploadDir(photo);

        }
    }

    const data = await addContact({ ...request.body, userId, photo: photoUrl });

    response.status(201).json({
        status: 201,
        message: "Successfully created a contact!",
        data,
    })

};

export const patchContactController = async (request, response, next) => {
    const { contactId } = request.params;
    const photo = request.file;

    let photoUrl;

    if (photo) {
        if (getEnvVar("ENABLE_CLOUDINARY") === "true") {
            photoUrl = await saveFileToCloudinary(photo);
        } else {
            photoUrl = await saveFileToUploadDir(photo);
        }
    }

    const { _id: userId } = request.user;

    const result = await updateContact(contactId, { ...request.body, photo: photoUrl }, userId);

    if (!result) {

        return next(createHttpError(404, "Contact not found"));
    }

    response.json({
        status: 200,
        message: "Successfully patched a contact!",
        data: result,
    });
}

export const deleteContactController = async (request, response) => {
    const { contactId } = request.params;
    const { _id: userId } = request.user;
    const data = await deleteContactById(contactId, userId);

    if (!data) {
        throw createHttpError(404, "Contact not found")
    }

    response.status(204).send();
}