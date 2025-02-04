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

  const categorizeChats = (chats) => {
    const now = new Date();
    const categorizedChats = {
      today: [],
      yesterday: [],
      lastWeek: [],
      past: []
    };
  
    chats.forEach(chat => {
      const lastMessageDate = new Date(chat.lastMessageTimestamp); // Use the lastMessageTimestamp
      const diffTime = now - lastMessageDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
      if (diffDays === 0) {
        categorizedChats.today.push(chat);
      } else if (diffDays === 1) {
        categorizedChats.yesterday.push(chat);
      } else if (diffDays <= 7) {
        categorizedChats.lastWeek.push(chat);
      } else {
        categorizedChats.past.push(chat);
      }
    });
  
    return categorizedChats;
  };

  const categorizedChats = categorizeChats(chats);

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
      <div className="space-y-4">
        {Object.entries(categorizedChats).map(([category, chats]) => {
          if (chats.length === 0) return null;
  
          return (
            <div key={category}>
              <h3 className="text-sm font-medium text-gray-400 mb-1 text-center">{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
              <ul className="space-y-2 flex-1 overflow-auto">
                {chats.map((chat) => {
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
        })}
      </div>
    </div>
  );
}