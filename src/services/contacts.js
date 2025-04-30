import ContactCollection from "../db/models/Contact.js";

import { sortList } from "../constants/index.js";

import { calcPaginationData } from "../utils/calcPaginationData.js";

export const getContacts = async ({ page = 1, perPage = 10, sortBy = "_id", sortOrder = sortList[0], userId }) => {
    const skip = (page - 1) * perPage;
    const data = await ContactCollection.find({ userId }).skip(skip).limit(perPage).sort({ [sortBy]: sortOrder });
    const totalItems = await ContactCollection.countDocuments({ userId });

    const paginationData = calcPaginationData({ page, perPage, totalItems })

    return {
        data,
        page,
        perPage,
        totalItems,
        ...paginationData,
    };
};

export const getContactsById = (contactId, userId) => ContactCollection.findOne({ _id: contactId, userId });

export const addContact = payload => ContactCollection.create(payload);

export const updateContact = async (_id, payload, userId) => {
    const result = await ContactCollection.findOneAndUpdate({ _id, userId }, payload,
        {
            new: true,
        });

    return result;
}

export const deleteContactById = (_id, userId) => ContactCollection.findOneAndDelete({ _id, userId });