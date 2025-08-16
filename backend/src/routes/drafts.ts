import { Hono } from "hono";
import { createBlogInput, updateBlogInput } from "@100xdevs/medium-common";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Draft, Blog } from "../types/types";
import { generateSlug, countWords } from "./blog";
import consumer from "../consumer";

import { Env } from "hono";
import { Context } from "hono";

export const draftRouter = new Hono<{
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

draftRouter.post("/create", async (c) => {
  try {
    const reqBody = await c.req.json();
    const { userId, blog } = reqBody;
    const prisma = getPrismaClient(c, true);

    const slug = generateSlug(blog.title);
    const wordCount = countWords(blog.description);
    await prisma.$transaction(async (tx) => {
      const existingBlog = await tx.blog.findUnique({ where: { slug } });
      let blogRecord;
      if (existingBlog) {
        blogRecord = await tx.blog.update({
          where: { slug },
          data: {
            title: blog.title,
            body: blog.description,
            images: blog.imageUrl,
            wordCount,
            isPublished: false
          }
        });
      } else {

        blogRecord = await tx.blog.create({
          data: {
            title: blog.title,
            userId,
            slug,
            images: blog.imageUrl,
            body: blog.description,
            wordCount,
            isPublished: false
          }
        });
      }
      console.log(existingBlog)

      const existingDraft = await tx.draft.findUnique({
        where: { userId_blogId: { userId, blogId: blogRecord.id } }
      });
      

      if (!existingDraft) {
        await tx.draft.create({
          data: { userId, blogId: blogRecord.id }
        });
      }
    });

    return c.json({ message: "Blog saved successfully" }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ message: `Something went wrong while saving: ${error}` }, 500);
  }
});


draftRouter.delete("/", async (c) => {
  const {userId, draftId} =  c.req.query()
  console.log(c.req.query())


  const prisma = getPrismaClient(c, true);
  if (!draftId || !userId) {
    return c.json({ message: "Blogid and userid bith is required" }, 500);
  }
  try {

      const user = await prisma.user.findFirst({
        where: {
          id: userId,
        },
      });
      if (!user) {
        throw new Error("No user found");

      }
      const draftData = await prisma.draft.findFirst({
        where:{
          id:draftId
        }
      })
      if(!draftData?.blogId){
        throw new Error("Blog id is undfined")
      }
      
      const isDeleted = await prisma.blog.delete({
        where: {
          id: draftData.blogId,
        }
      });
      console.log(isDeleted)

    return c.json({ message: `Blog with d} Deleted ` }, 200);
  } catch (error) {
    return c.json({ message: `Draft not deleted sucessfully${error}` }, 500);
  }
});
draftRouter.get("/bulk/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const prisma = getPrismaClient(c, true);

    const data = await prisma.draft.findMany({
      where: {
        userId,
        blog: { isDeleted: false },
      },
      include: { blog: true },
    });
    console.log("data",data)

    return c.json({ message: "Successfully fetched", data }, 200);
  } catch (error) {
    console.error(error);
    return c.json(
      { message: `Something went wrong while getting the drafts: ${(error as Error).message}` },
      500
    );
  }
});
draftRouter.get("/draft/:draftId", async (c) => {
  try {
    const userId = c.req.param("draftId");
    const prisma = getPrismaClient(c, true);

    const data = await prisma.draft.findFirst({
      where: {
        userId,
        blog: { isDeleted: false },
      },
      include: { blog: true },
    });
    console.log(data)

    return c.json({ message: "Successfully fetched", data }, 200);
  } catch (error) {
    console.error(error);
    return c.json(
      { message: `Something went wrong while getting the drafts: ${(error as Error).message}` },
      500
    );
  }
});

draftRouter.get("/bulk/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const prisma = getPrismaClient(c, true);

    const data = await prisma.draft.findMany({
      where: {
        userId,
        blog: { isDeleted: false },
      },
      include: { blog: true },
    });
    console.log(data)

    return c.json({ message: "Successfully fetched", data }, 200);
  } catch (error) {
    console.error(error);
    return c.json(
      { message: `Something went wrong while getting the drafts: ${(error as Error).message}` },
      500
    );
  }
});


