import React from "react";

const ProfilePage = () => {
  return (
    <div className="bg-black min-h-screen text-white p-6 font-sans">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center space-x-4">
          <img
            src="https://i.imgur.com/vPeG0KO.png" // Replace with actual avatar URL
            alt="Avatar"
            className="w-24 h-24 rounded-full border border-gray-600"
          />
          <div>
            <h2 className="text-2xl font-bold mb-5">Shivansh Charak</h2>
            <p className="text-gray-300 w-[500px]">
              DevOps enthusiast 💻🚀 | Tech blogger 📝 | New to DevOps? Follow
              for insights! Learn and grow with me in the exciting world of
              #DevOps! 🌟
            </p>
            <p className="text-sm text-gray-500 mt-1">2 Followers</p>
          </div>
        </div>

        {/* Member Since */}
        <div className="border-t border-zinc-800 my-6 py-10 text-gray-400 text-sm bg-inherit border rounded-xl text-center ">
          <span>📅 Member Since Mar, 2022</span>
        </div>

        {/* Blogs */}
        <div className="mt-6 border border-zinc-900 p-5 rounded-xl">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold ">Writes at</h3>
        
            <button className="text-sm text-blue-500 hover:underline">
              ⚙️ Manage blogs
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {[
              {
                title: "Relational database for System Design",
                link: "https://relational-database-for-system-design.hashnode.dev",
              },
              {
                title: "trial",
                link: "https://trialende.hashnode.dev",
              },
              {
                title: "Shivansh Charak's blog",
                link: "https://shivanshcharak.hashnode.dev",
              },
            ].map((blog, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between  p-4 rounded-md"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center text-gray-400 text-xl">
                    📄
                  </div>
                  <div>
                    <h3 className="text-white">{blog.title}</h3>
                    <p className="text-gray-400 text-sm">{new URL(blog.link).hostname}</p>
                  </div>
                </div>
                <a
                  href={blog.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className=" hover:bg-gray-700 border-gray-700 border rounded-full text-white px-4 py-2 hover:bg-gray-600 text-sm"
                >
                  ↗ Read the blog
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className=" p-4 rounded-md border border-gray-700">
            <h4 className="text-lg font-semibold mb-2">👋 About Me</h4>
            <p className="text-gray-300">
              New to the DevOps world? You've come to the right place.
            </p>
          </div>

          <div className=" p-4 rounded-md border border-gray-700">
            <h4 className="text-lg font-semibold mb-2">🛠️ My Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {["Java", "maven", "Python", "C", "Git"].map((tech, i) => (
                <span
                  key={i}
                  className="bg-gray-800 text-gray-200 text-sm px-3 py-1 rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className=" p-4 rounded-md border border-gray-700">
            <h4 className="text-lg font-semibold mb-2">🤝 I am available for</h4>
            <button className="text-sm text-blue-500 hover:underline">
              + Add Available For
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
