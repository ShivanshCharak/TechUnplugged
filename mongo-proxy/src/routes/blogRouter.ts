import express from 'express';
import { Comments, createBlogs, Replies } from "../controllers/blogController";
import { blogReactions } from '../controllers/blogController';

const router = express.Router();

router.post("/create", createBlogs);
router.post("/reactions", blogReactions);
router.post("/comments", Comments);
router.post("/replies", Replies);

export default router;