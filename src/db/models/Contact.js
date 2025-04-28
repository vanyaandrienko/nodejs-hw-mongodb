import { Schema, model } from "mongoose";

const contactSchema = new Schema({
    
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
        required: false,
        default: false,
    },
    contactType: {
        type: String,
        required: true,
        enum: [ "work", "home", "personal" ],
        default: "personal",
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",      
        required: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});

const ContactCollection = model("contacts", contactSchema);
export default ContactCollection;
