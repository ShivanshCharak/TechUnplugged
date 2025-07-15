// types/blog.ts - Centralized type definitions
export interface Author {
  id: string;
  name: string;
  email?: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  body?: string;
  images?: string;
  url?: string;
  slug?: string;
  excerpt?: string;
  publishedDate?: string;
  createdAt?: string;
  updatedAt?: string;
  author: Author;
  isPublished?: boolean;
  tags?: string[];
  views?: number;
  likes?: number;
  isDeleted?: boolean;
  wordCount?: number;
  userId?: string;
  user?: Author;
  // Add missing properties that FullBlog expects
  comments?: any[];
  reactions?: any[];
  _count?: {
    comments: number;
    reactions: number;
  };
}

// Hook return types
export interface UseBlogReturn {
  loading: boolean;
  blog: Blog | null;
  error?: string;
}

export interface UseBlogsReturn {
  loading: boolean;
  blogs: Blog[];
  error?: string;
}

// Component prop types
export interface FullBlogProps {
  blog: Blog;
}

export interface BlogCardProps {
  id: string;
  authorName: string;
  title: string;
  url: string;
  content: string;
  publishedDate: string;
}