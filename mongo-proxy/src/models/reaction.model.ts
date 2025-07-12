import { Schema,model } from "mongoose";
import Blog from "./blogs.model";

const ReactionSchema = new Schema({
    blogId:{
        type:Schema.Types.ObjectId,
        ref:"Blog",
        required:true
        
    },
    likes:Number,
    applause:Number,
    laugh:Number
})
ReactionSchema.index({blogId:1,type:1},{unique:true})
const Reaction = model("Reaction",ReactionSchema)
export default Reaction