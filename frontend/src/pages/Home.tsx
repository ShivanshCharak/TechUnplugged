import { Appbar } from "../components/Appbar";
import Blog from '../assets/blog.png'
import { useRef } from 'react';
import raycast from '../assets/raycast.svg'
import monzo from '../assets/monzo.svg'
import retool from '../assets/retool.svg'
import perplexity from '../assets/perplexity.svg'
import supercell from '../assets/supercell.svg'
import mercury from '../assets/mercury.svg'
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Footer from "../components/Footer";
import Pricing from "../components/Pricing"; // Import the new component
import FeatureSection from "../components/FeatureSection";

export default function Home() {
  const imageRef = useRef();
  const tagline = useRef()
  
  useGSAP(() => {
    // Cinematic tagline fade + scale
    gsap.fromTo(tagline.current,
      {
        opacity: 0,
        y: 30,
        scale: 0.95, // Slightly smaller
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 2,
        delay: 0.5,
        ease: 'power3.out',
      }
    );
  
    // Blog image float-in effect
    gsap.fromTo(imageRef.current,
      {
        y: 600,
        opacity: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        scale: 0.8,
        transformOrigin: 'center center',
      },
      {
        y: -200,
        opacity: 1,
        duration: 2.5,
        ease: 'power4.out',
        rotateX: 15,
        rotateY: 30,
        rotateZ: -30,
        scale: 1,
        x: 200,
        z: -100,
        delay: 0.3,
      }
    );
  });
  
  

  return (
    <>
      <Appbar />
      {/* Background gradient */}
      <div className="max-w-[778px] h-[600px] bg-gradient-to-t from-[#000000] to-[#0E0D0D] rotate-[-160deg] absolute top-[-200px] z-0"></div>

      {/* Main container with ref for GSAP */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Hero content */}
        <div className="flex justify-between items-center mt-[7%] flex-col">
          <div className="flex gap-10">
            <div className="w-[153px] h-[25px] bg-[#bef5c1] rounded-xl text-center flex items-end  justify-center">
              <div className="text-[#008000] font-bold text-sm  mb-[1px] ">Keep you updated</div>
            </div>
            <div className="bg-[#9077ae] rounded-xl"> <span className="text-[#00459f] font-bold px-5 text-sm ">Flow can effect your life</span></div>
          </div>
          <div ref={tagline} className=" max-w-[1200px] text-center text-8xl font-bold relative ">
            Deep dive in the world of blogging
          </div>
             <button className="styled-button realtive inline-flex items-center justify-center px-8 py-4 mt-10 text-white text-[1.1rem] font-bold rounded-full border border-[#292929] bg-gradient-to-b from-[#171717] to-[#242424] shadow-[0_2px_4px_rgba(0,0,0,1),0_10px,20px_rgba(0,0,0,0.4)] transition-all duration-200 active:translate-y-[2px] active:shadow-[0_1px_2px_rgba(0,0,0,1),0_5px_10px_rgba(0,0,0,0.4)] mb-4">
              Start Exploring
              <div className="inner-button relative flex items-center justify-center w-10 h-10 ml-2 rounded-full bg-gradient-to-b from-[#171717] to-[#242424] border-[#252525] shadow-[0_0_1px_rgba(0,0,0,1)] transition-all duration-200">
              <svg
  viewBox="0 0 32 32"
  xmlns="http://www.w3.org/2000/svg"
  className="w-[30px] h-[30px] text-white hover:text-gray-300 hover:rotate-[-35deg] transition-all duration-300"

  fill="currentColor"
>
  <path d="M4 15a1 1 0 0 0 1 1h19.586l-4.292 4.292a1 1 0 0 0 1.414 1.414l6-6a.99.99 0 0 0 .292-.702V15c0-.13-.026-.26-.078-.382a.99.99 0 0 0-.216-.324l-6-6a1 1 0 0 0-1.414 1.414L24.586 14H5a1 1 0 0 0-1 1z" />
</svg>

              </div>
             </button>
          {/* <span className="w-[200px] h-[50px] bg-white text-black flex justify-center items-center rounded-3xl mt-[50px] font-semibold cursor-pointer ">
            Start exploring
          </span> */}
        </div>
        <div
          className="flex justify-center items-center w-full h-screen bg-black"
          style={{ perspective: '1600px', overflow: '' }}
        >
          <img
            ref={imageRef}
            src={Blog}
            alt="Blog"
            className="w-[1600px] h-[800px] object-cover rounded-xl shadow-2xl mt-10"
            style={{
              transformStyle: 'preserve-3d',
            }}
          />
        </div>
      </div>

      <div className="flex justify-center items-center flex-col mt-40">
        <h3 className="">Featured in the Top startups</h3>
        <ul className="flex justify-between items-center w-[1200px]">
          <li className="list-none"><img className="w-18 hover:scale-150 duration-[400ms] cursor-pointer" src={raycast} alt="" /></li>
          <li className="list-none"><img className="w-18 hover:scale-150 duration-[400ms] cursor-pointer" src={retool} alt="" /></li>
          <li className="list-none"><img className="w-18 hover:scale-150 duration-[400ms] cursor-pointer" src={monzo} alt="" /></li>
          <li className="list-none"> <img className="w-18 hover:scale-150 duration-[400ms] cursor-pointer" src={mercury} alt="" /></li>
          <li className="list-none"><img src={perplexity} className="w-18 hover:scale-150 duration-[400ms] cursor-pointer" alt="" /></li>
        </ul>
      </div>

      {/* Use the Pricing component here */}
      <FeatureSection/>
      <Pricing />
      <Footer />
    </>
  );
}