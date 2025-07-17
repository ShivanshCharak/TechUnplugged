import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { set, get } from 'idb-keyval';
import { useBeforeUnload } from 'react-router-dom';
import { AuthContext } from '../utils/context/userContext';
import { InteractionContext } from '../utils/context/userInteraction';
import { AuthService } from '../utils/AuthService';
import { flattenComments } from './FlattenBlogData';
import { Blog, IBlogReactions, Reactions, Draft, comment } from '../types';

export const useBlogData = (blog: Blog) => {
  const { setAuthData, authData } = useContext(AuthContext);
  const { reactions, setReactions, drafts, setDrafts, newComment, setNewComment, isBookmarked, setIsBookmarked } = useContext(InteractionContext);

  const [bookmarkCount, setBookmarkCount] = useState(blog._count.bookmarks);
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);
  const [blogDB, setBlogDB] = useState<Record<string, IBlogReactions>>({});
  

  const dataLoadedRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

const comments = blogDB[blog.id]?.comments || flattenComments(blog.comments || []);


  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (Object.keys(blogDB).length > 0) {
        set("PostReactions", blogDB);
        console.log('Saved blogDB:', blogDB);
      }
    }, 1000); // Save after 1 second of inactivity
  }, [blogDB]);

  // Initialize auth data
  useEffect(() => {
    const data = AuthService.getJsonAccessData();
    if (data) {
      setAuthData(data);
    }
  }, [setAuthData]);


  useEffect(() => {
    if (!blog.id || dataLoadedRef.current) return;
    
    const loadData = async () => {
      try {
        // Load saved reactions/data from IndexedDB
        const savedReactions = await get('PostReactions') as Record<string, IBlogReactions> | undefined;

        // Initialize blog reactions
        const initialReactions = {
          likes: blog?.reactions?.likes ?? 0,
          applause: blog?.reactions?.applause ?? 0,
          laugh: blog?.reactions?.laugh ?? 0
        };

        setReactions(initialReactions);
        let initialBlogDB: Record<string, IBlogReactions> = {};
        
        if (savedReactions) {
          initialBlogDB = { ...savedReactions };
        }

        // Ensure current blog has entry in blogDB
        if (!initialBlogDB[blog.id]) {
          initialBlogDB[blog.id] = {
            reactions: initialReactions,
            bookmarks: [],
            drafts: [],
            comments: flattenComments(blog.comments || []) 
          };
        } else {
          
          const serverComments = flattenComments(blog.comments || []);
          const storedComments = initialBlogDB[blog.id].comments || [];
          
          const allCommentIds = new Set(storedComments.map(c => c.id));
          const newServerComments = serverComments.filter(c => !allCommentIds.has(c.id));
          
          initialBlogDB[blog.id].comments = [...storedComments, ...newServerComments];
        }

        // Apply saved data if it exists for this blog
        if (savedReactions && savedReactions[blog.id]) {
          const blogData = savedReactions[blog.id];
          setReactions(blogData.reactions);
          setIsBookmarked(blogData.bookmarks.includes(authData?.id));
          setDrafts(blogData.drafts.filter(draft => draft.userId === authData?.id));
        }

        setBlogDB(initialBlogDB);
        dataLoadedRef.current = true;
        console.log('Loaded initial data:', initialBlogDB);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [blog.id, authData?.id, setReactions, setIsBookmarked, setDrafts]);

  // Reset data loaded flag when blog changes
  useEffect(() => {
    dataLoadedRef.current = false;
  }, [blog.id]);

  // Save data before unload
  useBeforeUnload(() => {
    if (Object.keys(blogDB).length > 0) {
      set("PostReactions", blogDB);
      console.log('Saving on unload:', blogDB);
    }
  });

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

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

  // Helper function to ensure blog entry exists in blogDB
  const ensureBlogEntry = (blogDB: Record<string, IBlogReactions>, blogId: string) => {
    if (!blogDB[blogId]) {
      blogDB[blogId] = {
        reactions: { likes: 0, applause: 0, laugh: 0 },
        bookmarks: [],
        drafts: [],
        comments: []
      };
    }
  };

  // Handlers
  const handleReaction = (type: 'likes'|'applause'|'laugh') => {
    setBlogDB(prev => {
      const newDB = { ...prev };
      ensureBlogEntry(newDB, blog.id);
      
      const currentValue = newDB[blog.id].reactions[type];
      newDB[blog.id].reactions[type] = (typeof currentValue === 'number' ? currentValue : 0) + 1;
      
      return newDB;
    });
    
    setReactions(prev => ({
      ...prev,
      [type]: (typeof prev[type] === 'number' ? prev[type] : 0) + 1
    }));

    debouncedSave();
  };

  const handleBookmark = () => {
    if (!authData?.id) return;
    
    setBlogDB(prev => {
      const newDB = { ...prev };
      ensureBlogEntry(newDB, blog.id);
      
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
    debouncedSave();
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
        ensureBlogEntry(newDB, blog.id);
        newDB[blog.id].drafts.push(draft);
        return newDB;
      });

      setDrafts(prev => [...prev, draft]);
      setNewComment('');
      debouncedSave();
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
    debouncedSave();
  };

  const handleAddComment = () => {
    if (newComment.trim() && authData?.name) {
      const comment: comment = {
        id: Date.now().toString(),
        content: newComment,
        user: {
          firstname: authData.name.split(' ')[0] || authData.name,
          lastname: authData.name.split(' ')[1] || ''
        },
        createdAt: new Date().toISOString(),
        userId: authData.id || '',
        blogId: blog.id,
        replyToId: null
      };

      // Update blogDB - single source of truth
      setBlogDB(prev => {
        const newDB = { ...prev };
        ensureBlogEntry(newDB, blog.id);
        
        // Check if comment already exists to prevent duplicates
        const commentExists = newDB[blog.id].comments.some(c => c.id === comment.id);
        if (!commentExists) {
          newDB[blog.id].comments.push(comment);
        }
        
        return newDB;
      });
      
      setNewComment('');
      debouncedSave();
    }
  };

  const handleReply = (parentCommentId: string, replyText: string) => {
    if (authData?.name) {
      const reply: comment = {
        id: Date.now().toString(),
        content: replyText,
        user: {
          firstname: authData.name.split(' ')[0] || authData.name,
          lastname: authData.name.split(' ')[1] || ''
        },
        createdAt: new Date().toISOString(),
        userId: authData.id || '',
        blogId: blog.id,
        replyToId: parentCommentId
      };

      // Update blogDB - single source of truth
      setBlogDB(prev => {
        const newDB = { ...prev };
        ensureBlogEntry(newDB, blog.id);
        
        // Check if reply already exists to prevent duplicates
        const replyExists = newDB[blog.id].comments.some(c => c.id === reply.id);
        if (!replyExists) {
          newDB[blog.id].comments.push(reply);
        }
        
        return newDB;
      });

      debouncedSave();
    }
  };

  const handleDeleteComment = (commentId: string) => {
    const deleteCommentAndReplies = (id: string) => {
      setBlogDB(prev => {
        const newDB = { ...prev };
        if (!newDB[blog.id]) return newDB;
        
        // Find all replies to this comment
        const repliesToDelete = newDB[blog.id].comments.filter(c => c.replyToId === id);
        
        // Recursively delete replies
        repliesToDelete.forEach(reply => deleteCommentAndReplies(reply.id));
        
        // Delete the comment itself
        newDB[blog.id].comments = newDB[blog.id].comments.filter(c => c.id !== id);
        
        return newDB;
      });
    };
    
    deleteCommentAndReplies(commentId);
    debouncedSave();
  };

  return {
    // State
    authData,
    reactions,
    bookmarkCount,
    comments, // Now derived from blogDB
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