import { useState, useEffect } from "react";
import { BlogsFilters,Blog,UseBlogsReturn } from "../types";
import { calculateWordCount, createExcerpt, createSlug } from "../utils/BlogsUtility";


export const useBlogs = (filters: BlogsFilters = {},type:"Personalized"|"Recent"|"Featured"): UseBlogsReturn => {
  console.log("render")
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  
  const [error, setError] = useState<string>();
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(undefined);
        

        const queryParams = new URLSearchParams();
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.tags?.length) queryParams.append('tags', filters.tags.join(','));
        if (filters.author) queryParams.append('author', filters.author);
        if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
        if (filters.limit) queryParams.append('limit', filters.limit.toString());
        if (filters.offset) queryParams.append('offset', filters.offset.toString());
        const url = type==="Personalized"?`http://localhost:8787/api/v1/blog/bulk`:"http://localhost:8787/api/v1/blog/recent";
        console.log(type,url)
        console.log('Fetching from URL:', url);

        // Get token from localStorage
        const token = localStorage.getItem("accessToken");
        if (!token) {
          throw new Error("Authentication token not found. Please log in again.");
        }

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        
        if (!response.ok) {

          const errorText = await response.text();
          console.error('Error response:', errorText);
          
          if (response.status === 401) {
            throw new Error("Authentication failed. Please log in again.");
          } else if (response.status === 403) {
            throw new Error("You don't have permission to access this resource.");
          } else if (response.status === 404) {
            throw new Error("Blog API endpoint not found. Please check your API configuration.");
          } else if (response.status >= 500) {
            throw new Error("Server error. Please try again later.");
          } else {
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
          }
        }


        const responseText = await response.text();
        console.log('Raw response:', responseText.substring(0, 200) + '...');

        
        if (!responseText.trim()) {
          throw new Error("Empty response from server");
        }


        let data;
        try {
          data = JSON.parse(responseText);
          console.log(data)
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Response text:', responseText);
          throw new Error(`Invalid JSON response from server. Expected JSON but got: ${responseText.substring(0, 100)}...`);
        }

        console.log('Parsed data:', data);

        let blogsArray: any[] = [];
        
        if (Array.isArray(data)) {
          blogsArray = data;
        } else if (data.blogs && Array.isArray(data.blogs)) {
          blogsArray = data.blogs;
        } else if (data.data && Array.isArray(data.data)) {
          blogsArray = data.data;
        } else if (data.posts && Array.isArray(data.posts)) {
          blogsArray = data.posts;
        } else {
          console.warn('Unexpected data format:', data);
          blogsArray = [];
        }
        console.log('blogarray',blogsArray[0])

        const transformedBlogs: Blog[] = blogsArray.map((blog: any) => {
          try {
            return {
              id: String(blog.id || blog._id || Math.random().toString(36).substr(2, 9)),
              title: blog.title || "Untitled",
              content: blog.body || "",
              body: blog.body || "",
              images: blog.images || blog.url || "",
              url:  blog.images || "",
              slug: blog.slug || createSlug(blog.title || "", String(blog.id || "")),
              excerpt: blog.excerpt || createExcerpt(blog.body || ""),
              publishedDate: blog.createdAt || new Date().toISOString(),
              createdAt: blog.createdAt || new Date().toISOString(),
              updatedAt: blog.updatedAt || new Date().toISOString(),
              user: {
                id: String(blog.author?.id || blog.authorId || blog.userId || "unknown"),
                email: blog.user?.email,
                name: blog.user?.firstname +" " +blog.user?.lastname
              },
              isPublished: blog.isPublished ?? true,
              tags: Array.isArray(blog.tags) ? blog.tags : [],
              views: Number(blog.views) || 0,
              likes: Number(blog.likes) || 0,
              isDeleted: blog.isDeleted || false,
              wordCount: blog.wordCount || calculateWordCount(blog.content || blog.body || ""),
              userId: String(blog.userId || "unknown"),
    
              reactions: blog.reactions?blog.reactions:{likes:0,applause:0,smile:0} ,
              _count: blog._count || {
                
                reactions: Array.isArray(blog.reactions) ? blog.reactions.length : 0
              }
            };
          } catch (transformError) {
            console.error('Error transforming blog:', transformError, blog);
            return null;
          }
        }).filter(Boolean) as Blog[];
        // ransformedBlogs)
        
        console.log('Transformed blogs:', transformedBlogs);
        setBlogs(transformedBlogs);
        
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [type,filters.search, filters.tags, filters.author, filters.sortBy, filters.limit, filters.offset]);

  return { loading, blogs, error };
};