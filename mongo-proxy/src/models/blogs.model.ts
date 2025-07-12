import { Schema, model } from "mongoose";

const BlogsSchema = new Schema({
    title: {
        type:String,
        required:true,
        trim:true,
        maxLength:100,
        index:true
    },
    body: {
        type:String,
        required:true,
        trim:true,
    },
    userId: {
        type: String,
        unique:true,
        required:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    slug:  {
        type:String,
        unique:true,
        required:true
    },
    excerpt: {
        type:String,
        required:true
    },
    images: [String],
    views:Number,
    isPublished:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default: Date.now().toLocaleString
    },
})
const Blog = model('Blog',BlogsSchema)
export default Blog

