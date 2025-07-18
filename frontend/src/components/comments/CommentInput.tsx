import React from 'react';
import { Send, Save } from 'lucide-react';
import { Avatar } from '../Avatar';
import { DraftManager } from '../DraftManager';
import { Draft } from '../../types';

interface CommentInputProps {
  newComment: string;
  setNewComment: (value: string) => void;
  authorName: string;
  drafts: Draft[];
  onSaveDraft: () => void;
  onLoadDraft: (draft: Draft) => void;
  onDeleteDraft: (draftId: string) => void;
  onAddComment: () => void;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  newComment,
  setNewComment,
  authorName,
  drafts,
  onSaveDraft,
  onLoadDraft,
  onDeleteDraft,
  onAddComment
}) => {
  return (
    <div className="bg-[#0B0B0B] border border-[#1A1717] rounded-lg p-6">
      <div className="flex items-start space-x-3">
        <Avatar size="small" name={authorName} />
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
            rows={3}
          />
          <DraftManager
            drafts={drafts}
            onSaveDraft={onSaveDraft}
            onLoadDraft={onLoadDraft}
            onDeleteDraft={onDeleteDraft}
          />
          
          <div className="flex justify-between items-center mt-3">
            <div className="flex space-x-2">
              <button
                onClick={onSaveDraft}
                disabled={!newComment.trim()}
                className="flex items-center space-x-2 px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={14} />
                <span>Save Draft</span>
              </button>
            </div>
            <button
              onClick={onAddComment}
              disabled={!newComment.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              <span>Comment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};