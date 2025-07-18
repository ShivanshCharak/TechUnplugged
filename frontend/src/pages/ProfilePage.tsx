import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Edit, ExternalLink, Twitter, Github, Linkedin, Award, Database, Globe, Loader2, BookOpen, MessageSquare, Bookmark } from 'lucide-react';
import { Appbar } from '../components/Appbar';

interface UserData {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  fullName: string;
  memberSince: string;
  profile: {
    avatar: string | null;
    intro: string | null;
    tech: string | null;
  };
  follower:number,
  following:number
  recentBlogs: Array<{
    id: string;
    title: string;
    slug: string;
    createdAt: string;
  }>;
  stats: {
    totalBlogs: number;
    totalComments: number;
    totalBookmarks: number;
  };
}

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    
    const authData = localStorage.getItem('authData');
    if (authData) {
      const currentUserId = JSON.parse(authData);
      setIsOwnProfile(currentUserId.id === id);
    }

    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8787/api/v1/user/${id}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      console.log(data)
      setUserData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const parseTechStack = (tech: string | null) => {
    if (!tech) return [];
    try {
      // If tech is stored as JSON array
      return JSON.parse(tech);
    } catch {
      // If tech is comma-separated string
      return tech.split(',').map(t => t.trim()).filter(Boolean);
    }
  };

  const getTechColor = (index: number) => {
    const colors = [
      "bg-orange-600", "bg-red-600", "bg-yellow-600", 
      "bg-blue-600", "bg-purple-600", "bg-green-600", 
      "bg-blue-500", "bg-pink-600", "bg-indigo-600"
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white">
        <Appbar />
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen text-white">
        <Appbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'User not found'}</p>

          </div>
        </div>
      </div>
    );
  }

  const techStack = parseTechStack(userData.profile.tech);

  return (
    <div className="min-h-screen text-white">
      <Appbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-[10%]">
          
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <div className="rounded-lg border bg-[#0B0B0B] border-[#1A1717] p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                    {userData.profile.avatar ? (
                      <img 
                        src={userData.profile.avatar} 
                        alt={userData.fullName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {userData.firstname[0]}{userData.lastname[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">{userData.fullName}</h1>
                    <p className="text-sm text-gray-400">{userData.email}</p>
                    <span className='w-[70%] flex justify-between'>
                      <span className='text-xs'>follower {userData.follower}</span>
                      <span className='text-xs'>following  {userData.following}</span>

                    </span>
                  </div>
                </div>
                {isOwnProfile && (
                  <button 
                    onClick={() => navigate('/profile/edit')}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-400">
              
                <div className="flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>Member Since {formatDate(userData.memberSince)}</span>
                </div>
              </div>
            </div>

            {/* About Me */}
            {userData.profile.intro && (
              <div className="rounded-lg border bg-[#0B0B0B] border-[#1A1717] p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 text-white">About Me</h2>
                <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {userData.profile.intro}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="rounded-lg border bg-[#0B0B0B] border-[#1A1717] p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-white">Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <BookOpen size={18} />
                    <span>Blogs Written</span>
                  </div>
                  <span className="font-semibold text-white">{userData.stats.totalBlogs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <MessageSquare size={18} />
                    <span>Comments</span>
                  </div>
                  <span className="font-semibold text-white">{userData.stats.totalComments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Bookmark size={18} />
                    <span>Bookmarks</span>
                  </div>
                  <span className="font-semibold text-white">{userData.stats.totalBookmarks}</span>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            {techStack.length > 0 && (
              <div className="rounded-lg border bg-[#0B0B0B] border-[#1A1717] p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 text-white">Tech Stack</h2>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getTechColor(index)}`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            <div className="rounded-lg border bg-[#0B0B0B] border-[#1A1717] p-6">
              <h2 className="text-lg font-semibold mb-4 text-white">Connect</h2>
              <div className="flex space-x-3">
                <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <Twitter size={20} className="text-gray-400" />
                </button>
                <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <Github size={20} className="text-gray-400" />
                </button>
                <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <Linkedin size={20} className="text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2">
            {/* Recent Blogs */}
            <div className="rounded-lg border bg-[#0B0B0B] border-[#1A1717] p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Recent Blogs</h2>
                <button 
                  onClick={() => navigate(`/blogs?author=${userData.id}`)}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  View all blogs
                </button>
              </div>
              
              {userData.recentBlogs.length > 0 ? (
                <div className="space-y-4">
                  {userData.recentBlogs.map((blog) => (
                    <div 
                      key={blog.id} 
                      className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer"
                      onClick={() => navigate(`/blog/${blog.id}`)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                          <Database className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white line-clamp-1">{blog.title}</h3>
                          <p className="text-sm text-gray-400">
                            Published on {new Date(blog.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1">
                        <ExternalLink size={16} />
                        <span>Read</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-400 text-sm">No blogs published yet</p>
                  {(
                    <button 
                      onClick={() => navigate('/publish')}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
                    >
                      Write your first blog
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="rounded-lg border bg-[#0B0B0B] border-[#1A1717] p-6">
              <h2 className="text-lg font-semibold mb-4 text-white">Recent Activity</h2>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400 text-sm">No recent activity to show</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;