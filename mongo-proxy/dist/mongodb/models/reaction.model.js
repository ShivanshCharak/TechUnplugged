"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ReactionSchema = new mongoose_1.Schema({
    blogId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Blog",
        required: true
    },
    type: {
        type: String,
        enums: ['like', 'applause', 'laugh'],
        required: true
    }
});
ReactionSchema.index({ blogId: 1, type: 1 }, { unique: true });
const Reaction = (0, mongoose_1.model)("Reaction", ReactionSchema);
exports.default = Reaction;
