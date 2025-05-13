export const BlogSkeleton = () => {
    return (
      <div className="mt-10 flex flex-col justify-around min-w-[100rem] h-[20rem] p-[20px] bg-[#0B0B0B] border-[1px] border-[#1A1717] animate-pulse space-y-4">
        {/* Top Row: Avatar + Name + Dot + Date */}
        <div className="flex items-center space-x-4">
          <div className="w-6 h-6 rounded-full bg-gray-700" />
          <div className="w-24 h-4 bg-gray-700 rounded" />
          <div className="h-1 w-1 rounded-full bg-gray-500" />
          <div className="w-20 h-4 bg-gray-700 rounded" />
        </div>
  
        {/* Title */}
        <div className="h-8 bg-gray-700 rounded w-3/4" />
  
        {/* Content Snippet */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-700 rounded w-[90%]" />
          <div className="h-4 bg-gray-700 rounded w-[80%]" />
        </div>
  
        {/* Read time */}
        <div className="w-32 h-4 bg-gray-700 rounded" />
  
        {/* Likes */}
        <div className="w-24 h-4 bg-gray-700 rounded" />
      </div>
    );
  };
  