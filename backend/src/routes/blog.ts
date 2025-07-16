// Updated blogRouter with environment bindings and better client management for Cloudflare Workers + Hono
import { Groq } from "groq-sdk/index.mjs";
import { Hono } from "hono";
import { createBlogInput, updateBlogInput } from "@100xdevs/medium-common";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

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
    datasourceUrl: c.env.DATABASE_URL,
    // useReplica ? c.env.DATABASE_URL_REPLICA_1 : 
  }).$extends(withAccelerate());
}


function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') 
    .replace(/\s+/g, '-')  
    .replace(/--+/g, '-') 
    .trim();
}


function countWords(content: any): number {
  if (typeof content === 'string') {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
  if (typeof content === 'object') {
    
    const textContent = JSON.stringify(content).replace(/[{}[\]",:]/g, ' ');
    return textContent.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
  return 0;
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
blogRouter.post("/create", async (c) => {
  console.log("Creating blog");
  const body = await c.req.json();
  console.log(body)
  // const { success } = createBlogInput.safeParse
  
  // if (!success) return c.json({ message: "Inputs not correct" }, 411);

  const prisma = getPrismaClient(c);
  
  try {
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

    return c.json({ id: blog.id, slug: blog.slug });
  } catch (error) {
    console.error("Error creating blog:", error);
    return c.json({ message: "Error creating blog" }, 500);
  }
});

// -------------------- UPDATE BLOG --------------------
blogRouter.put("/", async (c) => {
  const body = await c.req.json();
  const { success } = updateBlogInput.safeParse(body);
  
  if (!success) return c.json({ message: "Inputs not correct" }, 411);

  const prisma = getPrismaClient(c);
  
  try {
    const updateData: any = {
      title: body.title,
      body: body.content,
    };

    
    if (body.title) {
      updateData.slug = generateSlug(body.title);
    }

    
    if (body.content) {
      updateData.wordCount = countWords(body.content);
    }

    
    if (body.excerpt) {
      updateData.excerpt = body.excerpt;
    }

    
    if (typeof body.isPublished === 'boolean') {
      updateData.isPublished = body.isPublished;
    }

    const blog = await prisma.blog.update({
      where: { id: body.id },
      data: updateData,
    });

    return c.json({ id: blog.id, slug: blog.slug });
  } catch (error) {
    console.error("Error updating blog:", error);
    return c.json({ message: "Error updating blog" }, 500);
  }
});

// -------------------- GET BLOGS --------------------
blogRouter.get("/bulk", async (c) => {
  const prisma = getPrismaClient(c, true);
  
  try {
    const blogs = await prisma.blog.findMany({
      where: {
        isDeleted: false,
        isPublished: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            createdAt: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: { 
                id: true,
                name: true 
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
            user: {
              select: {
                firstname: true,
                lastname: true,
              },
            },
          },
          where: {
            replyToId: null, // Only get top-level comments
          },
          take: 5, 
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return c.json({ 
      message: "Fetched successfully", 
      blogs: blogs.map(blog => ({
        ...blog,
        author: {
          id: blog.user.id,
          name: `${blog.user.firstname} ${blog.user.lastname}`.trim(),
          email: blog.user.email,
          createdAt: blog.user.createdAt,
        },
        user: undefined, // Remove the user object since we're using author
      }))
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return c.json({ message: "Error fetching blogs" }, 500);
  }
});

// -------------------- GET SINGLE BLOG --------------------
blogRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const prisma = getPrismaClient(c, true);

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
        tags: {
          include: {
            tag: {
              select: { 
                id: true,
                name: true 
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
          orderBy: {
            createdAt: 'desc',
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
      author: {
        id: blog.user.id,
        name: `${blog.user.firstname} ${blog.user.lastname}`.trim(),
        email: blog.user.email,
        userInfo: blog.user.userInfo,
      },
      user: undefined, 
    };

    return c.json({ blog: formattedBlog });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return c.json({ message: "Error while fetching blog post" }, 500);
  }
});

// -------------------- GET BLOG BY SLUG --------------------
blogRouter.get("/slug/:slug", async (c) => {
  const slug = c.req.param("slug");
  const prisma = getPrismaClient(c, true);

  try {
    const blog = await prisma.blog.findUnique({
      where: { 
        slug: slug,
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        body: true,
        images: true,
        createdAt: true,
        views: true,
        wordCount: true,
        isPublished: true,
        userId: true,
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
        tags: {
          include: {
            tag: {
              select: { 
                id: true,
                name: true 
              },
            },
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

    
    await prisma.blog.update({
      where: { id: blog.id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    
    const formattedBlog = {
      ...blog,
      author: {
        id: blog.user.id,
        name: `${blog.user.firstname} ${blog.user.lastname}`.trim(),
        email: blog.user.email,
        userInfo: blog.user.userInfo,
      },
      user: undefined,
    };

    return c.json({ blog: formattedBlog });
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    return c.json({ message: "Error while fetching blog post" }, 500);
  }
});