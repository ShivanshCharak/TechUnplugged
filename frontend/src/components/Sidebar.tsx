import { useState } from "react";
import { BACKEND_URL } from "../config";
import bot from '../assets/bot.png'
export default function UtilitiesSidebar() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ sender: "user" | "bot"; text: string }[]>([]);


  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && message.trim() !== "") {
      const userInput = message.trim()
      setMessages((prev) => [...prev, { sender: "user", text: userInput }]);
      setMessage(" ")
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/blog/chatbot`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ message })
        });
        console.log(localStorage.getItem('token'))
        const data = await res.json();
        console.log("Bot reply:", data.reply);
        setMessages((prev) => ([...prev, { sender: "bot", text: data.reply }]))
        // You can set state here to show the reply in UI if needed
      } catch (error) {
        console.error("Error talking to chatbot:", error);
      }

      // Clear input after sending
      setMessage("");
    }
  };

  return (
    <div className="fixed">
  <div className="flex h-screen border-b-2 border-gray-200">
    <div className="flex w-[400px] flex-col relative">
      <div className="flex items-center w-full border-b border-[#191b1e] p-4">
        <div className="w-10 h-10 rounded-full "><img src={bot} alt="" /> </div>
        <div className="ml-4 text-xl font-semibold">AI Chatbot</div>
      </div>

      {/* Message List */}
      <div className="flex flex-col gap-2 px-4 w-full overflow-y-auto h-full pb-24"> 
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[70%] p-2 rounded-md ${
              msg.sender === "user"
                ? "self-start bg-gray-200 text-black mt-3"
                : "self-end bg-[#191b1e] text-white mt-3"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Fixed Input Box */}
  <div className="fixed bottom-0 left-0 w-[400px] bg-black p-2 border-t border-gray-300 z-50">
    <input
      type="text"
      className="w-full p-3 focus:outline-none bg-inherit border border-gray-500 rounded-md"
      placeholder="Type here to search"
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      onKeyDown={handleKeyDown}
    />
  </div>
</div>

  );
}
