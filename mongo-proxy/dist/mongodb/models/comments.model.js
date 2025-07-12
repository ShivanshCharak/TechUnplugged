"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const blogs_model_1 = __importDefault(require("./blogs.model"));
const users_model_1 = __importDefault(require("./users.model"));
const CommentsSchema = new mongoose_1.Schema({
    blogId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: blogs_model_1.default,
        required: true,
        index: true
    },
    comments: [{
            userId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: users_model_1.default,
                required: true
            },
            comment: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
    replies: [{
            userId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: users_model_1.default,
                required: true
            },
            blogId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: blogs_model_1.default,
                required: true
            },
            comment: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }]
}, {
    timestamps: true
});
CommentsSchema.index({ blogId: 1, createdAt: -1 });
const Comment = (0, mongoose_1.model)("Comment", CommentsSchema);
exports.default = Comment;
