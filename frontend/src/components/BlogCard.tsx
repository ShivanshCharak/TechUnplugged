import { Link } from "react-router-dom";
interface BlogCardProps {
    authorName: string;
    title: string;
    content: string;
    publishedDate: string;
    id: number;
    url:string;
}

export const BlogCard = ({
    id,
    authorName,
    title,
    content,
    url,
    publishedDate
}: BlogCardProps) => {
    return <Link to={`/blog/${id}`}>
        <div className=" mt-10 flex justify-between  w-[100rem] h-[20rem]  p-[20px] bg-[#0B0B0B] border-[1px] border-[#1A1717]">
            <div>
                <div className="flex items-center">
                    <Avatar name={authorName} />
                    <div >{authorName.toUpperCase()}</div>
                    <div>
                        <Circle />
                    </div>
                    <div >
                        {publishedDate}
                    </div>
                </div>
                <div className="text-3xl m-4">
                    {title}
                </div>
                <div className="whitespace-pre-line m-5">
                    {/* {content.slice(0, 100) + "..."} */}
                    <div dangerouslySetInnerHTML={{__html:content.slice(0,250)}}/>
                </div>
                <div className="text-slate-400 m-5">
                    {`${Math.ceil(content.length / 100)} minute(s) read`}
                </div>
                <div className="m-5">
                    {Math.ceil(Math.random()*100)} Likes 
                </div>

            </div>
            <img src={url} className="w-[400px] h-[200px] object-cover" alt="" />
        </div>
    </Link>
}

export function Circle() {
    return <div className=" mr-3  ml-3 h-1 w-1 rounded-full bg-slate-500">

    </div>
}

export function Avatar({ name, size = "small" }: { name: string, size?: "small" | "big" }) {
    return <div className={`relative inline-flex items-center justify-center overflow-hidden bg-gray-600 rounded-full mr-3 ${size === "small" ? "w-6 h-6" : "w-10 h-10"}`}>
    <span className={`${size === "small" ? "text-xs" : "text-md"} font-extralight text-gray-600 dark:text-gray-300`}>
        {name[0].toUpperCase()}
    </span>
</div>
}