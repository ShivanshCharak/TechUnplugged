// components/Pricing.jsx
import React from 'react';
import circle from '../assets/check.svg';

const Pricing = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 bg-gradient-to-r from-[#d8d8d8] to-[#7c7c7c] to-[64%] bg-clip-text text-transparent">
        Plans that scale with you
      </h1>

      <p className="text-gray-400 text-sm text-center mb-20 mt-3">
        Choose a plan that's right for you.
      </p>

      <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl relative">
        {/* Standard Plan */}
        <div className="border border-zinc-900 rounded-xl p-6 flex flex-col items-start bg-[#0a0a0a]">
          <h3 className="text-xl font-semibold">Standard</h3>
          <p className="text-gray-400 text-sm mb-4">Great for new bloggers</p>
          <span className='w-full h-[0.4px] bg-zinc-700 my-4'></span>
          <h2 className="text-3xl font-bold mb-1">$ 30<span className="text-lg font-medium">/m</span></h2>
          <p className="text-gray-500 text-xs mb-6">Pause or cancel any time</p>
          <button className="bg-zinc-900 border-[1px] border-zinc-600  text-white font-semibold rounded-lg py-3 w-full text-sm mb-2 duration-300  hover:text-black transition-all hover:text-[1em] hover:bg-white ">
            Get Started
          </button>
          <button className="text-sm text-white underline mb-6 mx-auto">Book a call</button>
          <ul className="text-sm space-y-2 text-white">
            <li className="list-none ml-[-60px] my-2 flex w-[150%]"> <img src={circle} alt="" /> <span className="ml-[10px]">Simple, clean designs to get started.</span> </li>
            <li className="list-none ml-[-60px] my-2 flex w-[150%] "><img src={circle} alt="" /><span className="ml-[10px]"> Track basic engagement metrics</span></li>
            <li className="list-none ml-[-60px] my-2 flex w-[150%] "> <img src={circle} alt="" /><span className="ml-[10px]">Store upto 1gb images and videos</span></li>
            <li className="list-none ml-[-60px] my-2 flex w-[150%] "><img src={circle} alt="" /> <span className="ml-[10px]">Use a free domain with your name</span></li>
            <li className="list-none ml-[-60px] my-2 flex w-[150%] "><img src={circle} alt="" /> <span className="ml-[10px]">Optimized for Mobile phones</span></li>
            <li className="list-none ml-[-60px] my-2 flex w-[150%]"><img src={circle} alt="" /> <span className="ml-[10px] ">Optimized blog for search engines</span></li>
          </ul>
        </div>

        {/* Pro Plan */}
        <div className="border border-zinc-900 rounded-xl p-6 flex flex-col items-start bg-[#0a0a0a] relative">
          {/* Starburst badge */}
          <div className="absolute -top-4 right-4 bg-gradient-to-tr from-gray-300 to-gray-100 text-black text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
            🌟 Top Choice
          </div>

          <h3 className="text-xl font-semibold">Pro</h3>
          <p className="text-gray-400 text-sm mb-4">Great for the growing bloggers</p>
          <span className='w-full h-[0.4px] bg-zinc-700 my-4'></span>
          <h2 className="text-3xl font-bold mb-1">$ 40<span className="text-lg font-medium">/m</span></h2>
          <p className="text-gray-500 text-xs mb-6">Pause or cancel any time</p>
          <button className="duration-300 hover:bg-white hover:text-black transition-all hover:text-[0.9em]   animate-shake  border-none text-white font-semibold rounded-lg py-3 w-full text-sm mb-2 bg-zinc-900 border-[1px] border-zinc-600 ">
            Get Started
          </button>

          <button className="text-sm text-white text-center underline mb-6 mx-auto ">Book a call</button>
          <ul className="text-sm space-y-2 text-white">
            <li className="list-none ml-[-60px] my-2 flex w-[150%]"> <img src={circle} alt="" /> <span className="ml-[10px]">Access to libraray of premium themes</span> </li>
            <li className="list-none ml-[-60px] my-2 flex w-[150%] "><img src={circle} alt="" /><span className="ml-[10px]"> Advance Analytics to dive deeper into advance metrics</span></li>
            <li className="list-none ml-[-60px] my-2 flex w-[150%] "> <img src={circle} alt="" /><span className="ml-[10px]">Store more content like HD images and videos</span></li>
            <li className="list-none ml-[-60px] my-2 flex w-[150%] "><img src={circle} alt="" /> <span className="ml-[10px]">Adavance SEO features</span></li>
            <li className="list-none ml-[-60px] my-2 flex w-[150%] "><img src={circle} alt="" /> <span className="ml-[10px]">Priority Email support from our team</span></li>
            <li className="list-none ml-[-60px] my-2 flex w-[150%]"><img src={circle} alt="" /> <span className="ml-[10px]">Easily shre post and grow your social following</span></li>
          </ul>
        </div>

        {/* Book a Call Box */}
        <div className="border border-zinc-900 rounded-xl p-6 flex flex-col justify-between bg-[#0a0a0a]">
          <div>
            <div className="text-2xl mb-4">📞</div>
            <h3 className="text-lg font-semibold mb-1">Book a call</h3>
            <p className="text-gray-400 text-sm">
              Learn more about how tech unplugged works and how we can help your business grow.
            </p>
          </div>
          <button className="bg-white text-black rounded-lg py-2 mt-6 w-full font-medium">
            Book a call
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;