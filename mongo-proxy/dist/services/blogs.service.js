"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBlogs = void 0;
function createBlogs(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { title, body, userId, isDeleted, slug, excerpt, images, isPublished, wordCount, createdAt } = req.body;
        if (!title || !body || !userId || !isDeleted || !slug || !excerpt || !images || !isPublished || !wordCount || !createdAt) {
            return res.json({ status: 404, message: "Fields are missing" });
        }
        let blogData = {
            title,
            body,
            userId,
            isDeleted,
            slug,
            excerpt,
            images, isPublished,
            wordCount,
            createdAt
        };
        console.log(blogData);
    });
}
exports.createBlogs = createBlogs;
