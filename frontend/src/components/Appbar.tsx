import logo from '../assets/logo.svg';
import { Link, useLocation } from "react-router-dom";
import notification from "../../public/svg/notification.svg";
import pen from '../../public/svg/pen.svg';
import search from '../../public/svg/search.svg';

export const Appbar = () => {
  const { pathname } = useLocation(); // Better than window.location

  return (
    <nav className="flex items-center justify-between relative z-10 w-full">
      {/* Logo */}
      <img className="w-[6%] ml-10 " src={logo} alt="Logo" />

      {/* Navigation Links */}
      <ul className="flex justify-between w-[30%] bg-[#0a0a0a] rounded-lg p-5 px-10">
        {["Home", "Blogs", "Pricing", "Showcase"].map((val, idx) => {
          const route = val.toLowerCase();
          const isActive = pathname.split('/')[1] === route;
          
          return (
            <li 
              key={idx} 
              className={` cursor-pointer
                list-none bg-inherit font-semibold p-2 
                hover:bg-zinc-900 px-3 rounded-md 
                ${isActive ? "text-white" : "text-zinc-500 hover:text-white"}
              `}
            >
              <Link to={`/${route}`}>{val}</Link>
            </li>
          );
        })}
      </ul>

      {/* Auth Buttons */}
      <div className='flex items-center justify-between'>
        {localStorage.getItem('token') ? (
          <div className="flex items-center gap-4">
            {/* Search (commented out) */}
            {/* <span className='flex items-center border border-gray-700 rounded-full'>
              <input className='bg-inherit px-5 py-3 outline-none active:border-blue-900' type="text" />
              <img className='mr-4' src={search} alt="Search" />
            </span> */}

            {/* Notification (commented out) */}
            {/* <img src={notification} alt="Notifications" /> */}

            {/* Publish Button (Expands left on hover) */}
            <Link to="/publish">
              <div className="relative h-[50px] w-[150px] mr-20 flex justify-between">
                <div className="
                rounded-full h-[50px] w-[50px]
                  flex justify-center items-center bg-blue-900 p-4
                  hover:w-[100px] transition-all duration-300
                  hover:-translate-x-[50px]  // Moves left on hover
                ">
                  <img src={pen} className="rounded-full" alt="Write post" />
                </div>
                <div className='w-[50px] bg-gray-700 h-[50px] rounded-full cursor-pointer'></div>
              </div>
            </Link>
          </div>
        ) : (
          <Link to="/signup">
            <div className=" mr-10 border-white border-[1px] rounded-full px-10 py-3 bg-white text-black font-semibold cursor-pointer duration-300 hover:text-white hover:bg-[#0a0a0a]">
              Signup
            </div>
          </Link>
        )}
      </div>
    </nav>
  );
};