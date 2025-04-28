import { Schema, model } from "mongoose";

const contactSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",      // це посилання на модель юзера
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false,
    },
    isFavourite: {
        type: Boolean,
        default: false,
    },
    contactType: {
        type: String,
        enum: ["work", "home", "personal"],
        default: "personal",
    },
}, {
    timestamps: true,
    versionKey: false,
});

const ContactCollection = model("contacts", contactSchema);
export default ContactCollection;
