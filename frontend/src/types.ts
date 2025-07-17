export interface Author {
  id: string;
  name: string;
  email?: string;
}



export interface UseBlogsReturn {
  loading: boolean;
  blogs: Blog[];
  error?: string;
}

export interface BlogCardProps {
  id: string;
  authorName: string;
  title: string;
  url: string;
  content: string;
  publishedDate: string;
}

export interface BlogsFilters {
  search?: string;
  tags?: string[];
  author?: string;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'trending';
  limit?: number;
  offset?: number;
}
export interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onTagFilter: (tags: string[]) => void;
  onSortChange: (sortBy: 'newest' | 'oldest' | 'popular' | 'trending') => void;
  availableTags: string[];
}
export interface BlogStatsProps {
  totalBlogs: number;
  totalAuthors: number;
  totalViews: number;
  totalLikes: number;
}

export interface Author {
  id: string;
  name: string;
  email?: string;
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


// =================================Blogs.tsx Types ==============


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
  comments: comment[];
  reactions: Reactions;
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
export interface User {
  id: string;
  name: string;
  email: string;
  firstname?: string;
  lastname?: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface comment {
  id: string;
  content: string;
  user: {firstname:string,lastname:string};
  createdAt: string;
  userId: string;
  blogId?: string;
  
  replyToId: string | null;
}

export interface Reactions {
  id?: string;
  blogId?: string;
  likes: number;
  applause: number;
  laugh: number;
}



export interface Draft {
  id: string;
  blogId: string;
  userId:string,
  content: string;
  createdAt: string;
}

export interface UserReactions {
  likes: boolean;
  applause: boolean;
  laugh: boolean;
}

export interface IBlogReactions {
  reactions: Reactions;
  bookmarks: string[];
  drafts: Draft[];
  comments:comment[]
}

// Props interfaces
export interface AvatarProps {
  size: 'small' | 'medium' | 'big';
  name: string;
}

export interface CommentProps {
  comment: comment;
  allComments: comment[];
  onReply: (parentId: string, text: string) => void;
  onDelete: (id: string) => void;
  currentUserId: string;
  level?: number;
}

export interface DraftManagerProps {
  drafts: Draft[];
  onSaveDraft: () => void;
  onLoadDraft: (draft: Draft) => void;
  onDeleteDraft: (id: string) => void;
}

export interface FullBlogProps {
  blog: Blog;
}

export interface IUserTokenPayload {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  isPremium: boolean;
  exp: number;
  iat: number;
}