import { Hono } from "hono";
import { createBlogInput, updateBlogInput } from "@100xdevs/medium-common";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import {Draft,Blog} from '../types/types'
import { generateSlug,countWords } from "./blog";



export const bookmarksRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    DATABASE_URL_REPLICA_1: string;
    JWT_SECRET: string;
    GROQ_API_KEY: string;
  };
  Variables: {
    userId: string;
  };
}>();

export function getPrismaClient(c: any, useReplica: boolean = false) {
  return new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
    // useReplica ? c.env.DATABASE_URL_REPLICA_1 : 
  }).$extends(withAccelerate());
}
bookmarksRouter.post("/save",(async(c)=>{
 try {
   const {bookmarks}:{bookmarks:[]} = await c.req.json()
   const prisma = getPrismaClient(c,true)
   const data = await prisma.bookmark.createMany({
     data:bookmarks,
     skipDuplicates:true,
   })
   if(!data){
    return c.json({message:"Somehting went wrong while saving the code"},300)
   }
   return c.json({message:"Bookmarks saved",bookmarks},200)
 } catch (error) {
  return c.json({message:"Something went wrong",error},500)
 }
}))
bookmarksRouter.post("/unsave",(async(c)=>{
 try {
   const {bookmarks}:{bookmarks:[]} = await c.req.json()
   const prisma = getPrismaClient(c,true)
    await prisma.$transaction(
      bookmarks.map(({ userId, blogId }) =>
        prisma.bookmark.deleteMany({
          where: {
            userId,
            blogId,
          },
        })
      )
    );
  
   return c.json({message:"Bookmarks unsaved",bookmarks},200)
 } catch (error) {
  return c.json({message:"Something went wrong",error},500)
 }
}))

