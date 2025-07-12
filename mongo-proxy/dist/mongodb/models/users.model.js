"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/***
 * NO NEED TO CREATE DRAFTS DB
 * POSTGRES IS TAKING CARE OF IT
 */
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    firstname: {
        type: String,
        required: true
    }, lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    isPremium: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});
const User = (0, mongoose_1.model)("User", UserSchema);
UserSchema.virtual("fullname").get(function () {
    return `${this.firstname} ${this.lastname}`;
});
exports.default = User;
