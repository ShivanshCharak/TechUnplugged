// pages/Blogs.tsx - Complete single file with all blogs-related data
import { useState, useEffect } from "react";
import { Appbar } from "../components/Appbar";
import { BlogAside } from "../components/blogs/BlogAside";
import { BlogCard } from "../components/blogs/BlogCard";
import BlogHeader from "../components/blogs/BlogHeader";
import { TnotifData } from "../utils/context/notificationContext";
import { BlogSkeleton } from "../components/blogs/BlogSkeleton";
import { SignalingManger } from "../wsClient";
import {
  Author,
  Blog,
  BlogsFilters,
  BlogStatsProps,
  SearchFiltersProps,
} from "../types";
import { useBlogs } from "../hooks/useBlogs";
import { BlogStats } from "../components/blogs/BlogStats";
import { Smile, Heart, HandshakeIcon, Eye } from "lucide-react";
import { SearchFilters } from "../components/SearchFilters";
import { getReadingTime, formatDate } from "../utils/BlogsUtility";
import { useContext } from "react";
import { NotificationContext } from "../utils/context/notificationContext";
import { SignalingManager } from "../wsClient";


/**
 *  MAIN BLOG
 *
*/
export const Blogs = (category:"Personalized"|"Recent"|"Featured"="Personalized") => {
  const { setNotifData } = useContext(NotificationContext);
  const [filters, setFilters] = useState<BlogsFilters>({
    sortBy: "newest",
    limit: 10,
    offset: 0,
  });
  const [activeHeader, setActiveHeader] = useState<"Personalized"|"Recent"|"Featured">("Personalized");

  const { loading, blogs, error } = useBlogs(filters,activeHeader);

  useEffect(() => {
    const signaling = SignalingManager.getInstance();

    signaling.setOnMessage((msg:TnotifData) => {
      setNotifData(prev=>{
        let arr:Array<TnotifData> =prev
        arr.push(msg)
        return arr
      });
      
      console.log(msg)
    });
  }, []);
  const stats = {
    totalBlogs: blogs.length,
    totalAuthors: new Set(blogs.map((blog) => blog.user.id)).size,
    totalViews: blogs.reduce((sum, blog) => sum + (blog.views || 0), 0),
    totalLikes: blogs.reduce(
      (sum, blog) => sum + (blog.reactions.likes || 0),
      0
    ),
  };
  const availableTags = Array.from(
    new Set(blogs.flatMap((blog) => blog.tags || []))
  ).sort();
  
  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, search: query, offset: 0 }));
  };
  
  const handleTagFilter = (tags: string[]) => {
    setFilters((prev) => ({ ...prev, tags, offset: 0 }));
  };
  
  const handleSortChange = (
    sortBy: "newest" | "oldest" | "popular" | "trending"
  ) => {
    setFilters((prev) => ({ ...prev, sortBy, offset: 0 }));
    console.log("fileter",sortBy,filters)
  };

  // Loading state
  // if (loading) {
  //   return (
  //     <div>
  //       <Appbar />
  //       <div className="max-w-6xl mx-auto px-4 py-8 absolute mt-[10%]">
  //         <div className="flex justify-center mb-8">
  //           <div className="w-full max-w-2xl">
  //             <div className="h-8 bg-gray-200 rounded mb-4 animate-pulse"></div>
  //             <div className="h-12 bg-gray-200 rounded mb-4 animate-pulse"></div>
  //           </div>
  //         </div>
  //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  //           {[...Array(6)].map((_, i) => (
  //             <BlogSkeleton key={i} />
  //           ))}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }
  // // Error state
  // if (error) {
  //   return (
  //     <div>
  //       <Appbar />
  //       <div className="max-w-6xl mx-auto px-4 py-8 mt-[10rem]">
  //         <div className="text-center">
  //           <div className="text-red-500 text-xl font-bold mb-4">
  //             Error Loading Blogs
  //           </div>
  //           <p className="text-gray-600 mb-4">{error}</p>
  //           <button
  //             onClick={() => window.location.reload()}
  //             className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
  //           >
  //             Try Again
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div>
      
      <Appbar />
      <div className="max-w-6xl mx-auto px-4 py-8  mt-[10rem]">
        {/* Header */}
        <div className="text-center mb-8">
          <BlogHeader activeHeader={activeHeader} setActiveHeader={setActiveHeader} />

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
                <p className="text-gray-400 mt-2">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {blogs.map((blog: Blog) => (
                  <div
                    key={blog.id}
                    className="bg-[#0B0B0B] shadow-sm border border-[#1A1717]  overflow-hidden rounded-lg"
                  >
                    <BlogCard
                      id={String(blog.id)}
                      authorName={blog.user?.name || "Anonymous"}
                      title={blog.title}
                      url={blog.images || blog.url || ""}
                      content={blog.content || blog.body || ""}
                      likes={blog.reactions.likes}
                      applauses={blog.reactions.applause}
                      smiles={blog.reactions.laugh}
                      publishedDate={formatDate(
                        blog.publishedDate || blog.createdAt
                      )}
                    />

                    {/* Additional blog info */}
                    <div className=" w-[40%] px-6 pb-4">
                      <div className="flex justify-between items-center w-full space-x-4">
                        <span className="flex items-center justify-between w-[17%] text-sm">
                          <Eye
                            height={18}
                            width={18}
                            className="stroke-slate-600"
                          />
                          {blog.views}
                        </span>
                        <span className="flex items-center justify-between w-[12%] text-sm">
                          <HandshakeIcon
                            className="stroke-pink-400"
                            height={18}
                            width={18}
                          />
                          {blog.reactions.applause || 0}
                        </span>
                        <span className="flex items-center justify-between w-[12%] text-sm">
                          <Heart
                            className="stroke-red-500"
                            height={18}
                            width={18}
                          />
                          {blog.reactions.likes || 0}
                        </span>
                        <span className="flex items-center justify-between w-[12%] text-sm">
                          <Smile
                            className="stroke-yellow-400"
                            height={18}
                            width={18}
                          />
                          {blog.reactions.laugh || 0}
                        </span>
                      </div>

                      {/* Tags */}
                      {/* {blog.tags && blog.tags.length > 0 && (
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
                        )} */}
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
      {/* {console.log(render)} */}
    </div>
  );
};
