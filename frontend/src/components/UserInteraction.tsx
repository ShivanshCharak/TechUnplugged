import { UserReactions } from "../types";

 // Handle reactions (likes, applause, laugh)
  export const handleReaction = (type: keyof UserReactions) => {
    setUserDB(prev => {
      const newDB = { ...prev };
      const userData = newDB[authData.id];
      
      if (!userData.reactions[blog.id]) {
        userData.reactions[blog.id] = { likes: false, applause: false, laugh: false };
      }
      
      console.log("was active called")
      const wasActive = userData.reactions[blog.id][type];
      
      userData.reactions[blog.id][type] = !wasActive;
      console.log(wasActive)
        console.log(reactions)
      // Update reaction counts
      setReactions(prevReactions => ({
        ...prevReactions,
        [type]: wasActive ? prevReactions[type] - 1 : prevReactions[type] + 1
      }));
      
      return newDB;
    });
  };

  // Bookmark functionality
  const handleBookmark = () => {
    setUserDB(prev => {
      const newDB = { ...prev };
      const userData = newDB[authData.id];
      
      if (isBookmarked) {
        userData.bookmarks = userData.bookmarks.filter(id => id !== blog.id);
        setBookmarkCount(prev => prev - 1);
      } else {
        userData.bookmarks.push(blog.id);
        setBookmarkCount(prev => prev + 1);
      }
      
      return newDB;
    });
    setIsBookmarked(!isBookmarked);
  };

  // Draft management
  const saveDraft = () => {
    if (newComment.trim()) {
      const draft: Draft = {
        id: Date.now().toString(),
        blogId: blog.id,
        content: newComment,
        createdAt: new Date().toISOString()
      };

      setUserDB(prev => {
        const newDB = { ...prev };
        newDB[authData.id].drafts.push(draft);
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
    setUserDB(prev => {
      const newDB = { ...prev };
      newDB[authData.id].drafts = newDB[authData.id].drafts.filter(d => d.id !== draftId);
      return newDB;
    });
    setDrafts(prev => prev.filter(d => d.id !== draftId));
  };

  // comment functionality
  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: comment = {
        id: Date.now().toString(),
        content: newComment,
        author: {
          name: authData.name,
          id: ''
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
    const reply: comment = {
      id: Date.now().toString(),
      content: replyText,
      author: {
        name: authData.name,
        id: ''
      },
      createdAt: new Date().toISOString(),
      userId: authData.id,
      blogId: blog.id,
      replyToId: parentCommentId
    };

    setComments(prev => [...prev, reply]);
  };

  const handleDeleteComment = (commentId: string) => {
    // Delete the comment and all its nested replies
    const deleteCommentAndReplies = (id: string) => {
      const repliesToDelete = comments.filter(c => c.replyToId === id);
      repliesToDelete.forEach(reply => deleteCommentAndReplies(reply.id));
      setComments(prev => prev.filter(c => c.id !== id));
    };
    
    deleteCommentAndReplies(commentId);
  };