import { motion } from 'framer-motion';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { FiMessageSquare } from 'react-icons/fi';
import apiClient from '../ApiClient';

export default function ConversationList({ conversations, setActiveConversation, addNewConversation, getConversations, isSidebarCollapsed }) {
  const handleDeleteConversation = async (conversationId) => {
    const deleteButton = document.getElementById(`delete-${conversationId}`);
    deleteButton.disabled = true;

    await apiClient.deleteConversation(conversationId);
    getConversations();
    setActiveConversation(null);

    setTimeout(() => {
      deleteButton.disabled = false;
    }, 2000);
  };

  const categorizeConversations = (conversations) => {
    const now = new Date();
    const categorizedConversations = {
      today: [],
      yesterday: [],
      lastWeek: [],
      past: []
    };
  
    conversations.forEach(conversation => {
      const lastMessageDate = new Date(conversation.lastMessageTimestamp);
      const diffTime = now - lastMessageDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
      if (diffDays === 0) {
        categorizedConversations.today.push(conversation);
      } else if (diffDays === 1) {
        categorizedConversations.yesterday.push(conversation);
      } else if (diffDays <= 7) {
        categorizedConversations.lastWeek.push(conversation);
      } else {
        categorizedConversations.past.push(conversation);
      }
    });
  
    return categorizedConversations;
  };

  const categorizedConversations = categorizeConversations(conversations);

  return (
    <div className="text-white flex flex-col flex-grow overflow-hidden">
      <button
        onClick={addNewConversation}
        className={`flex items-center bg-blue-600 text-white p-2 rounded-lg mb-4 hover:bg-blue-700 transition duration-300 ${
          isSidebarCollapsed ? 'justify-center' : ''
        }`}
      >
        <FaPlus />
        {!isSidebarCollapsed && <span className="ml-2">New Conversation</span>}
      </button>
      <div className="space-y-4">
        {Object.entries(categorizedConversations).map(([category, conversations]) => {
          if (conversations.length === 0) return null;
  
          return (
            <div key={category}>
              <h3 className="text-sm font-medium text-gray-400 mb-1 text-center">{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
              <ul className="space-y-2 flex-1 overflow-auto">
                {conversations.map((conversation) => {
                  const conversationNumber = conversation.title.replace(/\D/g, '') || conversation.title;
  
                  return (
                    <motion.li
                      key={conversation.id}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center p-2 rounded-lg hover:bg-gray-700 transition duration-200 cursor-pointer"
                      onClick={() => setActiveConversation(conversation.id)}
                    >
                      <FiMessageSquare size={18} />
                      {isSidebarCollapsed ? (
                        <span className="ml-1 text-sm">{conversationNumber}</span>
                      ) : (
                        <>
                          <span className="flex-1 ml-2 text-sm truncate">{conversation.title}</span>
                          <button
                            id={`delete-${conversation.id}`}
                            className="p-1 rounded-lg ml-2 transition duration-300 hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConversation(conversation.id);
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