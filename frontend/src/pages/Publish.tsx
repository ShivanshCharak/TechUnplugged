import React, { useState, useEffect, useContext, ChangeEvent } from 'react';
import { Search, Plus, FileText, Settings, Home, Eye, Edit3, Upload, Save, ChevronDown, ChevronUp, MoreVertical, X,Trash } from 'lucide-react';
import Tiptap from './TextEditor';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../utils/context/userContext';
import { BACKEND_URL } from '../config';
import {  useRef } from "react";

// Type definitions
type UserData ={
  id: string;
  email?: string;
  name?: string;
  [key: string]: any;
}


// Define the Tiptap component props interface

type Draft = {
  id: string;
  
  title: string;
  body?:string;
  isActive?: boolean;
  description?:string;

}

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}
type TDraftRes= {
  id:string,
  blog:{
    title:string,
    body:string
  }
}

interface PublishResponse {
  id: string;
  title: string;
  description: string;
  [key: string]: any;
}

export const Publish: React.FC = () => {
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    throw new Error('Publish component must be used within an AuthProvider');
  }
  
  const { authData, setAuthData } = authContext;
  
  const [description, setDescription] = useState<string>("Type / for commands");
  const [title, setTitle] = useState<string>("Article Title...");
  const [activeDraft,setActiveDraft] = useState<Draft>()
 
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [submittedExpanded, setSubmittedExpanded] = useState<boolean>(false);
  const [myDraftsExpanded, setMyDraftsExpanded] = useState<boolean>(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [drafts,setDrafts] = useState<TDraftRes[]|undefined>()
  



  useEffect(() => {
    console.log("rendering")
    async function getUserData(): Promise<void> {
      try {
        const item = localStorage.getItem("accessToken");
        console.log("item",item)
        if (item) {
          const userData = jwtDecode<UserData>(item);
          console.log("userdata",userData)
          setAuthData(userData);
          console.log("authdata",authData)
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
    getUserData();
  }, []);
  useEffect(() => {
  if (!authData || !authData.id) return;

  async function fetchDrafts() {
    try {
      const response = await fetch(`http://localhost:8787/api/v1/draft/bulk/${authData.id}`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const draftData = await response.json();

      const draft = draftData.data.map((val: TDraftRes) => ({
        id: val.id,
        title: val.blog.title,
        body: val.blog.body,
      }));

      setDrafts(draft);
      console.log("drafts", draft);
    } catch (error) {
      console.error("Something went wrong fetching drafts", error);
    }
  }
  function handleBeforeUnload() {
    console.log("Saving draft before exit...");
    
    if(title!=="Article Title..."|| description!=="<p>Type / for commands</p>"){
      navigator.sendBeacon(
        
        "http://localhost:8787/api/v1/draft/create",
        JSON.stringify({
          userId: authData.id,
          blog: {
            title: titleRef.current,
            description: descriptionRef.current,
            isPublished: false,
            imageUrl: preview || "image-1",
          },
        })
      );
      console.log(title,description)
      console.log("title, description",title==="Article Title...", description==="<p>Type / for commands</p>")
      console.log("hey")
    }
  }

  window.addEventListener("beforeunload", handleBeforeUnload);
  fetchDrafts();

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };

}, [authData]);

const titleRef = useRef(title);
const descriptionRef = useRef(description);

// Keep refs updated on every state change
useEffect(() => {
  titleRef.current = title;
}, [title]);

useEffect(() => {
  descriptionRef.current = description;
}, [description]);

// Attach beforeunload listener only once
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

  // Handing Draft values
  function handleDraft(draft:Draft){
    setActiveDraft({
      id:draft.id,
      description:draft.description,
      isActive:true,
      title:draft.description
    })
    setTitle(draft.title)
    setDescription(draft.body)
    console.log(draft.title,draft.body)
  }

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

      const response = await fetch(`http://localhost:8787/api/v1/blog/create`, {
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
  const handleDelete = async():Promise<void>=>{
    await fetch(`http://localhost:8787/api/v1/draft?userId=${authData.id}&draftId=${activeDraft.id}`, {
  method: "DELETE",
}).then(async(res)=>{
      // toastify if want to
      // 
      const deletedRes:Response =  await res.json()
      if(deletedRes.status===200){
        setDescription("Type / to start")
        setTitle("Add Title")
      }

    })
  }

  // Sample drafts data

  const filteredDrafts = drafts?.filter((draft: Draft) => 
    draft.title.toLowerCase().includes(searchQuery.toLowerCase())
  )??[];

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
                    onClick={() => handleDraft(draft)}
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
            <span className="text-white">{activeDraft?.title??"Untitled"}</span>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => handleDelete()}
              className="flex items-center space-x-2 px-4 py-2 bg-red-800 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Trash className="outline-red-500 w-4 h-4" />
              <span>Delete</span>
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
              <Tiptap onChange={setDescription} description={description} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};