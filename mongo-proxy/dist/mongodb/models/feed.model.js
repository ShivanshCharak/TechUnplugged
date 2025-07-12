"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/***
 * NO NEED TO CREATE DRAFTS DB
 * POSTGRES IS TAKING CARE OF IT
 */
const mongoose_1 = require("mongoose");
const FeedTableViewSchema = new mongoose_1.Schema({
    createdAt: {
        type: Date,
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 40
    },
    body: {
        type: String,
        required: true,
        maxlength: 100
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        maxlength: 40
    },
    excerpt: {
        type: String,
        maxlength: 30
    },
    images: {
        type: String,
        maxlength: 20
    },
    username: {
        type: String,
        required: true
    },
    intro: {
        type: String
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        index: true
    }
}, {
    timestamps: false,
    versionKey: false
});
// Indexes for faster queries
FeedTableViewSchema.index({ isPremium: 1 });
FeedTableViewSchema.index({ isDeleted: 1 });
const FeedTableView = (0, mongoose_1.model)('FeedTableView', FeedTableViewSchema);
exports.default = FeedTableView;
