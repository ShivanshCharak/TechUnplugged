import { Request,Response } from "express";
import Blog from "../models/blogs.model";
import { TBlogSchema } from "../types";
import Reaction from "../models/reaction.model";
import Comment from "../models/comments.model";
import Reply from '../models/replies.model'
import { RedisManager } from "../utils/RedisManager";

import mongoose from "mongoose";
export async function createBlogs(req:Request,res:Response){
    const {title,body,userId,images}:TBlogSchema =req.body
    try {

        if(!title||!body||!userId||!images){
            return res.status(403).json({message:"All fields are required"})
        }
        let slug:string = title.split(" ").join("-")
        let excerpt:string = body.slice(0,100)
    
        const data  = await Blog.create({
            title,
            body,
            userId,
            images,
            slug,
            excerpt,
            isPublished:true,
            createdAt:new Date()
        })
        const redisClient = new RedisManager().pushStreams("BLOG-CREATED",JSON.stringify(data))
        
        // redisClient.publish("BLOG_CREATED",JSON.stringify(data))
        res.json({status:200,message:`Blog publisdhed Successfully ${data}`})
} catch (error) {
    res.json({error:error,message:"Errir occured while creating blogs",status:500})
}
}
export async function blogReactions(req:Request, res:Response){
   try {
    const {likes,applause, laugh,blogId} = req.body
    if(!likes||!applause||!laugh||!blogId){
     return res.status(400).json({message:"likes, applause, laugh needed"})
    }
    const updateOps: Record<string, any>={}
    if(likes) updateOps.$inc={...(updateOps.$inc||{}),likes:Number(likes)}
    if(applause) updateOps.$inc={...(updateOps.$inc||{}),applause:Number(applause)}
    if(laugh) updateOps.$inc={...(updateOps.$inc||{}),likes:Number(laugh)}
    const updatedReaction = await Reaction.findOneAndUpdate(
        { blogId: new mongoose.Types.ObjectId(blogId) }, // Query by blogId
        {
            ...updateOps,
            $setOnInsert: { blogId: new mongoose.Types.ObjectId(blogId) }
        },
        {
            new: true,
            upsert: true
        }
    );
    res.status(200).json({message:`Reactions updated new Likes ${updatedReaction}`})
    
   } catch (error) {
    console.error(error)
    res.status(400).json({message:`Error occured while updating  reactions`})
    
   }
}
export async function Comments(req:Request, res:Response){
    try {
        const {blogId, text, userId} = req.body
        if(!blogId||!text||!userId){
         return res.status(400).json({message:"Blog comments and replied needed"})
        }
        const comments = await Comment.create({
            blogId,
            userId,
           text,
        })
        res.status(200).json({message:`Comments updated new comments ${comments}`})
        
       } catch (error) {
        console.error(error)
        res.status(400).json({message:`Error occured while updating  reactions`})
        
       }
}

export async function Replies(req: Request, res: Response) {
    try {
        const { commentId, userId, text } = req.body; // Changed from 'replies' to 'text'

        if (!commentId || !userId || !text) {
            return res.status(400).json({ message: "All fields required" });
        }

        if (!mongoose.Types.ObjectId.isValid(commentId) || 
            !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        const newReply = {
            text: text, // Required by your schema
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: new Date()
        };

        const result = await Reply.findOneAndUpdate(
            { commentId: new mongoose.Types.ObjectId(commentId) },
            {
                $push: { replies: newReply },
                $setOnInsert: {
                    commentId: new mongoose.Types.ObjectId(commentId),
                    createdAt: new Date()
                }
            },
            { new: true, upsert: true, runValidators: true }
        );

        return res.status(201).json({
            message: "Reply added successfully",
            reply: result?.replies?.slice(-1)[0] // Return the last added reply
        });

    } catch (error) {
        console.error("Error adding replies:", error);
        
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ 
                message: "Validation failed",
                errors: error.errors 
            });
        }

        return res.status(500).json({ 
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
}