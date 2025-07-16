import { useState } from "react";
import { CommentProps } from "../types";
import { Avatar } from "./BlogCard";
import { X } from "lucide-react";

export const Comment: React.FC<CommentProps> = ({ comment, allComments, onReply, onDelete, currentUserId, level = 0 }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Find direct replies to this comment
  const replies = allComments.filter(c => c.replyToId === comment.id);
  const isOwner = comment.userId === currentUserId;

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText('');
      setShowReply(false);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
 

  return (
    <div className={`${level > 0 ? 'ml-6 border-l-2 border-gray-700 pl-4' : ''} mb-3`}>
      <div className="  border border-[#1A1717]  rounded-lg p-4">
        <div className="flex items-start space-x-3">

          <button
            onClick={toggleCollapse}
            className="text-gray-400 hover:text-gray-300 mt-1 transition-colors"
            title={isCollapsed ? 'Expand thread' : 'Collapse thread'}
          >
            {isCollapsed ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            )}
          </button>
          
          <Avatar size="small" name={comment.user.firstname+comment.user.lastname} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-white">{comment.user.firstname+comment.user.lastname}</span>
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
                {replies.length > 0 && (
                  <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                    {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                  </span>
                )}
              </div>
              {isOwner && (
                <button
                  onClick={() => onDelete(comment.id)}
                  className="text-red-400 hover:text-red-300"
                  title="Delete comment"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            {!isCollapsed && (
              <>
                <p className="text-gray-300 mb-3">{comment.content}</p>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowReply(!showReply)}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Reply
                  </button>
                </div>
                
                {showReply && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="What are your thoughts?"
                      className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleReply}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                      >
                        Comment
                      </button>
                      <button
                        onClick={() => setShowReply(false)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {isCollapsed && (
              <p className="text-gray-500 text-sm italic">
                [Thread collapsed - {replies.length} {replies.length === 1 ? 'reply' : 'replies'}]
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Render nested replies */}
      {!isCollapsed && replies.length > 0 && (
        <div className="mt-2">
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              allComments={allComments}
              onReply={onReply}
              onDelete={onDelete}
              currentUserId={currentUserId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};