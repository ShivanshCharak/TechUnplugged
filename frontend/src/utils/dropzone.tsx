import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

import CloudUpload from '../assets/cloud-upload.svg'


interface FileUploadProps{
  preview:string|null,
  setPreview:React.Dispatch<React.SetStateAction<string|null>>
}
export default function FileUpload({setPreview}:FileUploadProps){
  // const [files, setFiles] = useState<File[]>([]);
  // const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // setFiles(acceptedFiles);
    
    // Create image preview
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);



  // const uploadFile = async () => {
  //   if (files.length === 0) return alert("No file selected!");

  //   setUploading(true);
  //   const formData = new FormData();
  //   formData.append("file", files[0]);

  //   try {
  //     const response = await axios.post("/api/upload", formData);
  //     console.log("Uploaded File URL:", response.data.url);
    
  //     alert("Upload successful!");
  //   } catch (error) {
  //     console.error("Upload error:", error);
  //     alert("Upload failed!");
  //   }

  //   setUploading(false);
  // };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
   
      <div {...getRootProps()} className="w-[110px] justify-around h-[44px] bg-[#191b1e] flex items-center rounded-lg">
        <input {...getInputProps()} />
        <img className="w-[20px]" src={CloudUpload} alt="" />
        <p className="text-xs w-[65px] text-white">Drop files</p>
      </div>      

  );
};


