import { Hono } from "hono";
import { createBlogInput, updateBlogInput } from "@100xdevs/medium-common";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Draft, Blog } from "../types/types";
import { generateSlug, countWords } from "./blog";

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
    let draftData: Draft = await c.req.json();
    console.log(draftData);
    const prisma = getPrismaClient(c, true);
    await prisma.$transaction(async (tx) => {

      let body = draftData.Blog;
      const slug = generateSlug(body.title);
      const wordCount = countWords(body.body);
      // IF User is aunthenticated  do this
      const blog = await tx.blog.create({
        data: {
          title: draftData.Blog.title,
          userId: draftData.Blog.userId,
          slug: slug,
          images: draftData.Blog.images,
          body: draftData.Blog.body,
          wordCount: wordCount,
        },
      });

      if (!blog) {
        console.error(
          `Something went wrong while saving the blog. try Again ${draftData.userId}`
        );
      }

      const isDraftCreated = await tx.draft.create({
        data: {
          blogId: blog.id,
          userId: draftData.userId,
        },
      });
      if (!isDraftCreated) {
        console.error(
          `Something went wrong while saving the draft. try Again ${draftData.userId}`
        );
      }
      console.log(isDraftCreated);
    });
    return c.json(
      {
        message: `Blog saved successfully`,
      },
      200
    );
  } catch (error) {
    return c.json(
      {
        message: `Something went wrong while saving ${error}`,
      },
      500
    );
  }
});

draftRouter.delete("/delete", async (c) => {
  const { blogId, userId } = await c.req.json();
  const prisma = getPrismaClient(c, true);
  if (!blogId && !userId) {
    return c.json({ message: "Blogid and userid bith is required" }, 500);
  }

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirst({
        where: {
          id: userId,
        },
      });
      if (!user) {
        console.error({ message: "No user exist" }, 402);
      }
      const isDeleted = await tx.blog.update({
        where: {
          id: blogId,
        },
        data: {
          isDeleted: true,
        },
      });
      if (!isDeleted) {
        console.error({
          message: `Blog ${blogId} Is not deleted something went wrong`,
        });
      }
    });
    return c.json({ message: `Blog with ${blogId} Deleted ` }, 200);
  } catch (error) {
    return c.json({ message: `Draft deleted sucessfully${error}` }, 402);
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

draftRouter.put("/update/:draftId", async (c) => {
  const { body, userId, blogId } = await c.req.json();
  const draftId = c.req.param("draftId");

  if (!blogId || !body) {
    return c.json({ message: "BlogId and body are required" }, 400);
  }

  const prisma = getPrismaClient(c);

  try {
    const slug = generateSlug(body.title);
    const wordCount = countWords(body.content);

    const blog = await prisma.$transaction(async (tx) => {
      return tx.draft.update({
        where: {
          id: draftId,
          userId: { equals: userId },
        },
        data: {
          blog: {
            update: {
              title: body.title,
              userId: body.userId,
              slug,
              images: body.images,
              body: body.body,
              wordCount,
            },
          },
        },
      });
    });

    return c.json({ blog });
  } catch (error) {
    console.error("Error updating blog:", error);
    return c.json(
      { message: `Error updating blog: ${(error as Error).message}` },
      500
    );
  }
});
