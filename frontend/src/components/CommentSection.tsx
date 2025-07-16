import React from 'react';
import { MessageCircle } from 'lucide-react';
import { CommentInput } from './CommentInput'
import { Comment } from './Comment';
import { comment, Draft } from '../types';

interface CommentsSectionProps {
  comments: comment[];
  isCommentSectionOpen: boolean;
  setIsCommentSectionOpen: (open: boolean) => void;
  newComment: string;
  setNewComment: (value: string) => void;
  authorName: string;
  drafts: Draft[];
  onSaveDraft: () => void;
  onLoadDraft: (draft: Draft) => void;
  onDeleteDraft: (draftId: string) => void;
  onAddComment: () => void;
  onReply: (parentCommentId: string, replyText: string) => void;
  onDeleteComment: (commentId: string) => void;
  currentUserId?: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  isCommentSectionOpen,
  setIsCommentSectionOpen,
  newComment,
  setNewComment,
  authorName,
  drafts,
  onSaveDraft,
  onLoadDraft,
  onDeleteDraft,
  onAddComment,
  onReply,
  onDeleteComment,
  currentUserId
}) => {
  const topLevelComments = comments;
  console.log(topLevelComments)
  return (
    <div className="mt-12 border-t border-gray-800 pt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">
          Comments ({comments.length})
        </h3>
        <button
          onClick={() => setIsCommentSectionOpen(!isCommentSectionOpen)}
          className="flex items-center space-x-2 text-blue-400 hover:text-blue-300"
        >
          <MessageCircle size={20} />
          <span>{isCommentSectionOpen ? 'Hide' : 'Show'} Comments</span>
        </button>
      </div>

      {isCommentSectionOpen && (
        <div className="space-y-6">
          {/* Add comment */}
          <CommentInput
            newComment={newComment}
            setNewComment={setNewComment}
            authorName={authorName}
            drafts={drafts}
            onSaveDraft={onSaveDraft}
            onLoadDraft={onLoadDraft}
            onDeleteDraft={onDeleteDraft}
            onAddComment={onAddComment}
          />

          {/* Comments List */}
          <div>
            {topLevelComments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                allComments={comments}
                onReply={onReply}
                onDelete={onDeleteComment}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};