// pages/Blogs.tsx - Complete single file with all blogs-related data
import { useState, useEffect } from "react";
import { Appbar } from "../components/Appbar";
import { BlogAside } from "../components/BlogAside";
import { BlogCard } from "../components/BlogCard";
import BlogHeader from "../components/BlogHeader";
import { BlogSkeleton } from "../components/BlogSkeleton";
import { Author,Blog,BlogsFilters, BlogStatsProps,SearchFiltersProps } from "../types";
import { useBlogs } from "../hooks/useBlogs";
import { BlogStats } from "../components/BlogStats";
import { SearchFilters } from "../components/SearchFilters";
import { getReadingTime,formatDate } from "../utils/BlogsUtility";



// ==================== MAIN COMPONENT ====================
export const Blogs = () => {
  const [filters, setFilters] = useState<BlogsFilters>({
    sortBy: 'newest',
    limit: 10,
    offset: 0
  });

  const { loading, blogs, error } = useBlogs(filters);
  console.log("blogs",blogs)

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
                    {console.log("isndie",blog.id)}
                    <BlogCard
                      id={String(blog.id)}
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