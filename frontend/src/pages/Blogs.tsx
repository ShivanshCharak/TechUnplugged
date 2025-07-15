// pages/Blogs.tsx - Complete single file with all blogs-related data
import { useState, useEffect } from "react";
import { Appbar } from "../components/Appbar";
import { BlogAside } from "../components/BlogAside";
import { BlogCard } from "../components/BlogCard";
import BlogHeader from "../components/BlogHeader";
import { BlogSkeleton } from "../components/BlogSkeleton";

// ==================== TYPE DEFINITIONS ====================
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
  comments?: any[];
  reactions?: any[];
  _count?: {
    comments: number;
    reactions: number;
  };
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

// ==================== CUSTOM HOOK ====================
// Updated useBlogs hook with better error handling and debugging
export const useBlogs = (filters: BlogsFilters = {}): UseBlogsReturn => {
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(undefined);
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.tags?.length) queryParams.append('tags', filters.tags.join(','));
        if (filters.author) queryParams.append('author', filters.author);
        if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
        if (filters.limit) queryParams.append('limit', filters.limit.toString());
        if (filters.offset) queryParams.append('offset', filters.offset.toString());

        const url = `http://localhost:8787/api/v1/blog/bulk`;
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

        // Check if response is ok
        if (!response.ok) {
          // Try to get error message from response
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

        // Get response text first to check what we're receiving
        const responseText = await response.text();
        console.log('Raw response:', responseText.substring(0, 200) + '...');

        // Check if response is empty
        if (!responseText.trim()) {
          throw new Error("Empty response from server");
        }

        // Try to parse JSON
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

        // Handle different response formats
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
        
        // Transform the API response to match your Blog type
        const transformedBlogs: Blog[] = blogsArray.map((blog: any) => {
          try {
            return {
              id: String(blog.id || blog._id || Math.random().toString(36).substr(2, 9)),
              title: blog.title || "Untitled",
              content: blog.content || blog.body || "",
              body: blog.body || blog.content || "",
              images: blog.images || blog.url || "",
              url: blog.url || blog.images || "",
              slug: blog.slug || createSlug(blog.title || "", String(blog.id || "")),
              excerpt: blog.excerpt || createExcerpt(blog.content || blog.body || ""),
              publishedDate: blog.publishedDate || blog.createdAt || new Date().toISOString(),
              createdAt: blog.createdAt || new Date().toISOString(),
              updatedAt: blog.updatedAt || new Date().toISOString(),
              author: {
                id: String(blog.author?.id || blog.authorId || blog.userId || "unknown"),
                name: blog.author?.name || blog.authorName || "Anonymous",
                email: blog.author?.email || blog.authorEmail
              },
              isPublished: blog.isPublished ?? true,
              tags: Array.isArray(blog.tags) ? blog.tags : [],
              views: Number(blog.views) || 0,
              likes: Number(blog.likes) || 0,
              isDeleted: blog.isDeleted || false,
              wordCount: blog.wordCount || calculateWordCount(blog.content || blog.body || ""),
              userId: String(blog.userId || blog.author?.id || "unknown"),
              user: blog.user || blog.author,
              comments: Array.isArray(blog.comments) ? blog.comments : [],
              reactions: Array.isArray(blog.reactions) ? blog.reactions : [],
              _count: blog._count || {
                comments: Array.isArray(blog.comments) ? blog.comments.length : 0,
                reactions: Array.isArray(blog.reactions) ? blog.reactions.length : 0
              }
            };
          } catch (transformError) {
            console.error('Error transforming blog:', transformError, blog);
            return null;
          }
        }).filter(Boolean) as Blog[];
        
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
  }, [filters.search, filters.tags, filters.author, filters.sortBy, filters.limit, filters.offset]);

  return { loading, blogs, error };
};

// ==================== UTILITY FUNCTIONS ====================
const createSlug = (title: string, id: string): string => {
  if (!title) return id;
  return `${id}-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
};

const calculateWordCount = (content: string): number => {
  if (!content) return 0;
  return content.trim().split(/\s+/).filter(word => word.length > 0).length;
};

const formatDate = (date: string | undefined): string => {
  if (!date) return new Date().toLocaleDateString();
  
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return date;
  }
};

const createExcerpt = (content: string, maxLength: number = 150): string => {
  if (!content) return "";
  
  if (content.length <= maxLength) return content;
  
  const truncated = content.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  return (lastSpaceIndex > 0 ? truncated.substring(0, lastSpaceIndex) : truncated) + "...";
};

const getReadingTime = (content: string): string => {
  const words = calculateWordCount(content);
  const minutes = Math.ceil(words / 200); // Average reading speed
  return `${minutes} min read`;
};

// ==================== SEARCH AND FILTER COMPONENT ====================
interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onTagFilter: (tags: string[]) => void;
  onSortChange: (sortBy: 'newest' | 'oldest' | 'popular' | 'trending') => void;
  availableTags: string[];
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ 
  onSearch, 
  onTagFilter, 
  onSortChange, 
  availableTags 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular' | 'trending'>('newest');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    onTagFilter(newTags);
  };

  const handleSortChange = (newSort: 'newest' | 'oldest' | 'popular' | 'trending') => {
    setSortBy(newSort);
    onSortChange(newSort);
  };

  return (
    <div className="mb-8 p-6  rounded-lg shadow-sm border bg-[#0B0B0B] border-[#1A1717]">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Sort Options */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value as any)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-inherit focus:ring-blue-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="popular">Most Popular</option>
          <option value="trending">Trending</option>
        </select>
      </div>

      {/* Tag Filters */}
      {availableTags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by tags:</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== BLOG STATS COMPONENT ====================
interface BlogStatsProps {
  totalBlogs: number;
  totalAuthors: number;
  totalViews: number;
  totalLikes: number;
}

const BlogStats: React.FC<BlogStatsProps> = ({ 
  totalBlogs, 
  totalAuthors, 
  totalViews, 
  totalLikes 
}) => {
  return (
    <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-[#0B0B0B] p-4 rounded-lg shadow-sm border  border-[#1A1717] text-center">
        <div className="text-2xl font-bold text-blue-600">{totalBlogs}</div>
        <div className="text-sm text-white-600">Total Blogs</div>
      </div>
      <div className="bg-[#0B0B0B] p-4 rounded-lg shadow-sm border text-center border-[#1A1717]">
        <div className="text-2xl font-bold text-green-600">{totalAuthors}</div>
        <div className="text-sm text-gray-600">Authors</div>
      </div>
      <div className="bg-[#0B0B0B] p-4 rounded-lg shadow-sm border text-center border-[#1A1717]">
        <div className="text-2xl font-bold text-purple-600">{totalViews}</div>
        <div className="text-sm text-gray-600">Total Views</div>
      </div>
      <div className="bg-[#0B0B0B] p-4 rounded-lg shadow-sm border text-center border-[#1A1717]">
        <div className="text-2xl font-bold text-red-600">{totalLikes}</div>
        <div className="text-sm text-gray-600">Total Likes</div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export const Blogs = () => {
  const [filters, setFilters] = useState<BlogsFilters>({
    sortBy: 'newest',
    limit: 10,
    offset: 0
  });

  const { loading, blogs, error } = useBlogs(filters);

  // Calculate stats
  const stats = {
    totalBlogs: blogs.length,
    totalAuthors: new Set(blogs.map(blog => blog.author.id)).size,
    totalViews: blogs.reduce((sum, blog) => sum + (blog.views || 0), 0),
    totalLikes: blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0)
  };

  // Get unique tags
  const availableTags = Array.from(
    new Set(blogs.flatMap(blog => blog.tags || []))
  ).sort();

  // Filter handlers
  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query, offset: 0 }));
  };

  const handleTagFilter = (tags: string[]) => {
    setFilters(prev => ({ ...prev, tags, offset: 0 }));
  };

  const handleSortChange = (sortBy: 'newest' | 'oldest' | 'popular' | 'trending') => {
    setFilters(prev => ({ ...prev, sortBy, offset: 0 }));
  };

  // Loading state
  if (loading) {
    return (
      <div>
        <Appbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-2xl">
              <div className="h-8 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded mb-4 animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <BlogSkeleton key={i} />
            ))}
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
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-red-500 text-xl font-bold mb-4">Error Loading Blogs</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Appbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <BlogHeader />
        </div>

        {/* Stats */}
        <BlogStats {...stats} />

        {/* Search and Filters */}
        <SearchFilters
          onSearch={handleSearch}
          onTagFilter={handleTagFilter}
          onSortChange={handleSortChange}
          availableTags={availableTags}
        />

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Blog List */}
          <div className="flex-1">
            {blogs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No blogs found</div>
                <p className="text-gray-400 mt-2">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="space-y-6">
                {blogs.map((blog: Blog) => (
                  <div key={blog.id} className="bg-[#0B0B0B] shadow-sm border border-[#1A1717]  overflow-hidden rounded-lg">
                    <BlogCard
                      id={Number(blog.id)}
                      authorName={blog.author?.name || "Anonymous"}
                      title={blog.title}
                      url={blog.images || blog.url || ""}
                      content={blog.content || blog.body || ""}
                      publishedDate={formatDate(blog.publishedDate || blog.createdAt)}
                    />
                    
                    {/* Additional blog info */}
                    <div className="px-6 pb-4">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>{getReadingTime(blog.content || blog.body || "")}</span>
                          <span>{blog.views || 0} views</span>
                          <span>{blog.likes || 0} likes</span>
                        </div>
                        
                        {/* Tags */}
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {blog.tags.slice(0, 3).map(tag => (
                              <span 
                                key={tag}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            {blog.tags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                +{blog.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80">
            <BlogAside />
          </div>
        </div>
      </div>
    </div>
  );
};