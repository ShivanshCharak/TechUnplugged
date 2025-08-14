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
        const { likes, laugh, applause }: { likes: number; laugh: number; applause: number } =
          await request.json();

        const reactions = {
          likes,
          laugh,
          applause,
        };

        let staleReactions:{likes:number,laugh:number,applause:number}|undefined = await this.state.storage.get("reactions")
        if(staleReactions){
          staleReactions.likes+=likes
          staleReactions.applause+=applause
          staleReactions.laugh+=laugh
          
        }
        await this.state.storage.put("reactions", staleReactions);
        console.log(await this.state.storage.get("reactions"))
        
        return new Response(`Reactions updated: ${JSON.stringify(reactions)}`);
      }
      case path === "/get-reactions" && method === "GET": {
  const reactions = await this.state.storage.get<{ 
    likes: number;
    laugh: number;
    applause: number;
  }>("reactions");

  return new Response(JSON.stringify(reactions || {}), {
    headers: { "Content-Type": "application/json" }
  });
}


      default:
        return new Response("Not found", { status: 404 });
    }
  }
}
