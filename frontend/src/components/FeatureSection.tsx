import { useState } from 'react';
import asset from '../assets/assets.jpeg';
import asset2 from '../assets/asset2.jpeg';
import asset3 from '../assets/asset3.jpeg';

interface PopUpState {
  index: number | null;
  showPopup: boolean;
}

const initialValues: PopUpState = {
  index: null,
  showPopup: false,
};

const features = [
  {
    title: "Purpose-built for modern bloggers",
    image: asset,
    description: `BlogFlow was designed with one goal: to help writers focus on what they do best - creating compelling content. Every feature is intentionally crafted to remove distractions and enhance your writing flow.`,
    quote: {
      text: "I've tried every blogging platform out there, but BlogFlow is the first that feels like it was made specifically for writers.",
      author: "Sarah Johnson",
      role: "Professional Blogger",
    },
    highlights: [
      "Distraction-free writing environment",
      "Built-in research tools",
      "Seamless publishing workflow",
    ],
  },
  {
    title: "Designed for writing efficiency",
    image: asset2,
    description: `Speed matters when inspiration strikes. BlogFlow's lightning-fast interface keeps up with your thoughts, eliminating lag and frustration.`,
    quote: {
      text: "My writing productivity increased by 40% after switching to BlogFlow. The intuitive interface just gets out of my way.",
      author: "Michael Chen",
      role: "Tech Writer",
    },
    highlights: [
      "Instantaneous search",
      "Smart content organization",
      "One-click formatting",
    ],
  },
  {
    title: "Crafted for storytelling excellence",
    image: asset3,
    description: `Beautiful design shouldn't require technical skills. BlogFlow combines powerful customization with simplicity.`,
    quote: {
      text: "For the first time, my writing looks as good as it reads. The design options are perfect without being overwhelming.",
      author: "Emma Rodriguez",
      role: "Travel Writer",
    },
    highlights: [
      "Handcrafted templates",
      "Automated image optimization",
      "Reader engagement analytics",
    ],
  },
];

const FeatureSection = () => {
  const [popup, setPopup] = useState<PopUpState>(initialValues);

  const handlePopupToggle = (idx: number) => {
    setPopup((prev) => ({
      index: prev.index === idx ? null : idx,
      showPopup: prev.index === idx ? !prev.showPopup : true,
    }));
  };

  return (
    <section className="bg-black text-white px-6 py-16 md:px-12 lg:px-24 mt-40 relative z-10">
      {/* Heading */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-5xl md:text-6xl font-bold leading-tight mb-4">
          Made for modern <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            product teams
          </span>
        </h2>
        <p className="text-gray-400 text-sm md:text-base font-semibold mt-4">
          Techblog is shaped by the practices and principles that distinguish world-class product teams from the rest: relentless focus, fast execution, and a commitment to the quality of craft.
        </p>
        <div className="mt-6 cursor-pointer text-white font-semibold hover:mr-4 duration-200 inline-flex items-center">
          Make the switch &nbsp; --&gt;
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="bg-[#111] hover:bg-[#323436] rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg transition cursor-pointer"
          >
            <img
              src={feature.image}
              alt={feature.title}
              className="rounded-xl mb-6 hover:scale-110 duration-300"
            />
            <div className="flex justify-between items-center">
              <p className="text-md font-medium">{feature.title}</p>
              <span
                className="duration-300 text-md cursor-pointer border-2 border-zinc-700 hover:bg-[#323436] flex w-10 h-10 justify-center items-center rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePopupToggle(idx);
                }}
              >
                +
              </span>
            </div>

            {/* Popup */}
            {popup.showPopup && popup.index === idx && (
              <div className="fixed inset-0 z-50 flex justify-center items-start bg-black/60 backdrop-blur-sm p-10 ">
                <div className="bg-[#111111] text-white w-[1000px] rounded-xl p-6 relative overflow-auto max-h-[90vh]">
                  {/* Close Button */}
                  <button
                    className="fixed top-4 right-6 text-xl bg-[#222] hover:bg-[#333] rounded-full px-3 py-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPopup(initialValues);
                    }}
                  >
                    ×
                  </button>


                  <img src={feature.image} alt="" className="rounded-lg mb-6" />

             
                  <h1 className="text-3xl/[3.7rem] font-bold mb-4 mt-[-200px] text-center">{feature.title}</h1>
                  <p className="text-gray-300 mb-4">{feature.description}</p>

             
                  <blockquote className="italic text-gray-400 mb-4">
                    “{feature.quote.text}”
                    <br />
                    <span className="text-sm">- {feature.quote.author}, {feature.quote.role}</span>
                  </blockquote>

              
                  <div className="grid grid-cols-2 gap-4 mt-6 text-sm text-gray-300 border-t-2 border-zinc-900 py-5">
                    <div className="flex flex-col" ><strong className="text-8xl">{Math.ceil(Math.random() * 100)}k</strong> Paying customers</div>
                    <div className="flex flex-col" ><strong className="text-8xl">{Math.ceil(Math.random() * 1000)}k+</strong> Active users</div>
                    <div className="flex flex-col" ><strong className="text-8xl">{Math.ceil(Math.random() * 100)}%</strong> Companies using this</div>
                    <div className="flex flex-col" ><strong className="text-8xl">{Math.ceil(Math.random() * 100)}%</strong> Startups using TechBlogs</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureSection;
