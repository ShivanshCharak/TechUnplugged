import React, { useState, useEffect, useContext, ChangeEvent } from 'react';
import { Search, Plus, FileText, Settings, Home, Eye, Edit3, Upload, Save, ChevronDown, ChevronUp, MoreVertical, X } from 'lucide-react';
import Tiptap from './TextEditor';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../utils/context/userContext';

// Type definitions
interface UserData {
  id: string;
  email?: string;
  name?: string;
  [key: string]: any;
}



// Define the Tiptap component props interface

interface Draft {
  id: number;
  title: string;
  isActive: boolean;
}

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

interface PublishResponse {
  id: string;
  title: string;
  description: string;
  [key: string]: any;
}

export const Publish: React.FC = () => {
  const authContext = useContext(AuthContext);
  
  // Handle potential null context
  if (!authContext) {
    throw new Error('Publish component must be used within an AuthProvider');
  }
  
  const { authData, setAuthData } = authContext;
  
  const [description, setDescription] = useState<string>("Type / for commands");
  const [title, setTitle] = useState<string>("Article Title...");
  const [selectedDraft, setSelectedDraft] = useState<string>("Untitled");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [submittedExpanded, setSubmittedExpanded] = useState<boolean>(false);
  const [myDraftsExpanded, setMyDraftsExpanded] = useState<boolean>(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  useEffect(() => {
    async function getUserData(): Promise<void> {
      try {
        const item = localStorage.getItem("accessToken");
        if (item) {
          const userData = jwtDecode<UserData>(item);
          setAuthData(userData);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
    getUserData();
  }, [setAuthData]);
  
  // File upload handler
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result) {
            setPreview(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select an image file');
      }
    }
  };

  // Remove image
  const removeImage = (): void => {
    setPreview(null);
  };

  // Upload to Cloudinary
  const uploadToCloudinary = async (base64: string): Promise<string | null> => {
    const base64Data = base64?.replace(/^data:image\/[a-z]+;base64,/, "");
    const formData = new FormData();
    formData.append("file", `data:image/png;base64,${base64Data}`);
    formData.append("upload_preset", "blog_images"); 
    
    try {
      setIsUploading(true);
      const res = await fetch("https://api.cloudinary.com/v1_1/dnvjiudhd/image/upload", {
        method: "POST",
        body: formData
      });
      const data: CloudinaryResponse = await res.json();
      setIsUploading(false);
      return data.secure_url;
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      setIsUploading(false);
      return null;
    }
  };

  console.log(authData);

  // Publish post
  const handlePublish = async (): Promise<void> => {
    if (!title || !description) {
      alert("Please add a title and content before publishing");
      return;
    }

    if (!authData?.id) {
      alert("User not authenticated");
      return;
    }

    try {
      setIsPublishing(true);
      let imageUrl: string | null = null;
      
      if (preview) {
        imageUrl = await uploadToCloudinary(preview);
        if (!imageUrl) {
          alert("Image upload failed. Please try again.");
          setIsPublishing(false);
          return;
        }
      }

      const response = await fetch('http://localhost:8787/api/v1/blog/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: authData.id,       
          title,
          description,
          url: imageUrl,
          isPublished: true
        }),
      });

      if (response.ok) {
        const data: PublishResponse = await response.json();
        alert("Post published successfully!");
        window.location.href = `/blog/${data.id}`;
      } else {
        alert("Failed to publish post");
      }
    } catch (error) {
      console.error("Error publishing post:", error);
      alert("Error publishing post");
    } finally {
      setIsPublishing(false);
    }
  };

  // Sample drafts data
  const drafts: Draft[] = [
    { id: 1, title: "Untitled", isActive: true },
    { id: 2, title: "Relational Databases and IS...", isActive: false },
    { id: 3, title: "LLMs", isActive: false },
    { id: 4, title: "Basics of Javascript", isActive: false },
    { id: 5, title: "AWS CloudWatch", isActive: false },
    { id: 6, title: "AWS CI/CD", isActive: false },
    { id: 7, title: "AWS CLI", isActive: false },
    { id: 8, title: "AWS S3 Bucket", isActive: false },
    { id: 9, title: "Git and Github", isActive: false },
    { id: 10, title: "Continuous Integration", isActive: false },
    { id: 11, title: "Kubernetes", isActive: false },
    { id: 12, title: "Ansible", isActive: false },
  ];

  const filteredDrafts = drafts.filter((draft: Draft) => 
    draft.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      {/* Sidebar */}
      <div className="w-80 bg-zinc-950 border-r border-gray-700 flex flex-col">
        {/* User Profile Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
              SC
            </div>
            <span className="text-sm font-medium text-gray-200">Shivansh Chara...</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-1 hover:bg-gray-800 rounded">
              <Plus className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-1 hover:bg-gray-800 rounded">
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Search and New Draft */}
        <div className="p-4 space-y-3 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search drafts..."
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button className="w-full flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            <span>New draft</span>
          </button>
        </div>

        {/* Drafts Sections */}
        <div className="flex-1 overflow-y-auto">
          {/* Submitted Drafts */}
          <div className="p-4 border-b border-gray-700">
            <button
              onClick={() => setSubmittedExpanded(!submittedExpanded)}
              className="flex items-center justify-between w-full text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3"
            >
              <span>SUBMITTED DRAFTS (0)</span>
              {submittedExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {submittedExpanded && (
              <div className="text-sm text-gray-500 py-4">
                You do not have any incoming drafts.
              </div>
            )}
          </div>

          {/* My Drafts */}
          <div className="p-4">
            <button
              onClick={() => setMyDraftsExpanded(!myDraftsExpanded)}
              className="flex items-center justify-between w-full text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3"
            >
              <span>MY DRAFTS (24)</span>
              {myDraftsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {myDraftsExpanded && (
              <div className="space-y-1">
                {filteredDrafts.map((draft: Draft) => (
                  <button
                    key={draft.id}
                    onClick={() => setSelectedDraft(draft.title)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      draft.isActive 
                        ? 'bg-gray-800 text-white' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{draft.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-700 space-y-1">
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
            <Eye className="w-4 h-4" />
            <span>View deleted articles</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
            <span>Blog dashboard</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
            <Home className="w-4 h-4" />
            <span>Back to home</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Home</span>
            <span>/</span>
            <span>Drafts</span>
            <span>/</span>
            <span className="text-white">{selectedDraft}</span>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
            <button 
              onClick={handlePublish}
              disabled={isPublishing || isUploading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            {/* Editor Toolbar */}
            <div className="flex items-center space-x-4 mb-8">
              <label className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Uploading...' : 'Add Cover'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
                <Edit3 className="w-4 h-4" />
                <span>Add Subtitle</span>
              </button>
            </div>

            {/* Cover Image Preview */}
            {preview && (
              <div className="mb-8 relative">
                <img 
                  src={preview} 
                  alt="Cover preview" 
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Editor Content */}
            <div className="">
              <input
                type="text"
                value={title}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                className="w-full text-5xl font-bold bg-transparent border-none outline-none text-gray-300 placeholder-gray-600"
                placeholder="Article Title..."
              />
              <Tiptap onChange={setDescription} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};