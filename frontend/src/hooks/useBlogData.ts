import { useState, useEffect, useContext } from 'react';
import { set, get } from 'idb-keyval';
import { useBeforeUnload } from 'react-router-dom';
import { AuthContext } from '../utils/context/userContext';
import { InteractionContext } from '../utils/context/userInteraction';
import { AuthService } from '../utils/AuthService';
import { Blog, IBlogReactions, Reactions, Draft, comment } from '../types';

export const useBlogData = (blog: Blog) => {
  const { setAuthData, authData } = useContext(AuthContext);
  const { reactions, setReactions, drafts, setDrafts, newComment, setNewComment, isBookmarked, setIsBookmarked } = useContext(InteractionContext);

  const [bookmarkCount, setBookmarkCount] = useState(blog._count.bookmarks);
  const [comments, setComments] = useState<comment[]>(blog.comments || []);
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);
  const [blogDB, setBlogDB] = useState<Record<string, IBlogReactions>>({});


  useEffect(() => {
    const data = AuthService.getJsonAccessData();
    if (data) {
      setAuthData(data);
    }
  }, [setAuthData]);


  useEffect(() => {
    if (blog.id) {
      setReactions({
        likes: blog?.reactions?.likes ?? 0,
        applause: blog?.reactions?.applause ?? 0,
        laugh: blog?.reactions?.laugh ?? 0
      });

      setBlogDB(prev => ({
        ...prev,
        [blog.id]: {
          reactions: {
            likes: blog?.reactions?.likes ?? 0,
            applause: blog?.reactions?.applause ?? 0,
            laugh: blog?.reactions?.laugh ?? 0
          },
          bookmarks: [],
          drafts: []
        }
      }));
    }
  }, [blog.id, blog.reactions, setReactions]);


  useEffect(() => {
    get('PostReactions').then((savedData) => {
      if (savedData) {
        setBlogDB(savedData);
        
        if (savedData[blog.id]) {
          setReactions(savedData[blog.id].reactions);
          setIsBookmarked(savedData[blog.id].bookmarks.includes(authData?.id));
          setDrafts(savedData[blog.id].drafts.filter(draft => draft.userId === authData?.id));
        }
      }
    });
  }, [blog.id, authData?.id, setReactions, setIsBookmarked, setDrafts]);

  useBeforeUnload(() => {
    set("PostReactions", blogDB);
  });

  // Utility functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const estimatedReadTime = Math.ceil((blog.wordCount || 1250) / 200);

  // Handlers
  const handleReaction = (type: keyof Reactions) => {
    setBlogDB(prev => {
      const newDB = { ...prev };
      
      if (!newDB[blog.id]) {
        newDB[blog.id] = {
          reactions: { likes: 0, applause: 0, laugh: 0 },
          bookmarks: [],
          drafts: []
        };
      }
      
      newDB[blog.id].reactions[type] += 1;
      return newDB;
    });
    
    setReactions(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
  };

  const handleBookmark = () => {
    if (!authData?.id) return;
    
    setBlogDB(prev => {
      const newDB = { ...prev };
      
      if (!newDB[blog.id]) {
        newDB[blog.id] = {
          reactions: { likes: 0, applause: 0, laugh: 0 },
          bookmarks: [],
          drafts: []
        };
      }
      
      const blogData = newDB[blog.id];
      
      if (isBookmarked) {
        blogData.bookmarks = blogData.bookmarks.filter(id => id !== authData.id);
        setBookmarkCount(prev => prev - 1);
      } else {
        blogData.bookmarks.push(authData.id);
        setBookmarkCount(prev => prev + 1);
      }
      
      return newDB;
    });
    setIsBookmarked(!isBookmarked);
  };

  const saveDraft = () => {
    if (newComment.trim() && authData?.id) {
      const draft: Draft = {
        id: Date.now().toString(),
        blogId: blog.id,
        userId: authData.id,
        content: newComment,
        createdAt: new Date().toISOString()
      };

      setBlogDB(prev => {
        const newDB = { ...prev };
        
        if (!newDB[blog.id]) {
          newDB[blog.id] = {
            reactions: { likes: 0, applause: 0, laugh: 0 },
            bookmarks: [],
            drafts: []
          };
        }
        
        newDB[blog.id].drafts.push(draft);
        return newDB;
      });

      setDrafts(prev => [...prev, draft]);
      setNewComment('');
    }
  };

  const loadDraft = (draft: Draft) => {
    setNewComment(draft.content);
  };

  const deleteDraft = (draftId: string) => {
    setBlogDB(prev => {
      const newDB = { ...prev };
      if (newDB[blog.id]) {
        newDB[blog.id].drafts = newDB[blog.id].drafts.filter(d => d.id !== draftId);
      }
      return newDB;
    });
    setDrafts(prev => prev.filter(d => d.id !== draftId));
  };

  const handleAddComment = () => {
    if (newComment.trim() && authData?.name) {
      const comment: comment = {
        id: Date.now().toString(),
        content: newComment,
        author: {
          name: authData.name,
          id: authData.id || ''
        },
        createdAt: new Date().toISOString(),
        userId: authData.id,
        blogId: blog.id,
        replyToId: null
      };

      setComments(prev => [...prev, comment]);
      setNewComment('');
    }
  };

  const handleReply = (parentCommentId: string, replyText: string) => {
    if (authData?.name) {
      const reply: comment = {
        id: Date.now().toString(),
        content: replyText,
        author: {
          name: authData.name,
          id: authData.id || ''
        },
        createdAt: new Date().toISOString(),
        userId: authData.id,
        blogId: blog.id,
        replyToId: parentCommentId
      };

      setComments(prev => [...prev, reply]);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    const deleteCommentAndReplies = (id: string) => {
      const repliesToDelete = comments.filter(c => c.replyToId === id);
      repliesToDelete.forEach(reply => deleteCommentAndReplies(reply.id));
      setComments(prev => prev.filter(c => c.id !== id));
    };
    
    deleteCommentAndReplies(commentId);
  };

  return {
    // State
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
    
    // Computed values
    formatDate,
    estimatedReadTime,
    
    // Handlers
    handleReaction,
    handleBookmark,
    saveDraft,
    loadDraft,
    deleteDraft,
    handleAddComment,
    handleReply,
    handleDeleteComment
  };
};