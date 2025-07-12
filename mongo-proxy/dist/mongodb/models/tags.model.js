"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const blogs_model_1 = __importDefault(require("./blogs.model"));
const tagsSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    }
});
const Tag = (0, mongoose_1.model)("Tags", tagsSchema);
exports.default = Tag;
const blogTags = new mongoose_1.Schema({
    blogId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: blogs_model_1.default,
        required: true
    },
    tagId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: Tag,
        required: true
    }
});
const Blogs = (0, mongoose_1.model)("Blogs", blogTags);
tagsSchema.index({ blogId: 1, tagId: 1 }, { unique: true });
