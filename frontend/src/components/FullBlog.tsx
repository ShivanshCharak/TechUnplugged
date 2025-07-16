import React from 'react';
import { FullBlogProps } from '../types';
import { useBlogData } from '../hooks/useBlogData';
import { BlogHero } from './BlogHero';
import { ReactionButtons } from './ReactionButtons';
import { CommentsSection } from './CommentSection';
import { BlogSidebar } from './BlogSidebar';

export const FullBlog: React.FC<FullBlogProps> = ({ blog }) => {
  const {
    authData,
    reactions,
    bookmarkCount,
    comments,
    isCommentSectionOpen,
    setIsCommentSectionOpen,
    newComment,
    setNewComment,
    isBookmarked,
    drafts,
    formatDate,
    estimatedReadTime,
    handleReaction,
    handleBookmark,
    saveDraft,
    loadDraft,
    deleteDraft,
    handleAddComment,
    handleReply,
    handleDeleteComment
  } = useBlogData(blog);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <BlogHero 
        blog={blog} 
        estimatedReadTime={estimatedReadTime} 
        formatDate={formatDate} 
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Article Content */}
          <article className="lg:col-span-8">
            {/* Featured Image */}
            {blog.images && (
              <div className="mb-8">
                <img
                  src={blog.images}
                  alt={blog.title}
                  className="w-full h-64 md:h-80 object-cover rounded-xl shadow-lg"
                />
              </div>
            )}
            
            {/* Article Body */}
            <div className="prose prose-lg max-w-none prose-invert">
              <div 
                className="article-content"
                dangerouslySetInnerHTML={{ __html: blog.body }}
              />
            </div>
            
            {/* Article Footer with Reactions */}
            <div className="mt-12 pt-8 border-t border-gray-800">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <ReactionButtons
                  reactions={reactions}
                  isBookmarked={isBookmarked}
                  bookmarkCount={bookmarkCount}
                  onReaction={handleReaction}
                  onBookmark={handleBookmark}
                />
                
                <div className="text-sm text-gray-400">
                  {comments.length} comments • {bookmarkCount} bookmarks
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <CommentsSection
              comments={comments}
              isCommentSectionOpen={isCommentSectionOpen}
              setIsCommentSectionOpen={setIsCommentSectionOpen}
              newComment={newComment}
              setNewComment={setNewComment}
              authorName={authData?.name || 'Anonymous'}
              drafts={drafts}
              onSaveDraft={saveDraft}
              onLoadDraft={loadDraft}
              onDeleteDraft={deleteDraft}
              onAddComment={handleAddComment}
              onReply={handleReply}
              onDeleteComment={handleDeleteComment}
              currentUserId={authData?.id}
            />
          </article>
          
          {/* Sidebar */}
          <BlogSidebar
            blog={blog}
            reactions={reactions}
            estimatedReadTime={estimatedReadTime}
            commentsCount={comments.length}
          />
        </div>
      </div>
      
      {/* Inline Styles for Article Content */}
      <style dangerouslySetInnerHTML={{ __html: `
        .article-content h2 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #f9fafb;
        }
        
        .article-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #e5e7eb;
        }
        
        .article-content p {
          margin-bottom: 1rem;
          line-height: 1.7;
          color: #d1d5db;
        }
        
        .article-content ul, .article-content ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        
        .article-content li {
          margin-bottom: 0.5rem;
          color: #d1d5db;
        }
        
        .article-content strong {
          font-weight: 600;
          color: #f9fafb;
        }
        
        .article-content code {
          background-color: #374151;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.875rem;
          color: #e5e7eb;
        }
      `}} />
    </div>
  );
};