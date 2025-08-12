import { DurableObject } from "cloudflare:workers";
import { Env } from "hono";

export class MyDurableObject extends DurableObject<Env> {
  private state: DurableObjectState;
  public env: Env;

  private views: number = 0;
  private likes: number = 0;
  private applause: number = 0;
  private smile: number = 0;
  
  constructor(ctx: DurableObjectState, env: Env) {
      super(ctx, env);
      this.state = ctx;
      this.env = env;
    }
    
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url)
    if(url.pathname==="/increment"){
      
        const { view=0,like = 0, applause = 0, smile = 0 }:{view:number,like:number,applause:number,smile:number} = await req.json();
        
        this.views = (await this.state.storage.get<number>("views")) ?? 0;
        this.likes = (await this.state.storage.get<number>("likes")) ?? 0;
        this.applause = (await this.state.storage.get<number>("applause")) ?? 0;
        this.smile = (await this.state.storage.get<number>("smile")) ?? 0;
    
        this.likes += like as number;
        this.applause += applause as number;
        this.smile += smile as number;
        this.views+=view as number;

    
        await this.state.storage.put("views", this.views);
        await this.state.storage.put("likes", this.likes);
        await this.state.storage.put("applause", this.applause);
        await this.state.storage.put("smile", this.smile);
    
    
        return new Response(
          JSON.stringify({
            views: this.views,
            likes: this.likes,
            applause: this.applause,
            smile: this.smile,
          }),
          { headers: { "Content-Type": "application/json" } }
        );
    }
    return new Response("Not found",{status:404})
  }
}
