// Updated blogRouter with environment bindings and better client management for Cloudflare Workers + Hono

import { Hono, Context } from "hono";
import { createBlogInput, updateBlogInput } from "@100xdevs/medium-common";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Blog } from "../types/types";

import { onScheduled } from "../DOSync/Caches";
import consumer from "../consumer";
import { raw } from "@prisma/client/runtime/library";
interface Bindings {
  DATABASE_URL: string;
  DATABASE_URL_REPLICA_1: string;
  JWT_SECRET: string;
  GROQ_API_KEY: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  Blog_cache: KVNamespace;
  Blog_queue:DurableObjectNamespace;
  Blog_DD: DurableObjectNamespace;
}
interface Variables {
  userId: string;
}

export const blogRouter = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

export function getPrismaClient(c: Context, useReplica: boolean = false) {
  return new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
    // useReplica ? c.env.DATABASE_URL_REPLICA_1 :
  }).$extends(withAccelerate());
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export function countWords(content: any): number {
  if (typeof content === "string") {
    return content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }
  if (typeof content === "object") {
    const textContent = JSON.stringify(content).replace(/[{}[\]",:]/g, " ");
    return textContent
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }
  return 0;
}

// -------------------- CREATE BLOG --------------------
blogRouter.post("/create", async (c) => {
  const prisma = getPrismaClient(c);
  try {
    const body = await c.req.json();

    const slug = generateSlug(body.title);
    const wordCount = countWords(body.content);

    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        slug: slug,
        excerpt: body.excerpt || null,
        body: body.description,
        images: body.url || "",
        userId: body.id,
        wordCount: wordCount,
        isPublished: body.isPublished || false,
      },
    });

    let user = await prisma.user.findFirst({
      where: {
        id: blog.userId,
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        userInfo: {
          select: {
            avatar: true,
            intro: true,
            tech: true,
          },
        },
      },
    });
    let blogData = {
      ...blog,
      ...user,
    };


    await c.env.Blog_cache.put(`blog:${blog.id}`, JSON.stringify(blogData));
    console.log("latest",await c.env.Blog_cache.get(`blog:${blog.id}`))

    let rawIds = (await c.env.Blog_cache.get("recent")) ?? JSON.stringify([]);

    let blogIds: string[] = rawIds? JSON.parse(rawIds):[]
    blogIds.push(blog.id)

    await c.env.Blog_cache.put("recent", JSON.stringify(blogIds));

    console.log("Updated recent blog IDs:", blogIds,await c.env.Blog_cache.get('recent'));

    return c.json({ id: blog.id, slug: blog.slug });
  } catch (error) {
    console.error("Error creating blog:", error);
    return c.json({ message: "Error creating blog" }, 500);
  }
});

async function searchBlogs(c: Context, query: string, limit = 10, offset = 0) {
  console.log;
  const searchQuery = query.trim().split(/\s+/).join(" & ");
  const prisma = getPrismaClient(c, true);

  return await prisma.$queryRaw`
    SELECT id,
       title,
       views,
       ts_rank_cd(ts, to_tsquery('english', 'AWS')) AS rank
        FROM "Blog"
        WHERE ts @@ to_tsquery('english', 'AWS')
          AND "isPublished" = true
          AND "isDeleted" = false
        ORDER BY rank DESC, views DESC
        LIMIT 10 OFFSET 0;
  `;
}

blogRouter.get("/search", async (c) => {
  console.log("search");
  const prisma = getPrismaClient(c, true);
  const query = c.req.query("q");

  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "10");

  if (!query || query.trim().length === 0) {
    return Response.json({ blogs: [], total: 0 });
  }

  try {
    const offset = (page - 1) * limit;
    const blogs = await searchBlogs(c, query, limit, offset);

    // Get total count for pagination
    const totalResult = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "Blog" b
      WHERE 
        b."searchVector" @@ to_tsquery('english', ${query
          .trim()
          .split(/\s+/)
          .join(" & ")})
        AND b."isPublished" = true
        AND b."isDeleted" = false
    `;

    const total = Number((totalResult as any)[0]?.count || 0);

    return Response.json({
      blogs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Search error:", error);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
});

blogRouter.get("/trigger-schedule", async (c: Context) => {
  try {
    await onScheduled(c);
    // await consumer.scheduled(c.env);

    return c.json({ message: "Scheduled task triggered successfully." }, 200);
  } catch (error) {
    console.error("Error manually triggering scheduled task:", error);
    return c.json(
      { message: "Failed to trigger scheduled task", error: error.message },
      500
    );
  }
});


blogRouter.get("/recent", async (c) => {
  
  try {
    const recentBlogs = await c.env.Blog_cache.get("recent");
    if (recentBlogs) {
      let blogs: Array<string> = await JSON.parse(recentBlogs);
      console.log("recentBlogs",blogs)
      blogs = blogs.map((val) => c.env.Blog_cache.get(`blog:${val}`));

      blogs = await Promise.all(blogs);
      console.log(blogs)
      blogs = blogs.map((val) => (val ? JSON.parse(val) : ""));
      return c.json({ message: "Recent blogs", blogs }, 200);
    }
    return c.json({message:"No recent blog was found"},208)
  } catch (error) {
    return c.json({message:"Something went wrong while getting recent"},500)
  }
});

// -------------------- GET BLOGS --------------------
blogRouter.get("/bulk", async (c) => {
  try {
    const prisma = getPrismaClient(c, true);
    let blogs = await c.env.Blog_cache.get("hot");
    if (blogs) {
      let blogIds: Array<Blog> = await JSON.parse(blogs);
      let feed = blogIds.map((val, index) => {
        return c.env.Blog_cache.get(`blog:${val}`);
      });
      const data = await Promise.all(feed);
      const parsedData = data.map((item) => (item ? JSON.parse(item) : null));
      return c.json({
        message: "Blogs fetched succesfully",
        blogs: parsedData,
      });
    }
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return c.json({ message: "Error fetching blogs" }, 500);
  }
});

// // -------------------- GET SINGLE BLOG --------------------
blogRouter.get("/:id", async (c) => {
  console.log(await c.env.Blog_cache.get("recent"));
  const id = c.req.param("id");
  const prisma = getPrismaClient(c, true);

  const blog = await c.env.Blog_cache.get(`blog:${id}`);
  if (blog) {
    return c.json({ message: `Cache hit`, blog: JSON.parse(blog) }, 200);
  }
  try {
    await prisma.blog.update({
      where: { id: id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    const blog = await prisma.blog.findUnique({
      where: {
        id: id,
        isDeleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            userInfo: {
              select: {
                avatar: true,
                intro: true,
                tech: true,
              },
            },
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            userId: true,
            replyToId: true,
            user: {
              select: {
                firstname: true,
                lastname: true,
              },
            },
            replies: {
              select: {
                id: true,
                content: true,
                createdAt: true,
                userId: true,
                user: {
                  select: {
                    firstname: true,
                    lastname: true,
                  },
                },
              },
            },
          },
          where: {
            replyToId: null, // Only get top-level comments
          },
        },
        reactions: {
          select: {
            likes: true,
            applause: true,
            laugh: true,
          },
        },
        _count: {
          select: {
            comments: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!blog) {
      return c.json({ message: "Blog not found" }, 404);
    }

    const formattedBlog = {
      ...blog,
      user: {
        id: blog.user.id,
        name: `${blog.user.firstname} ${blog.user.lastname}`.trim(),
        email: blog.user.email,
        userInfo: blog.user.userInfo,
      },
    };
    await c.env.Blog_cache.put(`blog:${id}`, JSON.stringify(formattedBlog));
    return c.json({ blog: formattedBlog });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return c.json({ message: "Error while fetching blog post" }, 500);
  }
});

blogRouter.post("/comment", async (c) => {
  try {
    const commentData = await c.req.json();
    const prisma = getPrismaClient(c, true);

    // Validate required fields
    if (!commentData.blogId || !commentData.userId || !commentData.content) {
      return c.json(
        {
          message: "Missing required fields: blogId, userId, or content",
        },
        400
      );
    }

    // Save to database using Prisma
    const savedComment = await prisma.comment.create({
      data: {
        blogId: commentData.blogId,
        userId: commentData.userId,
        content: commentData.content,
        replyToId: commentData.replyToId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          },
        },
        replies: true,
      },
    });

    // Format the response to match frontend expectations
    const formattedComment = {
      id: savedComment.id,
      blogId: savedComment.blogId,
      userId: savedComment.userId,
      content: savedComment.content,
      createdAt: savedComment.createdAt.toISOString(),
      replyToId: savedComment.replyToId,
      user: {
        firstname: savedComment.user.firstname,
        lastname: savedComment.user.lastname,
      },
      _pendingSync: false,
      _syncFailed: false,
    };

    return c.json(formattedComment, 200);
  } catch (error) {
    console.error("Error saving comment:", error);
    return c.json(
      {
        message: "Failed to save comment",
        error: error,
      },
      500
    );
  }
});
let batch: { blogId: string; like: number; applause: number; smile: number }[] =
  [];

blogRouter.post("/reactions", async (c) => {
  try {

    const prisma = getPrismaClient(c, true);
    
    const {
      blogId,
      like = 0,
      applause = 0,
      smile = 0,
    }: {
      blogId: string;
      like: number;
      applause: number;
      smile: number;
    } = await c.req.json();
    const id = c.env.Blog_DD.idFromName("03415b9c-825b-452a-9882-274c641adca2")
    console.log(id)
    const stub = c.env.Blog_DD.get(id)
    const response = await stub.fetch('https://do/reaction',{
      method:"POST",
      body:JSON.stringify({blogId,like,applause,smile}),
      headers:{"Content-Type":"application/json"}
    })
    const result = await response.text()
    return c.json(result)

    batch.push({ blogId, like, applause, smile });
    console.log("Current batch:", batch);

    if (batch.length >= 3) {
      const promises = batch.map((b) =>
        prisma.reaction.upsert({
          where: { blogId: b.blogId },
          update: {
            likes: { increment: b.like },
            applause: { increment: b.applause },
            laugh: { increment: b.smile },
          },
          create: {
            blogId: b.blogId,
            likes: b.like,
            applause: b.applause,
            laugh: b.smile,
          },
        })
      );

      const saved = await Promise.all(promises);

      batch = [];

      return c.json({ message: "Saved successfully", saved }, 200);
    }

    // If batch not yet full, acknowledge but don't save
    return c.json({ message: "Queued in batch" }, 202);
  } catch (error) {
    console.error(error);
    return c.json(
      { message: "Something went wrong", error: String(error) },
      400
    );
  }
});
