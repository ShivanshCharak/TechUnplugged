import React from 'react';
import { Heart, ThumbsUp, Laugh, Bookmark, Share2 } from 'lucide-react';
import { Reactions } from '../types';

interface ReactionButtonsProps {
  reactions: Reactions;
  isBookmarked: boolean;
  bookmarkCount: number;
  onReaction: (type: keyof Reactions) => void;
  onBookmark: () => void;
}

export const ReactionButtons: React.FC<ReactionButtonsProps> = ({
  reactions,
  isBookmarked,
  bookmarkCount,
  onReaction,
  onBookmark
}) => {
  return (
    <div className="flex items-center space-x-2">
      {/* Like Button */}
      <button 
        onClick={() => onReaction('likes')}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all bg-red-900/20 text-red-400 hover:bg-red-900/30"
      >
        <Heart size={20} />
        <span>{reactions.likes}</span>
      </button>
      
      {/* Applause Button */}
      <button 
        onClick={() => onReaction('applause')}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all bg-green-900/20 text-green-400 hover:bg-green-900/30"
      >
        <ThumbsUp size={20} />
        <span>{reactions.applause}</span>
      </button>
      
      {/* Laugh Button */}
      <button 
        onClick={() => onReaction('laugh')}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/30"
      >
        <Laugh size={20} />
        <span>{reactions.laugh}</span>
      </button>
      
      {/* Bookmark Button */}
      <button 
        onClick={onBookmark}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
          isBookmarked 
            ? 'bg-blue-600 text-white scale-105' 
            : 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30'
        }`}
      >
        <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
        <span>{bookmarkCount}</span>
      </button>
      
      {/* Share Button */}
      <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">
        <Share2 size={20} />
        <span>Share</span>
      </button>
    </div>
  );
};