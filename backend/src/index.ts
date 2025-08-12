import { Context, Hono } from 'hono'
import { userRouter } from './routes/user';
import { blogRouter } from './routes/blog';
import { cors } from 'hono/cors'
import { draftRouter } from './routes/drafts';
import { bookmarksRouter } from './routes/bookmarks';
import {Redis} from '@upstash/redis/cloudflare'
import { onScheduled } from './routes/blog';
import { Context } from 'hono/jsx';
// import { MyDurableObject } from './counter';


export function getRedisClient(c: Context):Redis {
  return new Redis({
    url: c.env.UPSTASH_REDIS_REST_URL,
    token: c.env.UPSTASH_REDIS_REST_TOKEN,
  });
}


const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    OPENAI_API_KEY:string;
    UPSTACK_REDIS_REST_URL:string,
    UPSTASH_REDIS_REST_TOKEN:string
  }
}>();

app.use(
  '/*',
  cors({
    origin: 'http://localhost:5173', // explicitly allow frontend origin
    credentials: true,               // allow credentials
  })
);

app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);
app.route("/api/v1/draft", draftRouter);
app.route("/api/v1/bookmark", bookmarksRouter);


export default app
// export {MyDurableObject}

