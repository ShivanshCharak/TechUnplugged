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
        const {
          views,
          likes,
          laugh,
          applause,
        }: { views:number,likes: number; laugh: number; applause: number } =
          await request.json();

        const engagement = {
          views,
          likes,
          laugh,
          applause,
        };

        let staleReactions:
          | { views:number,likes: number; laugh: number; applause: number }
          | undefined = (await this.state.storage.get("reactions"))??{
            views:0,
            likes:0,
            applause:0,
            laugh:0
          };
        if (staleReactions) {
          staleReactions.views+=1;
          staleReactions.likes += likes;
          staleReactions.applause += applause;
          staleReactions.laugh += laugh;
        }

        await this.state.storage.put("reactions", staleReactions);

        return new Response(`Reactions updated: ${JSON.stringify(engagement)}`);
      }
      case path === "/get-engagement" && method === "GET": {
        // await this.state.storage.delete("reactions")
        const reactions = (await this.state.storage.get<{
          views:number,
          likes: number;
          laugh: number;
          applause: number;
        }>("reactions"))??{
          views:0,
           likes: 0,
          laugh: 0,
          applause: 0
        }
        // reactions.views+=1
        await this.state.storage.put("reactions",reactions)

        return new Response(JSON.stringify(reactions || {}), {
          headers: { "Content-Type": "application/json" },
        });
      }

      default:
        return new Response("Not found", { status: 404 });
    }
  }
}
