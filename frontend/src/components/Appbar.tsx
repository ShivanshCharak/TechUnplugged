
import logo from '../assets/logo.svg'
import { Link } from "react-router-dom"


export const Appbar = () => {
    return <nav className="flex items-center justify-between relative z-10">
        <div className="text-2xl font-bold"><img className="w-[150px] ml-10" src={logo} alt="" /></div>
        <ul className="flex justify-between w-[700px] bg-[#0a0a0a] rounded-lg p-5 px-10">
            <li className="list-none bg-inherit font-semibold p-2 hover:bg-zinc-900 px-3 rounded-md text-zinc-500 hover:text-white ">
              <Link to={"/"}>Home</Link>  
             </li>
            <li className="list-none bg-inherit font-semibold flex justify-between items-center hover:bg-zinc-900 px-3 rounded-md text-zinc-500 hover:text-white " >
                <Link to="/blogs">Blogs</Link>    
            </li>
            <li className="list-none bg-inherit font-semibold  flex justify-between items-center hover:bg-zinc-900 px-3 rounded-md text-zinc-500 hover:text-white ">
              <Link to="/pricing">Pricing</Link> 
            </li>
            <li className="list-none bg-inherit font-semibold  flex justify-between items-center hover:bg-zinc-900 px-3 rounded-md text-zinc-500 hover:text-white ">
                <Link to={"/showcase"}>Showcase</Link></li>
        </ul>
        {window.location.pathname==="/blogs"?(<Link to={"/publish"}> <div className=" w-[150px] rounded-full h-[50px] bg-blue-900 flex justify-center items-center mr-[40px]">Create post</div></Link>):(<Link to="signup"><div className=" border-white border-[1px] rounded-md px-10 py-3 mr-10 bg-white text-black font-semibold cursor-pointe duration-300 cursor-pointer  hover:text-white hover:bg-[#0a0a0a]">
            Signup
        </div></Link>)}
    </nav>

}