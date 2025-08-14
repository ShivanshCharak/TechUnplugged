import { Env, comment } from "./types/types";

export class BlogDD implements DurableObject {
  state: DurableObjectState;
  env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    const path = url.pathname;

    switch (true) {
      case path === "/add-comment" && method === "POST": {
        const { comments }: { comments: Array<comment> } = await request.json();
        // Store all comments object in one go
        await this.state.storage.put("comments", comments);
        return new Response("Comments appended");
      }

      case path === "/reaction" && method === "POST": {
        const { like, smile, applause }: { like: number; smile: number; applause: number } =
          await request.json();

        // Create a single object to store all reactions together
        const reactions = {
          like,
          smile,
          applause,
        };

        // Save entire object in one write
        await this.state.storage.put("reactions", reactions);

        return new Response(`Reactions updated: ${JSON.stringify(reactions)}`);
      }

      default:
        return new Response("Not found", { status: 404 });
    }
  }
}
