import { useRef } from 'react';
import { Appbar } from "../components/Appbar";
import Blog from '../assets/blog.png';
import raycast from '../assets/raycast.svg';
import monzo from '../assets/monzo.svg';
import retool from '../assets/retool.svg';
import perplexity from '../assets/perplexity.svg';
import mercury from '../assets/mercury.svg'; // 🛠 Make sure this exists
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import Footer from "../components/Footer";
import Pricing from "../components/Pricing";
import FeatureSection from "../components/FeatureSection";

export default function Home() {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const tagline = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    if (tagline.current) {
      gsap.fromTo(
        tagline.current,
        {
          opacity: 0,
          y: 30,
          scale: 0.95,
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
    }

    if (imageRef.current) {
      gsap.fromTo(
        imageRef.current,
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
    }
  }, []);

  return (
    <>
      <Appbar />

      {/* Background gradient */}
      <div className="max-w-[778px] h-[600px] bg-gradient-to-t from-[#000000] to-[#0E0D0D] rotate-[-160deg] absolute top-[-200px] z-0"></div>

      {/* Main container */}
      <div className="relative min-h-screen overflow-hidden">
        <div className="flex justify-between items-center mt-[7%] flex-col">
          <div className="flex gap-10">
            <div className="w-[153px] h-[25px] bg-[#bef5c1] rounded-xl text-center flex items-end justify-center">
              <div className="text-[#008000] font-bold text-sm mb-[1px]">Keep you updated</div>
            </div>
            <div className="bg-[#9077ae] rounded-xl">
              <span className="text-[#00459f] font-bold px-5 text-sm">Flow can effect your life</span>
            </div>
          </div>

          <div
            ref={tagline}
            className="max-w-[1200px] text-center text-8xl font-bold relative"
          >
            Deep dive in the world of blogging
          </div>

          <button className="styled-button inline-flex items-center justify-center px-8 py-4 mt-10 text-white text-[1.1rem] font-bold rounded-full border border-[#292929] bg-gradient-to-b from-[#171717] to-[#242424] shadow-[0_2px_4px_rgba(0,0,0,1),0_10px,20px_rgba(0,0,0,0.4)] transition-all duration-200 active:translate-y-[2px] active:shadow-[0_1px_2px_rgba(0,0,0,1),0_5px_10px_rgba(0,0,0,0.4)] mb-4">
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
        </div>

        {/* Floating Image */}
        <div className="flex justify-center items-center w-full h-screen bg-black" style={{ perspective: '1600px' }}>
          <img
            ref={imageRef}
            src={Blog}
            alt="Blog"
            className="w-[1600px] h-[800px] object-cover rounded-xl shadow-2xl mt-10"
            style={{ transformStyle: 'preserve-3d' }}
          />
        </div>
      </div>

      {/* Logos Section */}
      <div className="flex justify-center items-center flex-col mt-40">
        <h3 className="text-lg text-gray-200 mb-4">Featured in the Top startups</h3>
        <ul className="flex justify-between items-center w-[1200px] gap-10">
          {[raycast, retool, monzo, mercury, perplexity].map((logo, i) => (
            <li key={i} className="list-none">
              <img
                className="w-18 hover:scale-150 duration-500 cursor-pointer"
                src={logo}
                alt={`logo-${i}`}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Sections */}
      <FeatureSection />
      <Pricing />
      <Footer />
    </>
  );
}
