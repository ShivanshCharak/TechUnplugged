import { Appbar } from "../components/Appbar"
import { BlogAside } from "../components/BlogAside";
import { BlogCard } from "../components/BlogCard"
import BlogHeader from "../components/BlogHeader";
import { BlogSkeleton } from "../components/BlogSkeleton";
import { useBlogs } from "../hooks";

export const Blogs = () => {
    const { loading, blogs } = useBlogs();

    if (loading) {
        return <div>
            <Appbar /> 
            <div className="flex justify-center">
                <div>
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                </div>
            </div>
        </div>
    }

    return <div>
        <Appbar />
        {/* Changed this container to properly center its children */}
        <div className="flex  w-full mt-10">
            <div className="flex justify-center w-[70%]">
                <BlogHeader/>
            </div>
        </div>
        <div className="flex  w-[70%] mx-auto mt-10">  {/* Added mx-auto here */}
            <div>
                {blogs.map(blog => <BlogCard
                    id={blog.id}
                    authorName={blog.author.name || "Anonymous"}
                    title={blog.title}
                    url={blog.url}
                    content={blog.content}
                    publishedDate={"2nd Feb 2024"}
                />)}
            </div>
            <BlogAside/>
        </div>
    </div>
}