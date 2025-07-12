import { Schema, model } from "mongoose";
const ReplySchema = new Schema({
    commentId: { type: Schema.Types.ObjectId, ref: 'Comment', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    replies:[{
        text:{
            type:String,
            required:true
        },
        userId:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
            createdAt:{
                type:Date,
                default:Date.now()
            
        }
    }],
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

ReplySchema.index({ commentId: 1, createdAt: 1 }); 
const Reply = model("Comment", ReplySchema);