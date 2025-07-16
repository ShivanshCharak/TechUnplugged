import React from 'react';
import { Heart, ThumbsUp, Laugh } from 'lucide-react';
import { Avatar } from './Avatar';
import { Blog, Reactions } from '../types';

interface BlogSidebarProps {
  blog: Blog;
  reactions: Reactions;
  estimatedReadTime: number;
  commentsCount: number;
}

export const BlogSidebar: React.FC<BlogSidebarProps> = ({
  blog,
  reactions,
  estimatedReadTime,
  commentsCount
}) => {
  return (
    <aside className="lg:col-span-4">
      <div className="sticky top-8 space-y-8">
        
        {/* Author Card */}
        <div className="bg-[#0B0B0B] border-[#1A1717] border rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar size="big" name={blog.author?.name || "Anonymous"} />
            <div>
              <h3 className="font-semibold text-white text-lg">
                {blog.author?.name || "Anonymous"}
              </h3>
              <p className="text-sm text-gray-400">
                Database Engineer & Tech Writer
              </p>
            </div>
          </div>
          
          <p className="text-gray-300 text-sm mb-4">
            Passionate about databases, system design, and sharing knowledge about backend technologies. 
            Writing to help developers understand complex technical concepts.
          </p>
          
          <div className="flex space-x-2">
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Follow
            </button>
            <button className="flex-1 border border-gray-700 text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
              Message
            </button>
          </div>
        </div>
        
        {/* Article Stats */}
        <div className="bg-[#0B0B0B] border-[#1A1717] border rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-white mb-4">Article Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Views</span>
              <span className="font-medium text-white">{blog.views}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Reactions</span>
              <span className="font-medium text-white">
                {reactions.likes + reactions.applause + reactions.laugh}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Reading Time</span>
              <span className="font-medium text-white">{estimatedReadTime} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Word Count</span>
              <span className="font-medium text-white">{blog.wordCount || 1250}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Comments</span>
              <span className="font-medium text-white">{commentsCount}</span>
            </div>
          </div>
        </div>
        
        {/* Reaction Breakdown */}
        <div className="bg-[#0B0B0B] border-[#1A1717] border rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-white mb-4">Reaction Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Heart size={16} className="text-red-400" />
                <span className="text-gray-400">Likes</span>
              </div>
              <span className="font-medium text-white">{reactions.likes}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ThumbsUp size={16} className="text-green-400" />
                <span className="text-gray-400">Applause</span>
              </div>
              <span className="font-medium text-white">{reactions.applause}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Laugh size={16} className="text-yellow-400" />
                <span className="text-gray-400">Laughs</span>
              </div>
              <span className="font-medium text-white">{reactions.laugh}</span>
            </div>
          </div>
        </div>
        
        {/* Table of Contents */}
        <div className="rounded-xl shadow-sm p-6 bg-[#0B0B0B] border-[#1A1717] border">
          <h3 className="font-semibold text-white mb-4">Table of Contents</h3>
          <nav className="space-y-2 text-sm">
            <a href="#origins" className="block text-blue-400 hover:text-blue-300">Origins and Creation of Databases</a>
            <a href="#acid" className="block text-blue-400 hover:text-blue-300">ACID Properties</a>
            <a href="#isolation" className="block text-blue-400 hover:text-blue-300">Database Isolation Levels</a>
            <a href="#levels" className="block text-blue-400 hover:text-blue-300 ml-4">• The 4 Standard Levels</a>
          </nav>
        </div>
        
      </div>
    </aside>
  );
};