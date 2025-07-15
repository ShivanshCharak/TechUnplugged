// pages/Blog.tsx - Complete single file with all blog-related data
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Appbar } from "../components/Appbar";
import { FullBlog, Reactions, Tag } from "../components/FullBlog";
import { Spinner } from "../components/Spinner";
import { Comment } from "../components/FullBlog";

// ==================== TYPE DEFINITIONS ====================
export interface Author {
  id: string;
  name: string;
  email: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  body: string;
  images: string;
  url: string;
  slug: string;
  excerpt: string;
  publishedDate: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
  isPublished: boolean;
  tags: Tag[];
  views: number;
  likes: number;
  isDeleted: boolean;
  wordCount: number;
  userId: string;
  user: Author;
  comments: Comment[];
  reactions: Reactions|undefined[];
  _count: {
    comments: number;
    reactions: number;
    bookmarks:number
  };
}

export interface UseBlogReturn {
  loading: boolean;
  blog: Blog | null;
  error?: string;
}

export interface FullBlogProps {
  blog: Blog;
}

// ==================== CUSTOM HOOK ====================
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

// ==================== UTILITY FUNCTIONS ====================
const createSlug = (title: string, id: string): string => {
  return `${id}-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
};

const calculateWordCount = (content: string): number => {
  return content.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// const formatDate = (date: string | undefined): string => {
//   if (!date) return new Date().toLocaleDateString();
  
//   try {
//     return new Date(date).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   } catch {
//     return date;
//   }
// };

const createExcerpt = (content: string, maxLength: number = 150): string => {
  if (!content) return "";
  
  if (content.length <= maxLength) return content;
  
  const truncated = content.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  return (lastSpaceIndex > 0 ? truncated.substring(0, lastSpaceIndex) : truncated) + "...";
};

// ==================== MAIN COMPONENT ====================
export const Blog = () => {
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

  // Prepare the blog data for FullBlog component
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
    updatedAt: blog.updatedAt || new Date().toISOString(),
    author: {
      id: String(blog.author?.id || blog.userId || "unknown"),
      name: blog.author?.name || "Anonymous",
      email: blog.author?.email
    },
    isPublished: blog.isPublished ?? true,
    tags: blog.tags || [],
    views: blog.views || 0,
    likes: blog.likes || 0,
    isDeleted: blog.isDeleted || false,
    wordCount: blog.wordCount || calculateWordCount(blog.content || blog.body || ""),
    userId: String(blog.userId || blog.author?.id || "unknown"),
    user: blog.user || blog.author,
    comments: blog.comments || [],
    reactions: blog.reactions || [],
    _count: blog._count
  };

  // Success state - render the blog
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