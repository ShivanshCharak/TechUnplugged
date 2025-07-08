import { createBlogInput, updateBlogInput } from "@100xdevs/medium-common";
import { cors } from "hono/cors";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import OpenAI from "openai/index.mjs";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    OPENAI_API_KEY: string;
  },
  Variables: {
    userId: string;
  }
}>();

// -------------------- MIDDLEWARE --------------------
// blogRouter.use(
//   "/*",
//   cors({
//     origin: "*",
//     // allowMethods: ["GET", "POST", "PUT", "OPTIONS"],
//     // allowHeaders: ["Content-Type", "Authorization"]
//   }),
//   // async (c, next) => {
//   //   const authHeader = c.req.header("authorization") || "";
//   //   const token = authHeader.split(' ')[1]
//   //   console.log(token)
//   //   try {
//   //     const user = await verify(token, c.env.JWT_SECRET);
//   //     console.log(user)
//   //     if (user) {
//   //       c.set("userId", user.id);
//   //       await next();
//   //     } else {
//   //       c.status(403);
//   //       return c.json({ message: "You are not logged in" });
//   //     }
//   //   } catch {
//   //     c.status(403);
//   //     return c.json({ message: "You are not logged in" });
//   //   }
//   // }
// );

// -------------------- CHATBOT --------------------
blogRouter.post("/chatbot", async (c) => {
  const body = await c.req.json();
  const userMessage = body.message;

  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1", 
    apiKey: c.env.OPENAI_API_KEY
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userMessage }],
    });

    return c.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI error:", err);
    c.status(500);
    return c.json({ error: "Something went wrong with the chatbot" });
  }
});

// -------------------- CREATE BLOG --------------------
blogRouter.post("/", async (c) => {
  const body = await c.req.json();
  const { success } = createBlogInput.safeParse(body);

  if (!success) {
    c.status(411);
    return c.json({ message: "Inputs not correct" });
  }

  const authorId = c.get("userId");

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const blog = await prisma.blog.create({
    data: {
      title: body.title,
      content: body.content,
      url: body.url,
      authorId: Number(authorId),
    },
  });

  return c.json({ id: blog.id });
});

// -------------------- UPDATE BLOG --------------------
blogRouter.put("/", async (c) => {
  const body = await c.req.json();
  const { success } = updateBlogInput.safeParse(body);

  if (!success) {
    c.status(411);
    return c.json({ message: "Inputs not correct" });
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

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
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const blogs = await prisma.blog.findMany({
    select: {
      content: true,
      title: true,
      id: true,
      url: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  return c.json({ blogs });
});

// -------------------- GET SINGLE BLOG --------------------
blogRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blog = await prisma.blog.findFirst({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        title: true,
        content: true,
        url: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    return c.json({ blog });
  } catch (e) {
    c.status(411);
    return c.json({ message: "Error while fetching blog post" });
  }
});
