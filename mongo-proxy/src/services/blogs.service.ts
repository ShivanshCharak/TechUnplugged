import mongoose from "mongoose"
import { TBlogSchema } from "../types"
import { Request, Response } from 'express'

export async function createBlogs(req: Request, res: Response) {
    const { title, body, userId, isDeleted, slug, excerpt, images, isPublished, wordCount, createdAt } = req.body
    if (!title || !body || !userId || !isDeleted || !slug || !excerpt || !images || !isPublished || !wordCount || !createdAt) {
        return res.json({ status: 404, message: "Fields are missing" })
    }
    let blogData: TBlogSchema={
        title,
        body,
        userId,
        isDeleted,
        slug,
        excerpt,
        images,isPublished,
        wordCount,
        createdAt
    }
    


}