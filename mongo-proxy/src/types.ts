export type TBlogSchema={
    title:String,
    body:String,
    userId:String,
    isDeleted: Boolean,
    slug:String,
    excerpt:String,
    images: String[],
    isPublished: Boolean,
    wordCount: Number,
    createdAt : EpochTimeStamp
}