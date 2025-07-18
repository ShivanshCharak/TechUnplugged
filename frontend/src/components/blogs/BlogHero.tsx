import React from 'react';
import { Calendar, Clock, Eye } from 'lucide-react';
import { Blog } from '../../types';

interface BlogHeroProps {
  blog: Blog;
  estimatedReadTime: number;
  formatDate: (dateString: string) => string;
}

export const BlogHero: React.FC<BlogHeroProps> = ({ blog, estimatedReadTime, formatDate }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16  h-[400px]">
        <div className="mb-6 ">
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.tags?.map((tag) => (
              <span
                key={tag.id}
                className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium"
              >
                {tag.name}
              </span>
            ))}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-center mt-[10%]">
            {blog.title}
          </h1>
          
          <div className="flex items-center space-x-6 text-blue-100 h-full w-full ml-[170px] mt-4">
            <div className="flex items-center space-x-2">
              <Calendar size={16} />
              <span>{formatDate(blog.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock size={16} />
              <span>{estimatedReadTime} min read</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye size={16} />
              <span>{blog.views} views</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};