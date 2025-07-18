import logo from '../assets/logo.svg';
import { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import pen from '../../public/svg/pen.svg';
import { AuthService } from '../utils/AuthService';

export const Appbar = () => {
  const { pathname } = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(localStorage.getItem('accessToken') ? true : false);
  const [scrolled, setScrolled] = useState(false);
  const authData = AuthService.getJsonAccessData()

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50 
      transition-all duration-300 ease-in-out
      ${scrolled 
        ? 'bg-black/80 backdrop-blur-xl py-3 shadow-2xl' 
        : 'bg-transparent py-6'
      }
    `}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        <Link to="/" className="group">
          <div className="relative">
            <img 
              className="w-20 h-20 transition-transform duration-300 group-hover:scale-110" 
              src={logo} 
              alt="Logo" 
            />

            <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Link>


        <ul className={`
          flex items-center gap-2 py-7
          bg-white/5 backdrop-blur-md
          border border-white/10
          rounded-2xl p-2
          shadow-xl shadow-black/20
          transition-all duration-300
          ${scrolled ? 'scale-95' : 'scale-100'}
        `}>
          {["Home", "Blogs", "Pricing", "Showcase"].map((val, idx) => {
            const route = val === "Home" ? "" : val.toLowerCase();
            const isActive = pathname === `/${route}` || (val === "Home" && pathname === "/");
            
            return (
              <li key={idx} className="relative">
                <Link
                  to={`/${route}`}
                  className={`
                    relative p-5 rounded-xl
                    font-medium text-sm tracking-wide
                    transition-all duration-300
                    ${isActive 
                      ? "text-white" 
                      : "text-gray-400 hover:text-white"
                    }
                    group
                  `}
                >

                  <div className={`
                    absolute inset-0 rounded-xl
                    transition-all duration-300
                    ${isActive 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 opacity-100" 
                      : "bg-white/10 opacity-0 group-hover:opacity-100"
                    }
                  `} />
                  
                  <span className="relative z-10">{val}</span>
                  

                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>


        <div className='flex items-center gap-4'>
          {isLoggedIn ? (
            <>

              <div className="flex items-center gap-3">
                <button className="
                  p-3 rounded-xl
                  bg-white/5 backdrop-blur-md
                  border border-white/10
                  text-gray-400 hover:text-white
                  hover:bg-white/10
                  transition-all duration-300
                  hover:scale-105
                ">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {/* Notification Button */}
                <button className="
                  relative p-3 rounded-xl
                  bg-white/5 backdrop-blur-md
                  border border-white/10
                  text-gray-400 hover:text-white
                  hover:bg-white/10
                  transition-all duration-300
                  hover:scale-105
                ">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {/* Notification dot */}
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </button>

                {/* Write/Publish Button */}
                <Link to="/publish" className="group">
                  <button className="
                    relative overflow-hidden
                    px-6 py-3 rounded-xl
                    bg-gradient-to-r from-blue-600 to-purple-600
                    text-white font-medium
                    transition-all duration-300
                    hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25
                    flex items-center gap-3
                  ">
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    

                    <img src={pen} className="w-5 h-5 relative z-10" alt="Write" />
                    <span className="relative z-10">Write</span>
                  </button>
                </Link>

                {/* Profile Avatar */}
                <Link to={`/profile/${authData.id}`}>
                <div className="relative group">
                  <button className="
                    w-11 h-11 rounded-xl overflow-hidden
                    ring-2 ring-white/20
                    transition-all duration-300
                    hover:ring-4 hover:ring-white/40
                    hover:scale-105
                  ">
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
                  </button>
                  
                  {/* Dropdown indicator */}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                </div>
                </Link>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {/* Sign In Button */}
              <Link to="/signin">
                <button className="
                  px-6 py-3 rounded-xl
                  text-gray-300 font-medium
                  transition-all duration-300
                  hover:text-white hover:bg-white/10
                ">
                  Sign In
                </button>
              </Link>

              {/* Sign Up Button */}
              <Link to="/signup">
                <button className="
                  relative overflow-hidden group
                  px-6 py-3 rounded-xl
                  bg-white text-black font-medium
                  transition-all duration-300
                  hover:scale-105 hover:shadow-lg hover:shadow-white/25
                ">
                  {/* Animated gradient on hover */}
                  <div className="
                    absolute inset-0 
                    bg-gradient-to-r from-blue-600 to-purple-600 
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-300
                  " />
                  <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                    Get Started
                  </span>
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};