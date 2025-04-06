import ContactCollection  from '../db/models/Contact.js';

export const getAllContacts = async () => {
    const contacts = await ContactCollection.find();
    return contacts;
};

export const getContactById = async (contactId) => {
    const contact = await ContactCollection.findById(contactId);
    return contact;
};
