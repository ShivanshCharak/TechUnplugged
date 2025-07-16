import { useEffect, useState } from "react"
import axios from "axios";
import { BACKEND_URL } from "../config";
import { UseBlogReturn } from "../types";


export interface Blog {
    body: string;
    createdAt: any;
    "content": string;
    "title": string;
    "id": number;
    "url":string
    "author": {
        "name": string
    }
}

export const useBlog = ({ id }: { id: string }):UseBlogReturn => {
    const [loading, setLoading] = useState(true);
    const [blog, setBlog] = useState<Blog>();

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/v1/blog/${id}`, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
            .then(response => {
                setBlog(response.data.blog);
                setLoading(false);
            })
    }, [id])

    return {
        loading,
        blog
    }

}
export const useBlogs = () => {
    const [loading, setLoading] = useState(true);
    const [blogs, setBlogs] = useState<Blog[]>([]);

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/v1/blog/bulk`, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
        .then(response => {
            setBlogs(response.data.blogs);
            setLoading(false);
        })
        {console.log(blogs)};
    }, [])

    return {
        loading,
        blogs
    }
}