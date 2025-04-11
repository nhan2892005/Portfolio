import React from "react";
import { MessageCircle } from "lucide-react"; // Hoặc dùng bất kỳ icon nào bạn thích

const ChatBtn = () => {
  const handleClick = () => {
    alert("Chat hỗ trợ chưa được triển khai."); // Bạn có thể mở modal/chat thật ở đây
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300"
      title="Hỗ trợ chat"
    >
      <MessageCircle size={24} />
    </button>
  );
};

export default ChatBtn;
