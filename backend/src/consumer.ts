import { Env } from "./types/types";

export default {
  async scheduled(env: Env) {
    let msg;
    while ((msg = await popMessage(env))) {
      console.log(msg)
      if (msg && msg.type === "draftUpdate") {
        await env.Blog_cache.put(`draft:${msg.id}`, JSON.stringify(msg.payload));
      }
    }
  }
};


export async function popMessage(env: Env) {
  // Get the stub for your Durable Object (you can use a constant ID or generate one)
  const id = env.Blog_queue.idFromName("blog-queue"); // unique name for this queue
  const stub = env.Blog_queue.get(id);               // DurableObjectStub

  
  const res = await stub.fetch("https://queue/pop");

  return res.status === 200 ? await res.json() : null;
}