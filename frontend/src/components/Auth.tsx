import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from '../utils/axios'; 
import arrowLeft from '../../public/svg/arrow-left.svg'

export const Auth = ({ type }: { type: "signup" | "signin" }) => {
    const navigate = useNavigate();
    const [showLoading, setShowLoading] = useState<boolean>(false);

    const [postInputs, setPostInputs] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: ""
    });

    async function sendRequest() {
        try {
            setShowLoading(true);

            const response = await api.post(
                `/api/v1/user/${type === "signup" ? "signup" : "signin"}`,
                postInputs,
                {
                    validateStatus: (status) => status < 500
                }
            );

            if (response.status >= 400) {
                throw new Error(response.data?.message || 'Authentication failed');
            }

            const data = response.data;
            
            // Store access token in localStorage for API calls
            if (data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken);
            }
            
            // Cookies are automatically handled by the browser
            navigate("/blogs");
        } catch (e:unknown) {
            console.error('Auth error:', e);
            alert(e || "Authentication failed. Please try again.");
        } finally {
            setShowLoading(false);
        }
    }

    return (
        <div className="AuthBg h-screen w-[100%] flex justify-center flex-col bg-slate-780">
            <div className="flex justify-center">
                <div className="border border-zinc-900 p-10 bg-[#18181b] rounded-lg">
                    <div className="px-10">
                        <div className="text-3xl font-extrabold">
                            Create an account
                        </div>
                        <div className="text-slate-500">
                            {type === "signin" ? "Don't have an account?" : "Already have an account?"}
                            <Link className="pl-2 underline" to={type === "signin" ? "/signup" : "/signin"}>
                                {type === "signin" ? "Sign up" : "Sign in"}
                            </Link>
                        </div>
                    </div>
                    <div className="pt-8">
                        {type === "signup" ? (
                            <LabelledInput 
                                label="Firstname" 
                                placeholder="John" 
                                onChange={(e) => {
                                    setPostInputs({
                                        ...postInputs,
                                        firstname: e.target.value
                                    });
                                }} 
                            />
                        ) : null}
                        
                        <LabelledInput 
                            label="Lastname" 
                            placeholder="Doe" 
                            onChange={(e) => {
                                setPostInputs({
                                    ...postInputs,
                                    lastname: e.target.value
                                });
                            }} 
                        />
                        
                        <LabelledInput 
                            label="Email" 
                            placeholder="john@gmail.com" 
                            onChange={(e) => {
                                setPostInputs({
                                    ...postInputs,
                                    email: e.target.value
                                });
                            }} 
                        />
                        
                        <LabelledInput 
                            label="Password" 
                            type="password" 
                            placeholder="******" 
                            onChange={(e) => {
                                setPostInputs({
                                    ...postInputs,
                                    password: e.target.value
                                });
                            }} 
                        />
                        
                        <button 
                            onClick={sendRequest} 
                            type="button" 
                            className={`mt-8 w-full text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium text-sm px-5 py-2.5 me-2 mb-2 rounded-full ${showLoading ? "DotsBars" : ""}`}
                        >
                            {type === "signup" ? "Sign up" : "Sign in"}
                        </button>
                        
                        <section className="flex w-full justify-center group mt-[5%]" onClick={() => navigate("/")}>
                            <img className="group-hover:-translate-x-1 duration-400 transition-all mr-1" width={20} height={20} src={arrowLeft} alt="" />
                            <button className="group-hover:translate-x-1 duration-400 transition-all text-sm">Back to Home</button>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface LabelledInputType {
    label: string;
    placeholder: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    type?: string;
}

function LabelledInput({ label, placeholder, onChange, type }: LabelledInputType) {
    return (
        <div>
            <label className="block mb-2 text-sm text-white font-semibold pt-4 ml-[4%]">
                {label}
            </label>
            <input 
                onChange={onChange} 
                type={type || "text"} 
                className="focus:outline-none bg-[#18181b] border border-gray-600 rounded-full text-white text-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-5 py-4" 
                placeholder={placeholder} 
                required 
            />
        </div>
    );
}