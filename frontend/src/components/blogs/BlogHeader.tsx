import crown from "../../assets/crown.svg";
import person from "../../assets/person.svg";
import wand from "../../assets/wand.svg";
import { useState } from "react";
export default function BlogHeader() {
  const [activeHeader, setActiveHeader] = useState<String>("Personalized");
  function getRecent(){
    
  }
  return (
    <div className="flex w-[400px] justify-between">
      <span
        className={`${
          activeHeader === "Personalized" ? "bg-zinc-900" : ""
        } font-semibold flex items-center  tranition-colors justify-between cursor-pointer p-3 rounded-lg`}
        onClick={() => {
          setActiveHeader("Personalized");
        }}
      >
        {" "}
        <img
          className="w-[20px] h-[20px] mr-2"
          src={wand}
          alt=""
          onClick={() => {
            setActiveHeader("Personalized");
          }}
        />
        Personalized
      </span>
      <span
        className={`${
          activeHeader === "Recent" ? "bg-zinc-900" : ""
        } font-semibold flex items-center duration-500 justify-between cursor-pointer p-3 rounded-lg`}
        onClick={() => {
        fetch("http://localhost:8787/api/v1/blog/recent").then(async (res)=>{
            let response = await res.json()
            console.log(response)
        })
          setActiveHeader("Recent");
        }}
      >
        {" "}
        <img
          className="w-[20px] h-[20px] mr-2"
          src={person}
          alt=""
          onClick={() => {
            setActiveHeader("Recent");
          }}
        />
        Recent
      </span>
      <span
        className={`${
          activeHeader === "Featured" ? "bg-zinc-900" : ""
        } font-semibold duration-500 transition-colors flex items-center justify-between cursor-pointer p-3 rounded-lg `}
        onClick={() => {
          setActiveHeader("Featured");
        }}
      >
        {" "}
        <img
          className="w-[20px] h-[20px] mr-2"
          src={crown}
          alt=""
          onClick={() => {
            setActiveHeader("Featured");
          }}
        />{" "}
        Featured
      </span>
    </div>
  );
}
