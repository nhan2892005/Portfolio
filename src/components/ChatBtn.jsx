import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom"
import { GoogleGenAI } from "@google/genai";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { SYSTEM_PROMPT } from "../constants";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_CHAT_API });

function usePageText(callback) {
  const location = useLocation();

  useEffect(() => {
    const timeout = setTimeout(() => {
      const text = document.body.innerText.trim();
      if (text) {
        callback(text);
      }
    }, 0); 

    return () => clearTimeout(timeout);
  }, [location.pathname]);
}

const ChatBtn = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [size, setSize] = useState({ width: 78, height: 78 });
  const [pageContext, setPageContext] = useState("")
  const [showHint, setShowHint] = useState(true);

  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  usePageText((text) => {
    setPageContext(text)
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowHint(false);
    }, 20000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Đây là yêu cầu của hệ thống: ${SYSTEM_PROMPT}, 
                    Đây là nội dung hiện tại của trang: ${pageContext}
                    Đây là yêu cầu từ người dùng ${input}`,
        config: {
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      });
      const text = response.text

      const botReply = { role: "bot", content: text || "Không có phản hồi." };
      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Lỗi kết nối đến server." },
      ]);
    }
  };

  return (
    <>
      {/* Chat toggle button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg"
        title="Chat hỗ trợ"
      >
        💬
      </button>
      {!isOpen && showHint && (
        <div className="fixed bottom-24 right-6 z-50 animate-bounce bg-blue-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          Trợ lý ảo sẽ hỗ trợ bạn!
        </div>
      )}

      {isOpen && (
        <div
          className="fixed bottom-20 right-4 sm:right-6 bg-gray-900 text-white border border-gray-700 rounded-xl shadow-2xl z-50 flex flex-col transition-all"
          style={{
            width: `${size.width}vw`,
            height: `${size.height}vh`,
          }}
        >
          {/* Header with resize controls */}
          <div className="bg-gray-800 px-4 py-2 rounded-t-xl flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold">💬 Trợ lý AI của Phúc Nhân</span>
              <button onClick={toggleChat} className="hover:text-red-400">✖</button>
            </div>
            {/* Responsive sliders: stacked on small, inline on sm+ */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs">
              <label className="flex items-center gap-1 w-full sm:w-auto">
                W:
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={size.width}
                  onChange={(e) => setSize((s) => ({ ...s, width: +e.target.value }))}
                  className="w-full sm:w-24"
                />
                <span className="ml-1">{size.width}%</span>
              </label>
              <label className="flex items-center gap-1 w-full sm:w-auto">
                H:
                <input
                  type="range"
                  min={40}
                  max={90}
                  value={size.height}
                  onChange={(e) => setSize((s) => ({ ...s, height: +e.target.value }))}
                  className="w-full sm:w-24"
                />
                <span className="ml-1">{size.height}%</span>
              </label>
            </div>
          </div>

          {/* Messages container */}
          <div ref={containerRef} className="flex-1 px-4 py-2 overflow-y-auto space-y-3 text-sm">
            <div className="text-gray-400 text-sm italic bg-gray-800 p-3 rounded-lg">
              🤖 Xin chào! Tôi là trợ lý AI của Phúc Nhân.
              <br />
              Tôi có thể giúp bạn:
              <ul className="list-disc list-inside ml-2 mt-1">
                <li>Hiểu rõ hơn về Phúc Nhân</li>
                <li>Hỗ trợ một số công việc cơ bản (viết lách, coding, làm toán)</li>
                <li>Giải thích nội dung của trang hiện tại</li>
                <li>Gợi ý khám phá các trang như Dự án, Blog, Liên hệ...</li>
              </ul>
              👉 Bạn có thể bắt đầu bằng cách hỏi: <br />
              <span className="underline text-blue-400">
                “Bạn có thể giới thiệu về Phúc Nhân không?”
              </span>
            </div>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg whitespace-pre-wrap max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-blue-700 text-white self-end text-right ml-auto"
                    : "bg-gray-700 text-white self-start text-left mr-auto"
                }`}
              >
                {msg.role === "bot" ? (
                  <MarkdownPreview source={msg.content} />
                ) : (
                  msg.content
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="p-3 border-t border-gray-700 bg-gray-800 flex flex-col sm:flex-row gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tin nhắn..."
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none sm:shrink-0"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBtn;
