import { Schema, model } from 'mongoose';

import { handleSaveError, setUpdateSettings } from './hooks.js';

import { emailRegexp } from '../../constants/auth.js';

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name must be exist"],
    },
    email: {
        type: String,
        match: emailRegexp,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: { 
        type: Date,
        default: Date.now,
    },
    updatedAt: { 
        type: Date,
        default: Date.now,
    },
}, {versionKey: false});

userSchema.post('save', handleSaveError);

userSchema.pre('findOneAndUpdate', setUpdateSettings);

userSchema.post('findOneAndUpdate', handleSaveError);

const UserCollection = model("user", userSchema);

export default UserCollection;
