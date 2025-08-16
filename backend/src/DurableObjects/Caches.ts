import { Context } from "hono";
import { getPrismaClient } from "../routes/blog";
import { Blog } from "../types/types";
import { DurableObject } from "cloudflare:workers";
import { Env } from "../types/types";

// Done
/*
 *  After every 10 minutes the data will be updated
 *  Three things will be
 *  1. Trending data updated
 *  2. Blog data in itself updates
 *  3. recent also updates
 *       1. Top 5-6 blog with highest views go to hot
 *       2. rest will go to cold or recent
 */

export async function onScheduled(c: Context) {
  console.log("Running scheduled job to refresh blog cache");

  const { recent, blog } = await BlogsProcessor(c);
  await c.env.Blog_cache.put("hot", JSON.stringify(blog.map((b) => b.id)));
  
  for (const doc of blog) {
    const reactions = await fetchReactionsFromDO(c.env, doc.id);
    await c.env.Blog_cache.put(
      `blog:${doc.id}`,
      JSON.stringify({ ...doc, reactions })
    );
  }

  await c.env.Blog_cache.put("recent", JSON.stringify(recent));

  
  console.log("Blog cache refreshed");
}
async function BlogsProcessor(c: Context) {
  let recent: Array<string> = [];
  let staticBlogData = [];
  const prisma = getPrismaClient(c, true);
  const blog = await prisma.blog.findMany({
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
      comments: true,
      reactions: true,
      _count: { select: { comments: true, bookmarks: true } },
    },
    orderBy: { views: "desc" },
  });
  for (let doc of blog) {
    let timeInHrs =
      (new Date().getTime() - new Date(doc.createdAt).getTime()) /
      (1000 * 60 * 60);
    if (timeInHrs < 5) {
      recent.push(doc.id);
    }
    const { comments, reactions, ...rest } = doc;
  }

  return { recent, blog };
}

async function fetchReactionsFromDO(
  env: Env,
  blogId: string
): Promise<{ likes: number; applause: number; laugh: number }> {

  const id = env.Blog_DD.idFromName(blogId);
  const stub = env.Blog_DD.get(id);

  const res = await stub.fetch("https://fake-url/get-engagement");
  const data: {
    likes: number;
    applause: number;
    laugh: number;
  } = await res.json();
  console.log(data);

  return data;
}
