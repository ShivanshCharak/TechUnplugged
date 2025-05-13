import { Appbar } from "../components/Appbar";
import FileUpload from '../utils/dropzone';
import Cloudsave from '../assets/cloud-upload.svg';
import axios from "axios";
import { BACKEND_URL } from "../config";
import './styles.css';
import { useNavigate } from "react-router-dom";
import { ChangeEvent, useEffect, useState } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import Tiptap from "./TextEditor";
import UtilitiesSidebar from "../components/Sidebar";
import Delete from '../assets/delete.svg';

export const Publish = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [preview, setPreview] = useState<string | null>(null);
    const navigate = useNavigate();

    const DocumentOutline = ({ content }: { content: string }) => {
        const [headings, setHeadings] = useState<Array<{ level: number; text: string }>>([]);
      
        useEffect(() => {
          if (content) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');
            const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
            
            const extractedHeadings = Array.from(headingElements).map(el => ({
              level: parseInt(el.tagName.substring(1)),
              text: el.textContent || ''
            }));
            
             setHeadings(extractedHeadings);
            }
        }, [content]);
        
        return (
            <div className="mt-8">
            <h3 className="text-sm font-semibold text-white mb-2 w-[200px]">Table of contents</h3>
            <div className="space-y-1">
                <h3>{title}</h3>
              {headings.map((heading, index) => (
                  <div className="flex mt-10">
                
                {heading.text.length>0 && heading.level!==1&&<span className="mr-3 text-gray-700 font-black">{'>'}</span>}
                  <span 
                  key={index}
                  className={`text-sm hover:text-purple-300 cursor-pointer ${
                      heading.level === 1 ? 'font-semibold text-[32px] text-gray-400 p-6 ml-[-30px]' : 
                      heading.level === 2 ? 'text-[16px]/6 ' : 
                      'text-[16px]'
                    }`}
                    //    style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
                    >
                {heading.text}
            
             </span>
                </div>
              ))}
            </div>
          </div>
        );
      };
      
    
    const uploadToCloudinary = async (base64: string|null) => {
        const base64Data = base64?.replace(/^data:image\/[a-z]+;base64,/, "");
        const formData = new FormData();
        formData.append("file", `data:image/png;base64,${base64Data}`);
        formData.append("upload_preset", "blog_images"); 
        try {
            const res = await axios.post(
                "https://api.cloudinary.com/v1_1/dnvjiudhd/image/upload",
                formData
            );
            return res.data.secure_url;
        } catch (err) {
            console.error("Cloudinary upload failed:", err);
            return null;
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0a0a0b]">
            {/* Sidebar */}
            <div className="w-[400px] fixed left-0 top-0 h-full border-r border-[#1d1d1d]">
                <UtilitiesSidebar/>
            </div>

            {/* Main Content */}
            <div className="ml-[400px] flex-1">
                {/* Top Bar with Breadcrumbs and Actions */}
                <div className="flex justify-between items-center p-4 border-b border-[#1d1d1d]">
                    <Breadcrumbs/>
                    
                    <div className="flex gap-4">
                        {/* Delete Draft Button */}
                        {/* <button className="flex items-center gap-2 bg-[#191b1e] px-4 py-2 rounded-lg cursor-pointer duration-200 ease-in hover:bg-white hover:text-black">
                            <img className='w-[17px]' src={Delete} alt="Delete" />
                            <span className='text-xs font-semibold'>Delete Draft</span>
                        </button> */}

                        {/* Publish Button */}
                        <button
                            onClick={async () => {
                                if (preview) {
                                    const url = await uploadToCloudinary(preview);
                                    if (url) {
                                        const response = await axios.post(
                                            `${BACKEND_URL}/api/v1/blog`,
                                            {
                                                title,
                                                content: description,
                                                url, 
                                            },
                                            {
                                                headers: {
                                                    Authorization: localStorage.getItem("token"),
                                                },
                                            }
                                        );
                                        navigate(`/blog/${response.data.id}`);
                                    } else {
                                        alert("Image upload failed. Please try again.");
                                    }
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer duration-200 ease-in text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800"
                        >
                            <img className="w-[17px]" src={Cloudsave} alt="Publish" />
                            Publish post
                        </button>
                    </div>
                </div>

                {/* Editor Content */}
                <div className="flex  w-full p-8">
                    <div className="flex w-[400px] border-r-2 border-[#1d1d1d]">
                        <DocumentOutline content={description}/>
                    </div>
                    <div className="w-[60%]  border-r-2 border-[#1d1d1d] p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div className={`font-semibold text-md text-gray-600 cursor-pointer h-[50px] rounded-md ${preview ? "mb-[400px]" : ""}`}>
                                <FileUpload preview={preview} setPreview={setPreview} />
                            </div>
                            {preview && (
                                <div className="mt-6">
                                    <img src={preview} alt="Preview" className="w-full h-[300px] object-cover rounded-md" />
                                </div>
                            )}
                        </div>

                        <input
                            onChange={(e) => setTitle(e.target.value)}
                            type="text"
                            className="w-full border-none bg-transparent text-[3rem] font-bold text-white outline-none mb-8"
                            placeholder="Article Title..."
                        />

                        <Tiptap preview={preview} onChange={setDescription} />
                    </div>
                </div>
            </div>
        </div>
    );
};