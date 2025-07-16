import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Eye, Share2, Bookmark, Heart, MessageCircle, Send, Edit3, Save, X, ThumbsUp, Laugh } from 'lucide-react';
import {set,get} from 'idb-keyval'
import { useBeforeUnload } from 'react-router-dom';

// Type definitions
interface User {
  id: string;
  name: string;
  email: string;
  firstname?: string;
  lastname?: string;
}

interface Author {
  name: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: Author;
  createdAt: string;
  userId: string;
  blogId?: string;
  replyToId: string | null;
}

export interface Reactions {
  id?: string;
  blogId?: string;
  likes: number;
  applause: number;
  laugh: number;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  images: string;
  body: string;
  createdAt: string;
  isDeleted: boolean;
  isPublished: boolean;
  wordCount: number;
  views: number;
  userId: string;
  user: User;
  author: Author;
  tags: Tag[];
  comments: Comment[];
  reactions: Reactions | undefined[];
  _count: {
    comments: number;
    bookmarks?: number;
    reactions?:number
  };
}

interface Draft {
  id: string;
  blogId: string;
  content: string;
  createdAt: string;
}

interface UserReactions {
  likes: boolean;
  applause: boolean;
  laugh: boolean;
}

interface UserData {
  reactions: Record<string, UserReactions>;
  bookmarks: string[];
  drafts: Draft[];
}

// Props interfaces
interface AvatarProps {
  size: 'small' | 'medium' | 'big';
  name: string;
}

interface CommentProps {
  comment: Comment;
  allComments: Comment[];
  onReply: (parentId: string, text: string) => void;
  onDelete: (id: string) => void;
  currentUserId: string;
  level?: number;
}

interface DraftManagerProps {
  drafts: Draft[];
  onSaveDraft: () => void;
  onLoadDraft: (draft: Draft) => void;
  onDeleteDraft: (id: string) => void;
}

interface FullBlogProps {
  blog: Blog;
}

const Avatar: React.FC<AvatarProps> = ({ size, name }) => {
  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-10 h-10 text-base',
    big: 'w-16 h-16 text-xl'
  };
  
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold`}>
      {initials}
    </div>
  );
};

// Mock user data
const currentUser: User = {
  id: 'current-user-123',
  name: 'John Doe',
  email: 'john@example.com'
};

// Sample blog data with reactions
const sampleBlog: Blog = {
  id: '3bac4605-6c0a-4eeb-897e-db599e2dc398',
  title: 'Relational Databases and Isolation Levels',
  slug: 'relational-databas-and-isolation-levels',
  excerpt: 'Understanding the fundamental concepts of database isolation levels and ACID properties for robust data management.',
  images: 'https://res.cloudinary.com/dnvjiudhd/image/upload/v1752542461/folder/blog_images/krkdbdvd4rrlzraodwln.png',
  body: `
    <h2>Origins and Creation of Databases</h2>
    <p>Databases were created to solve fundamental problems in data management that emerged as organizations began processing large volumes of information in the digital age. The need for databases arose from several limitations of earlier file-based systems:</p>
    
    <h3>File System Limitations</h3>
    <p>Before databases, organizations stored data in flat files, which led to:</p>
    <ul>
      <li>Data redundancy (same data stored in multiple files)</li>
      <li>Inconsistency (different versions of the same data)</li>
      <li>Difficulty in accessing related data across files</li>
      <li>Lack of data integrity controls</li>
    </ul>
    
    <h2>Five Essential Database Properties (ACID)</h2>
    <p>Financial systems particularly require databases with these properties, often summarized by the ACID acronym:</p>
    
    <h3>Atomicity</h3>
    <p>Transactions are treated as a single "unit" that either completely succeeds or completely fails. Financial example: Money transfers must complete entirely or not at all (no partial transfers).</p>
    
    <h3>Consistency</h3>
    <p>The database remains in a valid state before and after transactions. Financial example: Account balances must always reflect the sum of all transactions.</p>
    
    <h3>Isolation</h3>
    <p>Concurrent transactions don't interfere with each other. Financial example: Two ATM withdrawals from the same account must be processed sequentially.</p>
    
    <h3>Durability</h3>
    <p>Once committed, transactions persist even after system failures. Financial example: Confirmed transactions must survive power outages or crashes.</p>
    
    <h2>Database Isolation Levels</h2>
    <p>Database isolation levels define the degree to which a transaction is isolated from the changes made by other transactions in a database. They are important for managing the balance between data consistency, concurrency, and performance.</p>
    
    <h3>The 4 Standard Isolation Levels:</h3>
    <ol>
      <li><strong>Read Uncommitted</strong> - Allows reading uncommitted changes</li>
      <li><strong>Read Committed</strong> - Can only read committed data</li>
      <li><strong>Repeatable Read</strong> - Ensures values don't change during transaction</li>
      <li><strong>Serializable</strong> - Highest isolation level, prevents all anomalies</li>
    </ol>
  `,
  createdAt: '2025-07-15T01:21:04.227Z',
  isDeleted: false,
  isPublished: true,
  wordCount: 1250,
  views: 16,
  userId: '9c92471e-9d4e-4449-8498-621fee6dca50',
  user: {
    id: '9c92471e-9d4e-4449-8498-621fee6dca50',
    firstname: 'Shivansh',
    lastname: 'Charak',
    email: 'shivansh15charak@gmail.com',
    name: 'Shivansh Charak'
  },
  author: {
    name: 'Shivansh Charak'
  },
  tags: [
    { id: '1', name: 'Database', color: 'bg-blue-100 text-blue-800' },
    { id: '2', name: 'SQL', color: 'bg-green-100 text-green-800' },
    { id: '3', name: 'Backend', color: 'bg-purple-100 text-purple-800' }
  ],
  comments: [
    {
      id: '1',
      content: 'Great explanation of ACID properties! This really helped me understand the concepts better.',
      author: { name: 'Alice Johnson' },
      createdAt: '2025-07-15T02:30:00.000Z',
      userId: 'user1',
      replyToId: null
    },
    {
      id: '2',
      content: 'Could you elaborate more on the differences between Repeatable Read and Serializable isolation levels?',
      author: { name: 'Bob Smith' },
      createdAt: '2025-07-15T03:15:00.000Z',
      userId: 'user2',
      replyToId: null
    }
  ],
  reactions: {
    id: 'reaction-1',
    blogId: '3bac4605-6c0a-4eeb-897e-db599e2dc398',
    likes: 24,
    applause: 15,
    laugh: 3
  },
  _count: { comments: 2, bookmarks: 5 }
};

// Comment component with nested replies
// Comment component with nested replies
const Comment: React.FC<CommentProps> = ({ comment, allComments, onReply, onDelete, currentUserId, level = 0 }) => {
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
          {/* Collapse/Expand button */}
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
          
          <Avatar size="small" name={comment.author.name} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-white">{comment.author.name}</span>
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
                  <button className="text-sm text-gray-400 hover:text-gray-300">
                    Share
                  </button>
                  <button className="text-sm text-gray-400 hover:text-gray-300">
                    Award
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

// Draft Manager Component
const DraftManager: React.FC<DraftManagerProps> = ({ drafts, onLoadDraft, onDeleteDraft }) => {
  const [showDrafts, setShowDrafts] = useState(false);

  return (
    <div className="mb-4">
      <button
        onClick={() => setShowDrafts(!showDrafts)}
        className="flex items-center space-x-2 text-sm text-gray-400 hover:text-gray-300"
      >
        <Edit3 size={16} />
        <span>Drafts ({drafts.length})</span>
      </button>
      
      {showDrafts && (
        <div className="mt-2 bg-gray-800 rounded-lg p-3 border border-gray-700">
          {drafts.length === 0 ? (
            <p className="text-gray-400 text-sm">No drafts saved</p>
          ) : (
            <div className="space-y-2">
              {drafts.map((draft) => (
                <div key={draft.id} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                  <div className="flex-1">
                    <p className="text-sm text-white truncate">{draft.content.substring(0, 50)}...</p>
                    <p className="text-xs text-gray-400">
                      {new Date(draft.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onLoadDraft(draft)}
                      className="text-blue-400 hover:text-blue-300 p-1"
                      title="Load draft"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteDraft(draft.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Delete draft"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const FullBlog: React.FC<FullBlogProps> = ({ blog = sampleBlog }) => {
  // State management
  const [reactions, setReactions] = useState<Reactions>({ likes: 0, applause: 0, laugh: 0 });
  const [userReactions, setUserReactions] = useState<UserReactions>({ likes: false, applause: false, laugh: false });
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(blog._count.bookmarks);
  const [comments, setComments] = useState<Comment[]>(blog.comments || []);
  const [newComment, setNewComment] = useState('');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);

  // Mock user database (in real app, this would be in a proper database)
  const [userDB, setUserDB] = useState<Record<string, UserData>>({
    [currentUser.id]: {
      reactions: {},
      bookmarks: [],
      drafts: []
    }
  });
   useBeforeUnload(()=>{
    set("PostReactions",userDB)
  })
 
useEffect(() => {
  get('PostReactions').then((draft) => {
    if (draft) setUserDB(draft);
    console.log(draft)
  });
}, []);

  // Initialize user data
  useEffect(() => {
    const userData = userDB[currentUser.id];
    if (userData) {
      setUserReactions(userData.reactions[blog.id] || { likes: false, applause: false, laugh: false });
      setIsBookmarked(userData.bookmarks.includes(blog.id));
      setDrafts(userData.drafts.filter(draft => draft.blogId === blog.id));
    }
  }, [blog.id, userDB]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const estimatedReadTime = Math.ceil((blog.wordCount || 1250) / 200);

  // Handle reactions (likes, applause, laugh)
  const handleReaction = (type: keyof UserReactions) => {
    setUserDB(prev => {
      const newDB = { ...prev };
      const userData = newDB[currentUser.id];
      
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
      const userData = newDB[currentUser.id];
      
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
        newDB[currentUser.id].drafts.push(draft);
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
      newDB[currentUser.id].drafts = newDB[currentUser.id].drafts.filter(d => d.id !== draftId);
      return newDB;
    });
    setDrafts(prev => prev.filter(d => d.id !== draftId));
  };

  // Comment functionality
  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        content: newComment,
        author: { name: currentUser.name },
        createdAt: new Date().toISOString(),
        userId: currentUser.id,
        blogId: blog.id,
        replyToId: null
      };

      setComments(prev => [...prev, comment]);
      setNewComment('');
    }
  };

  const handleReply = (parentCommentId: string, replyText: string) => {
    const reply: Comment = {
      id: Date.now().toString(),
      content: replyText,
      author: { name: currentUser.name },
      createdAt: new Date().toISOString(),
      userId: currentUser.id,
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

  // Get only top-level comments (no replyToId)
  const topLevelComments = comments.filter(c => !c.replyToId);

  return (
    <div className="min-h-screen  bg-black">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags?.map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium"
                >
                  {tag.name}
                </span>
              ))}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              {blog.title}
            </h1>
            
            <div className="flex items-center space-x-6 text-blue-100">
              <div className="flex items-center space-x-2">
                <Calendar size={16} />
                <span>{formatDate(blog.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={16} />
                <span>{estimatedReadTime} min read</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye size={16} />
                <span>{blog.views} views</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                <div className="flex items-center space-x-2">
                  {/* Like Button */}
          
                  <button 
                    onClick={() => {handleReaction('likes')}}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      userReactions.likes 
                        ? 'bg-red-600 text-white scale-105' 
                        : 'bg-red-900/20 text-red-400 hover:bg-red-900/30'
                    }`}
                  >
                 
                    <Heart size={20} fill={userReactions.likes ? 'currentColor' : 'none'} />
                    <span>{reactions.likes}</span>
                  </button>
                  
                  {/* Applause Button */}
                  <button 
                    onClick={() => handleReaction('applause')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      userReactions.applause 
                        ? 'bg-green-600 text-white scale-105' 
                        : 'bg-green-900/20 text-green-400 hover:bg-green-900/30'
                    }`}
                  >
                    <ThumbsUp size={20} fill={userReactions.applause ? 'currentColor' : 'none'} />
                    <span>{reactions.applause}</span>
                  </button>
                  
                  {/* Laugh Button */}
                  
                  <button 
                    onClick={() => handleReaction('laugh')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      userReactions.laugh 
                        ? 'bg-yellow-600 text-white scale-105' 
                        : 'bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/30'
                    }`}
                  >
                    <Laugh size={20} fill={userReactions.laugh ? 'currentColor' : 'none'} />
                    <span>{reactions.laugh}</span>
                  </button>
                  
                  {/* Bookmark Button */}
                  <button 
                    onClick={handleBookmark}
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
                
                <div className="text-sm text-gray-400">
                  {comments.length} comments • {bookmarkCount} bookmarks
                </div>
              </div>
            </div>

            {/* Comments Section */}
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
                  {/* Add Comment */}
                  <div className=" bg-[#0B0B0B] border border-[#1A1717] rounded-lg p-6  ">
                    <div className="flex items-start space-x-3">
                      <Avatar size="small" name={currentUser.name} />
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
                          onSaveDraft={saveDraft}
                          onLoadDraft={loadDraft}
                          onDeleteDraft={deleteDraft}
                        />
                        
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={saveDraft}
                              disabled={!newComment.trim()}
                              className="flex items-center space-x-2 px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Save size={14} />
                              <span>Save Draft</span>
                            </button>
                          </div>
                          <button
                            onClick={handleAddComment}
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

                  {/* Comments List */}
                  <div>
                    {topLevelComments.map((comment) => (
                      <Comment
                        key={comment.id}
                        comment={comment}
                        allComments={comments}
                        onReply={handleReply}
                        onDelete={handleDeleteComment}
                        currentUserId={currentUser.id}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
          
          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-8 space-y-8">
              
              {/* Author Card */}
              <div className=" bg-[#0B0B0B] border-[#1A1717] border rounded-xl shadow-sm p-6 ">
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
              <div className="bg-[#0B0B0B] border-[#1A1717] border rounded-xl shadow-sm p-6 ">
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
                    <span className="font-medium text-white">{comments.length}</span>
                  </div>
                </div>
              </div>
              
              {/* Reaction Breakdown */}
              <div className="bg-[#0B0B0B] border-[#1A1717] border rounded-xl shadow-sm p-6 ">
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
              <div className=" rounded-xl shadow-sm p-6 bg-[#0B0B0B] border-[#1A1717] border">
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

