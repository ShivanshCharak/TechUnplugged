
import { Calendar, Edit, ExternalLink, Twitter, Github, Linkedin, Award,  Database, Globe } from 'lucide-react';

const ProfilePage = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Relational database for System Design",
      description: "relational-database-for-system-design.hashnode.dev",
      image: "/api/placeholder/60/60"
    },
    {
      id: 2,
      title: "trial",
      description: "trialende.hashnode.dev",
      image: "/api/placeholder/60/60"
    },
    {
      id: 3,
      title: "Shivansh Charak's blog",
      description: "shivanshcharak.hashnode.dev",
      image: "/api/placeholder/60/60"
    }
  ];

  const techStack = [
    { name: "Java", color: "bg-orange-600" },
    { name: "maven", color: "bg-red-600" },
    { name: "Linux", color: "bg-yellow-600" },
    { name: "Python", color: "bg-blue-600" },
    { name: "C", color: "bg-purple-600" },
    { name: "networking", color: "bg-green-600" },
    { name: "Docker", color: "bg-blue-500" }
  ];

  const badges = [
    {
      id: 1,
      title: "Word Warrior",
      description: "Earned on Jun 8, 2023",
      icon: <Award className="w-8 h-8 text-blue-400" />
    },
    {
      id: 2,
      title: "Self Starter",
      description: "Earned on Mar 30, 2022",
      icon: <Award className="w-8 h-8 text-green-400" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold">Profile</div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-white">
              <Twitter size={20} />
            </button>
            <button className="text-gray-400 hover:text-white">
              <Github size={20} />
            </button>
            <button className="text-gray-400 hover:text-white">
              <Linkedin size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <img 
                      src="/api/placeholder/64/64" 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Shivansh Charak</h1>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <span>DevOps enthusiast 🚀</span>
                      <span>|</span>
                      <span>Tech blogger 📝</span>
                    </div>
                  </div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2">
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
              </div>
              
              <div className="mb-4">
                <span className="inline-block bg-blue-600 text-white px-2 py-1 rounded text-xs mr-2">New to DevOps?</span>
                <p className="text-gray-300 text-sm mt-2">
                  Follow for insights! Learn and grow with me in the exciting world of #DevOps! 🚀
                </p>
              </div>
              
              <div className="text-sm text-gray-400 mb-4">
                <span className="font-semibold text-white">2</span> Followers
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>Member Since Mar, 2022</span>
                </div>
              </div>
            </div>

            {/* About Me */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-white">About Me</h2>
              <div className="text-sm text-gray-300 leading-relaxed">
                <p className="mb-3">
                  🚀 New to the DevOps world? You've come to the right place! I'm a DevOps enthusiast who's just starting my journey in this exciting field. Follow along as I share my experiences and insights through a comprehensive tech blog series, covering everything from the fundamentals to advanced concepts.
                </p>
                <p className="mb-3">
                  Join me from the beginning and embark on this learning adventure together! 🌟 Let's grow and explore the vast world of DevOps side by side.
                </p>
                <p className="text-blue-400">
                  #DevOps #DevOpsFriendly
                </p>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">My Tech Stack</h2>
                <button className="text-blue-400 hover:text-blue-300 text-sm">Show all</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-xs font-medium text-white ${tech.color}`}
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Available For */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-white">I am available for</h2>
              <button className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg py-3 px-4 text-sm text-gray-300 flex items-center justify-center space-x-2">
                <span>+</span>
                <span>Add Available For</span>
              </button>
            </div>

            {/* Badges */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-white">Badges</h2>
              <div className="grid grid-cols-2 gap-4">
                {badges.map((badge) => (
                  <div key={badge.id} className="text-center">
                    <div className="bg-gray-800 rounded-lg p-4 mb-2">
                      {badge.icon}
                    </div>
                    <div className="text-sm font-medium text-white mb-1">{badge.title}</div>
                    <div className="text-xs text-gray-400">{badge.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2">
            {/* Writes at Section */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Writes at</h2>
                <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1">
                  <span>Manage blogs</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {blogPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                        <Database className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{post.title}</h3>
                        <p className="text-sm text-gray-400">{post.description}</p>
                      </div>
                    </div>
                    <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1">
                      <ExternalLink size={16} />
                      <span>Read the blog</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
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