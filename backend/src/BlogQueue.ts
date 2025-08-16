import { Env } from "hono";
export class BlogUpdateQueue implements DurableObject {
  private state: DurableObjectState;
  private env: Env;
  private queue: any[] = [];

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Push
    if (url.pathname === "/push" && request.method === "POST") {
      const msg = await request.json();
      this.queue.push(msg);
      await this.state.storage.put("queue", this.queue);
      return new Response("Message queued", { status: 200 });
    }

    // Pop
    if (url.pathname === "/pop") {
      const msg = this.queue.shift();
      await this.state.storage.put("queue", this.queue);
      return new Response(JSON.stringify(msg ?? null), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response("Not found", { status: 404 });
  }
}
