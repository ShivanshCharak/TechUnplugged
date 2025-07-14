import { Hono } from 'hono'
import { userRouter } from './routes/user';
import { blogRouter } from './routes/blog';
import { cors } from 'hono/cors'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    OPENAI_API_KEY:string
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

export default app

