import { BlogStatsProps } from "../../types";

export const BlogStats: React.FC<BlogStatsProps> = ({ 
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