import createHttpError from "http-errors";
import mongoose from "mongoose";

export const isValidId = (request, response, next) => {
    const { contactId } = request.params;
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
        return next(createHttpError(400, "Invalid Id"));
    }
    next();
};