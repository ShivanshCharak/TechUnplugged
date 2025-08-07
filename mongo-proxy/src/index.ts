import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express from 'express';
import blogRouter from './routes/blogRouter';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  throw new Error('MONGO_URI is not defined in .env file');
}

const app = express();

dotenv.config()

app.use(express.json());
app.use("/api/v1/blogs", blogRouter);

const connectDB = async () => {
    try {
        console.log(MONGO_URI)
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
    console.error('Connection error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};

const startServer = async () => {
  await connectDB();
  app.listen(3000, () => {
    console.log('Server is listening on port 3000');
  });
};

startServer();
