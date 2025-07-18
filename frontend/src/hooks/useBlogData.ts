import { useState, useEffect, useContext } from 'react';
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
  const [dataLoaded, setDataLoaded] = useState(false);

  let comments = blogDB[blog.id]?.comments || flattenComments(blog.comments || []);
  comments = comments.filter((comment) => comment.id);

  useEffect(() => {
    const data = AuthService.getJsonAccessData();
    if (data) {
      setAuthData(data);
    }
  }, [setAuthData]);

  useEffect(() => {
    if (!blog.id || dataLoaded) return;

    const loadData = async () => {
      try {
        const savedReactions = await get('PostReactions') as Record<string, IBlogReactions> | undefined;

        const initialReactions = {
          likes: blog?.reactions?.likes ?? 0,
          applause: blog?.reactions?.applause ?? 0,
          laugh: blog?.reactions?.laugh ?? 0
        };
        setReactions(initialReactions);

        let initialBlogDB: Record<string, IBlogReactions> = savedReactions ? { ...savedReactions } : {};

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

        if (savedReactions && savedReactions[blog.id]) {
          const blogData = savedReactions[blog.id];
          setReactions(blogData.reactions);
          setIsBookmarked(blogData.bookmarks.includes(authData?.id));
          setDrafts(blogData.drafts.filter(draft => draft.userId === authData?.id));
        }

        setBlogDB(initialBlogDB);
        setDataLoaded(true);
        console.log('Loaded initial data:', initialBlogDB);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [blog.id, authData?.id, setReactions, setIsBookmarked, setDrafts, dataLoaded]);

  useEffect(() => {
    setDataLoaded(false);
  }, [blog.id]);

  useBeforeUnload(() => {
    if (Object.keys(blogDB).length > 0) {
      set("PostReactions", blogDB);
      console.log('Saving on unload:', blogDB);
    }
  });

  useEffect(() => {
    const retryFailedSyncs = async () => {
      if (!blogDB[blog.id]?.comments) return;

      const failedComments = blogDB[blog.id].comments.filter(c => c._syncFailed);

      for (const comment of failedComments) {
        try {
          const response = await fetch('http://localhost:8787/api/v1/blog/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(comment)
          });

          if (response.ok) {
            console.log("successfully appended");
          }
        } catch (error) {
          console.error('Retry sync failed:', error);
        }
      }
    };

    const retryInterval = setInterval(retryFailedSyncs, 30000);
    return () => clearInterval(retryInterval);
  }, [blogDB, blog.id]);

  useEffect(() => {
    const handleOnline = () => {
      if (!blogDB[blog.id]?.comments) return;

      const pendingComments = blogDB[blog.id].comments.filter(c => c._pendingSync || c._syncFailed);

      pendingComments.forEach(async (comment) => {
        try {
          const response = await fetch('http://localhost:8787/api/v1/blog/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(comment)
          });

          if (response.ok) {
            const savedComment = await response.json();
            console.log("successfully appended");
          }
        } catch (error) {
          console.error('Online sync failed:', error);
        }
      });
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [blogDB, blog.id]);

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

  const handleReaction = (type: 'likes' | 'applause' | 'laugh') => {
    setBlogDB(prev => {
      const newDB = { ...prev };
      ensureBlogEntry(newDB, blog.id);
      newDB[blog.id].reactions[type] = (newDB[blog.id].reactions[type] || 0) + 1;
      set("PostReactions", newDB);
      return newDB;
    });

    setReactions(prev => ({
      ...prev,
      [type]: (prev[type] || 0) + 1
    }));
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

      set("PostReactions", newDB);
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
        ensureBlogEntry(newDB, blog.id);
        newDB[blog.id].drafts.push(draft);
        set("PostReactions", newDB);
        return newDB;
      });

      setDrafts(prev => [...prev, draft]);
      setNewComment('');
    }
  };

  const loadDraft = (draft: Draft) => setNewComment(draft.content);

  const deleteDraft = (draftId: string) => {
    setBlogDB(prev => {
      const newDB = { ...prev };
      if (newDB[blog.id]) {
        newDB[blog.id].drafts = newDB[blog.id].drafts.filter(d => d.id !== draftId);
        set("PostReactions", newDB);
      }
      return newDB;
    });

    setDrafts(prev => prev.filter(d => d.id !== draftId));
  };

  const handleAddComment = async () => {
  if (newComment.trim() && authData?.name) {
    const comment = {
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

    // Add to local state immediately (optimistic update)
    setBlogDB(prev => {
      const newDB = { ...prev };
      ensureBlogEntry(newDB, blog.id);

      if (!newDB[blog.id].comments.some(c => c.id === comment.id)) {
        newDB[blog.id].comments.push({ ...comment, _pendingSync: true });
        set("PostReactions", newDB);
      }

      return newDB;
    });

    setNewComment('');

    try {
      const response = await fetch('http://localhost:8787/api/v1/blog/comments', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(comment)
      });

      if (response.ok) {
        const savedComment = await response.json();
        
        // Update local state with server response
        setBlogDB(prev => {
          const newDB = { ...prev };
          const idx = newDB[blog.id].comments.findIndex(c => c.id === comment.id);
          
          if (idx !== -1) {
            // Replace temporary comment with server version
            newDB[blog.id].comments[idx] = {
              ...savedComment,
              _pendingSync: false,
              _syncFailed: false
            };
          } else {
            // If not found, add it
            newDB[blog.id].comments.push({
              ...savedComment,
              _pendingSync: false,
              _syncFailed: false
            });
          }
          
          set("PostReactions", newDB);
          return newDB;
        });
        
        console.log("Comment synced successfully");
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (err) {
      console.error("Failed to sync comment:", err);
      
      // Mark comment as failed
      setBlogDB(prev => {
        const newDB = { ...prev };
        const idx = newDB[blog.id].comments.findIndex(c => c.id === comment.id);
        
        if (idx !== -1) {
          newDB[blog.id].comments[idx]._syncFailed = true;
          newDB[blog.id].comments[idx]._pendingSync = false;
          set("PostReactions", newDB);
        }
        
        return newDB;
      });
      
      // Optional: Show error to user
      // toast.error("Failed to post comment. Will retry when online.");
    }
  }
};

const handleReply = async (parentId: string, text: string) => {
  if (!authData?.name) return;

  const reply: comment = {
    id: Date.now().toString(),
    content: text,
    user: {
      firstname: authData.name.split(' ')[0] || authData.name,
      lastname: authData.name.split(' ')[1] || ''
    },
    createdAt: new Date().toISOString(),
    userId: authData.id || '',
    blogId: blog.id,
    replyToId: parentId
  };

  // Add to local state immediately (optimistic update)
  setBlogDB(prev => {
    const newDB = { ...prev };
    ensureBlogEntry(newDB, blog.id);
    if (!newDB[blog.id].comments.some(c => c.id === reply.id)) {
      newDB[blog.id].comments.push({ ...reply, _pendingSync: true });
      set("PostReactions", newDB);
    }
    return newDB;
  });

  try {
    const response = await fetch("http://localhost:8787/api/v1/blog/comments", {
      method: 'POST', // This was missing
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reply),
    });

    if (response.ok) {
      const savedReply = await response.json();
      
      // Update local state with server response
      setBlogDB(prev => {
        const newDB = { ...prev };
        const idx = newDB[blog.id].comments.findIndex(c => c.id === reply.id);
        
        if (idx !== -1) {
          // Replace temporary reply with server version
          newDB[blog.id].comments[idx] = {
            ...savedReply,
            _pendingSync: false,
            _syncFailed: false
          };
        }
        
        set("PostReactions", newDB);
        return newDB;
      });
      
      console.log("Reply synced successfully");
    } else {
      throw new Error(`Server error: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to sync reply:", error);
    
    // Mark reply as failed
    setBlogDB(prev => {
      const newDB = { ...prev };
      const idx = newDB[blog.id].comments.findIndex(c => c.id === reply.id);
      
      if (idx !== -1) {
        newDB[blog.id].comments[idx]._syncFailed = true;
        newDB[blog.id].comments[idx]._pendingSync = false;
        set("PostReactions", newDB);
      }
      
      return newDB;
    });
  }
};

  const handleDeleteComment = (commentId: string) => {
    const deleteRecursively = (id: string) => {
      setBlogDB(prev => {
        const newDB = { ...prev };
        if (!newDB[blog.id]) return newDB;

        const replies = newDB[blog.id].comments.filter(c => c.replyToId === id);
        replies.forEach(reply => deleteRecursively(reply.id));

        newDB[blog.id].comments = newDB[blog.id].comments.filter(c => c.id !== id);
        set("PostReactions", newDB);
        return newDB;
      });
    };

    deleteRecursively(commentId);
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const estimatedReadTime = Math.ceil((blog.wordCount || 1250) / 200);

  return {
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
  };
};
