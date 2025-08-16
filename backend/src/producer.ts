import { Context } from "hono";
import { Env } from "./types/types";

export default {
  async fetch(c: Context<Env>): Promise<Response> {
    const url = new URL(c.req.url);

    if (url.pathname === "/api/v1/draft/create") {
      const data = await c.req.json();

      await c.env.BLOG_QUEUE.fetch("https://queue/push", {
        method: "POST",
        body: JSON.stringify({
          id: data.id,
          type: "draftUpdate",
          payload: data
        })
      });

      return new Response(JSON.stringify({ success: true, queued: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response("OK");
  }
};
