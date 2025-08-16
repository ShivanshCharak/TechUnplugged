
import { DurableObject } from "cloudflare:workers";
import { Env } from "../types/types";



export default {
  async fetch(
    blogId: string,
    request: Request,
    response: Response,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    if (request.url.endsWith("/websocket")) {
      const upgradeHeader = request.headers.get("Upgrade");
      if (!upgradeHeader || upgradeHeader !== "websocket") {
        return new Response("Worker expected upgrade:websocket", {
          status: 426,
        });
      }
      if (request.method !== "Get") {
        return new Response("Worker expected Get Method", {
          status: 400,
        });
      }
      let id = env.WebSocket_Server.idFromName(blogId);
      let stub = env.WebSocket_Server.get(id);
      return stub.fetch(request);
    }
    return new Response(
      `Supported endpoints: /websocktsocket: expects a websocket upgrade`,
      {
        status: 200,
        headers: {
          "Content-Type": "text-plain",
        },
    }
);
},
};

// Durable Object
export class WebSocketServer extends DurableObject {
    sessions: Map<WebSocket, { [key: string]: string }>;
    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
        this.sessions = new Map();
    }
    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url)
        const websocketPair = new WebSocketPair();
        const [client, server] = Object.values(websocketPair);
        server.accept();
        const id = crypto.randomUUID();
        this.sessions.set(server, { id });
        server.addEventListener("open", (event) => {
            //   this.handleWebSocketMessage(server, event.data);
            console.log("hello there")
        });
        
        server.addEventListener("message", (event) => {
            this.handleWebSocketMessage(server, event.data);
        });
        server.addEventListener("close", (event) => {
            this.handleConnectionClose(server);
        });
        if(url.pathname==="/broadcast"&&request.method==="POST"){
            const payload = await request.json()
            this.broadcast(JSON.stringify(payload))
            return new Response("Broascaste sent",{status:200})
        }
        return new Response(null, {
            status: 101,
            webSocket: client,
        });
    }
    broadcast(message:string){
        this.sessions.forEach((_meta,ws)=>{
            try {
                ws.send(message)
                console.log("send")
            } catch (error) {
                throw new Error(error)
            }
        })
    }
    async handleWebSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
        const connection = this.sessions.get(ws);
        if(!connection) return
        ws.send(`[Durable Uobject] message :${message}, from: ${connection.id}`);
    this.sessions.forEach((k, session) => {
        session.send(
            `[Durable Object] message: ${message}, from: ${connection.id}`
        );
    });
}
async handleConnectionClose(ws: WebSocket) {
    this.sessions.delete(ws);
    ws.close(1000, "Durable object is closing websocket");
}
}
