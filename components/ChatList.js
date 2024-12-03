// ChatList.js
import apiClient from '@/ApiClient';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { FiMessageSquare } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function ChatList({ chats, setActiveChat, addNewChat, getChats, isSidebarCollapsed }) {
  const handleDeleteChat = async (chatId) => {
    const deleteButton = document.getElementById(`delete-${chatId}`);
    deleteButton.disabled = true;

    await apiClient.deleteChat(chatId);
    getChats();
    setActiveChat(null);

    setTimeout(() => {
      deleteButton.disabled = false;
    }, 2000);
  };

  return (
    <div className="text-white flex flex-col flex-grow overflow-hidden">
      <button
        onClick={addNewChat}
        className={`flex items-center bg-blue-600 text-white p-2 rounded-lg mb-4 hover:bg-blue-700 transition duration-300 ${
          isSidebarCollapsed ? 'justify-center' : ''
        }`}
      >
        <FaPlus />
        {!isSidebarCollapsed && <span className="ml-2">New Chat</span>}
      </button>
      <ul className="space-y-2 flex-1 overflow-auto">
        {chats.map((chat) => {
          // Extract the number from the chat title (assuming titles like "Chat 1", "Chat 2")
          const chatNumber = chat.title.replace(/\D/g, '') || chat.title;

          return (
            <motion.li
              key={chat.id}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center p-2 rounded-lg hover:bg-gray-700 transition duration-200 cursor-pointer"
              onClick={() => setActiveChat(chat.id)}
            >
              <FiMessageSquare size={18} />
              {isSidebarCollapsed ? (
                // Display the chat number next to the icon when collapsed
                <span className="ml-1 text-sm">{chatNumber}</span>
              ) : (
                <>
                  <span className="flex-1 ml-2 text-sm truncate">{chat.title}</span>
                  <button
                    id={`delete-${chat.id}`}
                    className="p-1 rounded-lg ml-2 transition duration-300 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(chat.id);
                    }}
                  >
                    <FaTrash />
                  </button>
                </>
              )}
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
