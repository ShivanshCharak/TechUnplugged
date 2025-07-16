import { useEffect, useState } from "react";
import { Blog, UseBlogReturn } from "../types";

export const useBlog = ({ id }: { id: string }): UseBlogReturn => {
  const [loading, setLoading] = useState(true);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        
        // Replace this with your actual API endpoint
        const response = await fetch(`http://localhost:8787/api/v1/blog/${id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

         let data = await response.json();
         data = data.blog
         

        
        console.log("getting",data.id, data.title,data.body,data.images, data.images,data.slug)
        
        // Transform the API response to match your Blog type
        const transformedBlog: Blog = {
          id: String(data.id),
          title: data.title || "",
          content: data.content || data.body || "",
          body: data.body || data.content || "",
          images: data.images || data.url || "",
          url: data.url || data.images || "",
          slug: data.slug || `${data.id}-${data.title?.toLowerCase().replace(/\s+/g, '-')}`,
          excerpt: data.excerpt || (data.content || data.body || "").substring(0, 150) + "...",
          publishedDate: data.publishedDate || data.createdAt || new Date().toLocaleDateString(),
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          author: {
            id: String(data.author?.id || data.userId || "unknown"),
            name: data.author?.name || "Anonymous",
            email: data.author?.email
          },
          isPublished: data.isPublished ?? true,
          tags: data.tags || [],
          views: data.views || 0,
          likes: data.likes || 0,
          isDeleted: data.isDeleted || false,
          wordCount: data.wordCount || (data.content || data.body || "").split(' ').length,
          userId: String(data.userId || data.author?.id || "unknown"),
          user: data.user || data.author,
          comments: data.comments || [],
          reactions: data.reactions || [],
          _count: data._count || {
            comments: data.comments?.length || 0,
            reactions: data.reactions?.length || 0
          }
        };
        ``
        setBlog(transformedBlog);
        console.log(blog)
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch blog");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id]);

  return { loading, blog, error };
};