
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Appbar } from "../components/Appbar";
import { FullBlog } from "../components/blogs/FullBlog";
import { Spinner } from "../components/Spinner";
import { UseBlogReturn,Blog } from "../types";
import { useBlog } from "../hooks/useGetBlogById";
import { calculateWordCount, createExcerpt, createSlug } from "../utils/BlogsUtility";

export const BlogLayout = () => {
  const { id } = useParams<{ id: string }>();

  const { loading, blog, error } = useBlog({
    id: id || ""
  });
  console.log(blog)

  // Loading state
  if (loading) {
    return (
      <div>
        <Appbar />
        <div className="h-screen flex flex-col justify-center">
          <div className="flex justify-center">
            <Spinner />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <Appbar />
        <div className="h-screen flex flex-col justify-center">
          <div className="flex justify-center">
            <div className="text-red-500 text-center">
              <h2 className="text-2xl font-bold mb-4">Error Loading Blog</h2>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // No blog found
  if (!blog) {
    return (
      <div>
        <Appbar />
        <div className="h-screen flex flex-col justify-center">
          <div className="flex justify-center">
            <div className="text-gray-500 text-center">
              <h2 className="text-2xl font-bold mb-4">Blog Not Found</h2>
              <p>The blog you're looking for doesn't exist or has been removed.</p>
              <button 
                onClick={() => window.history.back()} 
                className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const fullBlogData: Blog = {
    ...blog,
    id: String(blog.id),
    content: blog.content || blog.body || "",
    body: blog.body || blog.content || "",
    images: blog.images || blog.url || "",
    url: blog.url || blog.images || "",
    slug: blog.slug || createSlug(blog.title, blog.id),
    excerpt: blog.excerpt || createExcerpt(blog.content || blog.body || ""),
    publishedDate: blog.publishedDate || blog.createdAt || new Date().toLocaleDateString(),
    createdAt: blog.createdAt || new Date().toISOString(),
    isPublished: blog.isPublished ?? true,
    tags: blog.tags || [],
    views: blog.views || 0,
    likes: blog.likes || 0,
    wordCount: blog.wordCount || calculateWordCount(blog.content || blog.body || ""),
    userId: String(blog.user?.id || "unknown"),
    user: blog.user || blog.user,
    comments: blog.comments || [],
    reactions: blog.reactions,
    _count: blog._count
  };

  {if (!fullBlogData || !fullBlogData.slug) return <div>Invalid blog</div>;}
  return (
    <div>
      <Appbar />
      <div className="min-h-screen bg-gray-50">
        <FullBlog blog={fullBlogData as Blog} />
      </div>
    </div>
  );
};