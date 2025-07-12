import { Schema, model } from "mongoose";
import Blog from "./blogs.model";

const tagsSchema =new Schema({
    name:{
        type:String,
        required:true
    }
    
})
const Tag = model("Tags",tagsSchema)
export default Tag
const blogTags = new Schema({
    blogId:{
        type:Schema.Types.ObjectId,
        ref: Blog,
        required:true
    },
    tagId:{
        type:Schema.Types.ObjectId,
        ref:Tag,
        required:true
    }
})
const Blogs = model("Blogs",blogTags)

tagsSchema.index({blogId:1,tagId:1},{unique:true})