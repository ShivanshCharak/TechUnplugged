import { Link } from "react-router-dom";

interface BlogCardProps {
    authorName: string;
    title: string;
    content: string;
    publishedDate: string;
    id: number;
    url: string;
}

export const BlogCard = ({
    id,
    authorName,
    title,
    content,
    url,
    publishedDate
}: BlogCardProps) => {
    return (
        <>
        
        <div className="flex flox-col">
            <Link to={`/blog/${id}`} className="block">
                <div className="w-full max-w-3xl bg-inherit border border-[#2a2a2a] hover:border-[#444] rounded-2xl p-5 mb-6 transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    {/* Left: Blog Content */}
                    <div className="flex-1">
                        <div className="flex items-center text-sm text-gray-400 space-x-2 mb-2">
                            <Avatar name={authorName} />
                            <span className="font-medium text-white ">{authorName}</span>
                            <Circle />
                            <span>{publishedDate}</span>
                        </div>

                        <h3 className=" mt-6 text-md sm:text-xl  text-white leading-snug mb-1">
                            {title}
                        </h3>

                        <div
                            className="text-sm text-gray-400 line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: content.slice(0, 200) }}
                        />

                        <div className="flex items-center text-xs text-gray-500 mt-3 space-x-4">
                            <span>{`${Math.ceil(content.length / 100)} min read`}</span>
                            <span>•</span>
                            <span>{Math.ceil(Math.random() * 100)} likes</span>
                        </div>
                    </div>

                    {/* Right: Image */}
                    <div className="w-[160px] h-[90px] flex-shrink-0 rounded-md overflow-hidden">
                        <img
                            src={url}
                            alt={title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </Link>
        </div>
           
        
        </>
    );
};

export function Circle() {
    return <div className="h-1 w-1 rounded-full bg-gray-500"></div>;
}

export function Avatar({
    name,
    size = "small"
}: {
    name: string;
    size?: "small" | "big";
}) {
    return (
        <div
            className={`inline-flex items-center justify-center bg-gray-700 rounded-full text-white ${
                size === "small" ? "w-6 h-6 text-xs" : "w-10 h-10 text-lg"
            }`}
        >
            {name[0].toUpperCase()}
        </div>
    );
}
