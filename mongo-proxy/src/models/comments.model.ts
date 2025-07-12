import { Schema, model } from "mongoose";
import Blog from "./blogs.model"; 

const CommentsSchema = new Schema({
    blogId: { type: Schema.Types.ObjectId, ref: 'Blog', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

CommentsSchema.index({blogId:1,createdAt:-1})
const Comment = model("Comment", CommentsSchema);
export default Comment;
