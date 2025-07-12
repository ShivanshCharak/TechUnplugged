"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const users_model_1 = __importDefault(require("./users.model"));
const BlogsSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100,
        index: true
    },
    body: {
        type: String,
        required: true,
        trim: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: users_model_1.default,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    slug: {
        type: String,
        unique: true,
        required: true
    },
    excerpt: {
        type: String,
        required: true
    },
    images: [String],
    isPublished: {
        type: Boolean,
        default: false
    },
    wordCount: Number,
    createdAt: {
        type: Date,
        default: Date.now().toLocaleString
    },
});
const Blog = (0, mongoose_1.model)('Blog', BlogsSchema);
exports.default = Blog;
