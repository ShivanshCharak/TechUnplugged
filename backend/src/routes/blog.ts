// Updated blogRouter with environment bindings and better client management for Cloudflare Workers + Hono
import { Groq } from "groq-sdk/index.mjs";
import { Hono } from "hono";
import { createBlogInput, updateBlogInput } from "@100xdevs/medium-common";
import { cors } from "hono/cors";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";

export const blogRouter = new Hono<{
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


function getPrismaClient(c: any, useReplica: boolean = false) {
  return new PrismaClient({
    datasourceUrl: useReplica ? c.env.DATABASE_URL_REPLICA_1 : c.env.DATABASE_URL,
  }).$extends(withAccelerate());
}

// -------------------- CHATBOT --------------------
blogRouter.post("/chatbot", async (c) => {
  const body = await c.req.json();
  const userMessage = body.message;
  if (!userMessage) return c.json({ error: "Message is required" }, 400);

  try {
    const groq = new Groq({ apiKey: c.env.GROQ_API_KEY });
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: userMessage }],
      model: "llama3-70b-8192",
    });

    return c.json({
      response: chatCompletion.choices[0]?.message?.content || "No response",
    });
  } catch (error) {
    console.error("Error in chatbot endpoint:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// -------------------- CREATE BLOG --------------------
blogRouter.post("/", async (c) => {
    console.log("hitting")
  const body = await c.req.json();
  const { success } = createBlogInput.safeParse(body);
  if (!success) return c.json({ message: "Inputs not correct" }, 411);
 


  const prisma = getPrismaClient(c);
  const blog = await prisma.blog.create({
    data: {
      title: body.title,
      body:body.content,
      images: body.url,
      userId: Number(body.id),
    },
  });
  return c.json({ id: blog.id });
});

// -------------------- UPDATE BLOG --------------------
blogRouter.put("/", async (c) => {
  const body = await c.req.json();
  const { success } = updateBlogInput.safeParse(body);
  if (!success) return c.json({ message: "Inputs not correct" }, 411);

  const prisma = getPrismaClient(c);
  const blog = await prisma.blog.update({
    where: { id: body.id },
    data: {
      title: body.title,
      content: body.content,
    },
  });
  return c.json({ id: blog.id });
});

// -------------------- GET BLOGS --------------------
blogRouter.get("/bulk", async (c) => {
  const prisma = getPrismaClient(c, true);
  const blogs = await prisma.blogs.findMany({
    select: {
      title: true,
      body: true,
      id: true,
      author_id: true,
      slug: true,
      excerpt: true,
      images: true,
    },
    include: {
      user: {
        select: {
          firstname: true,
          lastname: true,
          createdAt: true,
          email: true,
        },
      },
      blog_tags: {
        include: {
          tag: {
            select: { name: true },
          },
        },
      },
      comments: {
        select: {
          comment: true,
          createdAt: true,
          user_id: true,
        },
      },
      reactions: true,
    },
  });
  return c.json({ message: "Fetched successfully", blogs });
});

// -------------------- GET SINGLE BLOG --------------------
blogRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const prisma = getPrismaClient(c, true);
  try {
    const blog = await prisma.blogs.findFirst({
      where: { id: Number(id) },
      select: {
        id: true,
        title: true,
        body: true,
        images: true,
        author: {
          select: { name: true },
        },
      },
    });
    return c.json({ blog });
  } catch (e) {
    return c.json({ message: "Error while fetching blog post" }, 411);
  }
});
