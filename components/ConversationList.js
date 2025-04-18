import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { FiMessageSquare } from 'react-icons/fi';
import apiClient from '../ApiClient';

export default function ConversationList({ conversations, setActiveConversation, addNewConversation, getConversations, isSidebarCollapsed }) {
  const [hoverStates, setHoverStates] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);

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

  const handleMouseEnter = (conversationId) => {
    setHoverStates(prev => ({ ...prev, [conversationId]: true }));
  };

  const handleMouseLeave = (conversationId) => {
    setHoverStates(prev => ({ ...prev, [conversationId]: false }));
  };

  // State to track which categories are open/closed
  const [openCategories, setOpenCategories] = useState({
    today: true,
    yesterday: true,
    lastWeek: true,
    past: true
  });

  // Toggle a specific category open/closed
  const toggleCategory = (categoryToToggle) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryToToggle]: !prev[categoryToToggle]
    }));
  };

  const categorizedConversations = categorizeConversations(conversations);

  // Consistent animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
  };

  // Add the shimmer animation for the New Chat button
  const shimmerAnimation = `
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .animate-shimmer {
      animation: shimmer 2s infinite;
    }
  `;

  return (
    <div className="text-white flex flex-col flex-grow overflow-hidden">
      <style>{shimmerAnimation}</style>
      {/* More impressive New Conversation Button */}
      <motion.button
        whileHover={{ 
          boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)",
          y: -1
        }}
        whileTap={{ scale: 0.97, y: 1 }}
        onClick={addNewConversation}
        className={`flex items-center justify-center bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500 
          text-white p-2.5 rounded-lg mb-4 transition-all duration-300 shadow-lg overflow-hidden
          border border-white/20 relative group ${isSidebarCollapsed ? 'w-full' : 'w-full'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-400/30 to-blue-500/0 
          opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm transform translate-x-full 
          group-hover:translate-x-0 animate-shimmer"></div>
          
        <div className="bg-blue-500 rounded-full p-1 mr-2 flex items-center justify-center relative z-10">
          <FaPlus className="text-white" size={isSidebarCollapsed ? 12 : 12} />
        </div>
        
        {!isSidebarCollapsed && (
          <span className="font-medium tracking-wide text-sm relative z-10">New Conversation</span>
        )}
      </motion.button>

      {/* Conversation Categories */}
      <div className="space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent pr-1">
        {Object.entries(categorizedConversations).map(([category, categoryConversations]) => {
          if (categoryConversations.length === 0) return null;
          
          // Check if this specific category is open
          const isCategoryOpen = openCategories[category];
          
          return (
            <div key={category} className="mb-2">
              {/* Category Header */}
              <motion.div 
                onClick={() => toggleCategory(category)}
                initial={false}
                animate={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                className={`text-xs uppercase font-medium text-gray-400 mb-1 py-1 px-2 rounded cursor-pointer
                  transition-colors duration-200 flex items-center justify-between`}
                style={{ maxWidth: "100%" }}
              >
                <span className="tracking-wider truncate">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
                {!isSidebarCollapsed && (
                  <div className="flex items-center">
                    <span className="text-gray-500 text-xs bg-gray-800/50 px-1.5 py-0.5 rounded-full ml-1 flex-shrink-0">
                      {categoryConversations.length}
                    </span>
                    <span className="ml-1 text-xs text-gray-500">
                      {isCategoryOpen ? '▼' : '►'}
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Conversation List for this Category */}
              <AnimatePresence>
                {isCategoryOpen && (
                  <motion.ul 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1 overflow-hidden"
                  >
                    {categoryConversations.map((conversation) => {
                      const conversationNumber = conversation.title.replace(/\D/g, '') || conversation.title;
                      const isHovered = hoverStates[conversation.id];
          
                      return (
                        <motion.li
                          key={conversation.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          onMouseEnter={() => handleMouseEnter(conversation.id)}
                          onMouseLeave={() => handleMouseLeave(conversation.id)}
                          className={`flex items-center p-2 rounded-lg 
                            transition-all duration-200 cursor-pointer border border-transparent
                            ${isHovered ? 'bg-gray-800/80 border-white/5' : 'hover:bg-gray-800/50'}`}
                          onClick={() => setActiveConversation(conversation.id)}
                        >
                          {/* Smaller icon for collapsed sidebar */}
                          <div className={`bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-md flex items-center justify-center
                            ${isSidebarCollapsed ? 'p-1' : 'p-1.5'}`}>
                            <FiMessageSquare size={isSidebarCollapsed ? 12 : 16} className="text-blue-400" />
                          </div>
                          
                          {isSidebarCollapsed ? (
                            <span className="ml-1 text-xs font-medium truncate">{conversationNumber}</span>
                          ) : (
                            <>
                              <span className="flex-1 ml-2 text-sm truncate text-gray-300">
                                {conversation.title}
                              </span>
                              <motion.button
                                id={`delete-${conversation.id}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: isHovered ? 1 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="p-1 rounded-md transition duration-300 hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteConversation(conversation.id);
                                }}
                              >
                                <FaTrash size={14} />
                              </motion.button>
                            </>
                          )}
                        </motion.li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}