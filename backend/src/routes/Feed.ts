// import { PrismaClient } from "@prisma/client/edge";
// import { withAccelerate } from "@prisma/extension-accelerate";
// import { Hono } from "hono"
// export const feedRouter = new Hono<{
//     Bindings: {
//         DATABASE_URL: string;
//         JWT_SECRET: string;
//         USER_EVENTS_QUEUE: Queue
//       }
// }>
// feedRouter.get("/bulk",async(c)=>{
//     const prisma = new PrismaClient({
//         datasourceUrl: c.env.DATABASE_URL,
//       }).$extends(withAccelerate())

//     try {
//         const user = await prisma.
//     } catch (error) {
        
//     }
// })