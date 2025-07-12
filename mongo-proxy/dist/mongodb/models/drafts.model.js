"use strict";
/***
 * NO NEED TO CREATE DRAFTS DB
 * POSTGRES IS TAKING CARE OF IT
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const users_model_1 = __importDefault(require("./users.model"));
const DraftsSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: users_model_1.default,
        required: true,
        unique: true
    },
    drafts: [String]
});
const Drafts = (0, mongoose_1.model)("Schema", DraftsSchema);
exports.default = Drafts;
