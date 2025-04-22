import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { FaBug, FaChevronLeft, FaChevronRight, FaQuestionCircle, FaSignOutAlt } from 'react-icons/fa';
import { GiOwl } from 'react-icons/gi';
import apiClient from '../ApiClient';
import ConversationList from './ConversationList';
import ConversationWindow from './ConversationWindow';

export default function ConversationInterface() {
  const [activeConversation, setActiveConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isInstructionsModalOpen, setInstructionsModalOpen] = useState(false);
  const [bugTitle, setBugTitle] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [bugImage, setBugImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

  const getConversations = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getConversations();
      if (response.conversations) {
        setConversations(
          response.conversations
            .map((conversation) => {
              const lastMessageTimestamp = conversation.messages && conversation.messages.length > 0 
                ? conversation.messages.reduce((latest, message) => {
                    const messageTime = new Date(message.timestamp).getTime();
                    return messageTime > latest ? messageTime : latest;
                  }, 0)
                : new Date(conversation.updated_at).getTime();

              return {
                id: conversation.id,
                title: conversation.title || `Conversation ${conversation.id}`,
                lastMessageTimestamp
              };
            })
            .sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp)
        );
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      const fetchMessages = async () => {
        setLoading(true);
        try {
          const response = await apiClient.getMessages(activeConversation);
          setMessages(response.messages || []);
        } catch (error) {
          console.error('Error fetching messages:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [activeConversation]);

  const handleSendMessage = async (message, file = null) => {
    if (message.trim()) {
      // Add user message to UI immediately
      setLoading(true);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'user', content: message, timestamp: new Date().toISOString() },
      ]);

      try {
        if (activeConversation) {
          // Send message to existing conversation
          const assistantMessage = await apiClient.sendMessage(activeConversation, message, file);
          if (assistantMessage.error !== undefined) {
            alert("Error happened while sending the message");
            window.location.reload();
            return;
          }
          
          setMessages((prevMessages) => [...prevMessages, assistantMessage]);
          
          // Update conversation title if this is the first message in the conversation
          const currentMessages = messages.length;
          if (currentMessages === 0) {
            // This is the first user message, update title
            await apiClient.updateConversationTitle(activeConversation, message);
            // Refresh conversation list to show new title
            getConversations();
          }
        } else {
          // Create a new conversation first
          const conversationResponse = await apiClient.createConversation();
          const newConversationId = conversationResponse.conversationId;
          
          // Then send the message to the new conversation
          const assistantMessage = await apiClient.sendMessage(newConversationId, message, file);
          
          // Update the conversation title based on the first message
          await apiClient.updateConversationTitle(newConversationId, message);
          
          // Update active conversation and refresh conversation list
          setActiveConversation(newConversationId);
          getConversations();
        } 
      } catch (error) {
        console.error('Error sending message:', error);
        alert("Error happened while sending the message");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBugReportSubmit = () => {
    console.log(bugTitle, bugDescription, bugImage);
    // Here you would typically send the bug report to your backend
    setModalOpen(false);
    setBugTitle('');
    setBugDescription('');
    setBugImage(null);
  };

  const handleOpenInstructions = () => setInstructionsModalOpen(true);
  const handleCloseInstructions = () => setInstructionsModalOpen(false);

  // Animation variants
  const sidebarVariants = {
    expanded: { width: '16rem' }, // 64px in tailwind
    collapsed: { width: '4.5rem' }   // Slightly smaller to prevent overflow issues
  };

  const buttonVariants = {
    hover: { backgroundColor: 'rgba(255, 255, 255, 0.1)', scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {/* Sidebar with smooth animations */}
      <motion.div 
        variants={sidebarVariants}
        initial="expanded"
        animate={isSidebarCollapsed ? "collapsed" : "expanded"}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-gradient-to-b from-gray-900 to-gray-950 p-2 shadow-lg backdrop-blur-md overflow-hidden border-r border-white/10 flex flex-col flex-shrink-0"
      >
        {/* Improved Sidebar header - border removed from toggle button when collapsed */}
        <div className="flex items-center justify-between mb-4 p-2 bg-gradient-to-r from-blue-900/20 to-gray-900 rounded-lg border border-white/5">
          <motion.div 
            className="flex items-center"
            initial={false}
            animate={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}
          >
            {isSidebarCollapsed ? (
              <GiOwl size={24} className="text-blue-400" />
            ) : (
              <div className="flex items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-full blur-sm opacity-30"></div>
                  <GiOwl size={28} className="text-blue-400 relative z-10 mr-2" />
                </div>
                <span className="text-xl font-bold text-white">Noctua</span>
              </div>
            )}
          </motion.div>
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={toggleSidebar}
            className={`hover:text-blue-400 text-gray-300 p-1 rounded-lg transition-colors duration-300 
              ${isSidebarCollapsed ? 'bg-gray-800/30' : 'border border-white/5 bg-gray-800/30'}`}
          >
            {isSidebarCollapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
          </motion.button>
        </div>
        {/* Conversation list */}
        <div className="flex-1 overflow-hidden">
          <ConversationList
            conversations={conversations}
            setActiveConversation={setActiveConversation}
            addNewConversation={() => setActiveConversation(null)}
            getConversations={getConversations}
            isSidebarCollapsed={isSidebarCollapsed}
          />
        </div>
        
        {/* Bottom sidebar buttons - removed gradient background */}
        <motion.div 
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 1 }}
          className="mt-auto border-t border-white/5 pt-4 pb-2"
        >
          {/* Bug Report Button */}
          <motion.button 
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => setModalOpen(true)} 
            className={`hover:bg-gray-800/70 text-gray-300 p-2 rounded-lg transition-all duration-200 w-full flex items-center mb-2 
              ${isSidebarCollapsed ? 'justify-center' : 'border border-white/5'}`}
          >
            <FaBug size={isSidebarCollapsed ? 14 : 16} className={isSidebarCollapsed ? '' : 'mr-2'} />
            {!isSidebarCollapsed && <span className="text-sm">Report Issue</span>}
          </motion.button>
          
          {/* How-to Button */}
          <motion.button 
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleOpenInstructions} 
            className={`hover:bg-gray-800/70 text-gray-300 p-2 rounded-lg transition-all duration-200 w-full flex items-center mb-2 
              ${isSidebarCollapsed ? 'justify-center' : 'border border-white/5'}`}
          >
            <FaQuestionCircle size={isSidebarCollapsed ? 14 : 16} className={isSidebarCollapsed ? '' : 'mr-2'} />
            {!isSidebarCollapsed && <span className="text-sm">How to Use</span>}
          </motion.button>
          
          {/* Sign-Out Button */}
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => signOut()}
            className={`hover:bg-gray-800/70 text-gray-300 p-2 rounded-lg transition-all duration-200 w-full flex items-center 
              ${isSidebarCollapsed ? 'justify-center' : 'border border-white/5'}`}
          >
            <FaSignOutAlt size={isSidebarCollapsed ? 14 : 16} className={isSidebarCollapsed ? '' : 'mr-2'} />
            {!isSidebarCollapsed && <span className="text-sm">Sign Out</span>}
          </motion.button>
        </motion.div>
      </motion.div>
      
      {/* Main content */}
      <div className="flex-1 bg-gradient-to-b from-gray-900 via-gray-900 to-black">
        <ConversationWindow 
          messages={messages} 
          sendMessage={handleSendMessage} 
          loading={loading}
        />
      </div>
      
      {/* Bug Report Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-lg shadow-xl border border-white/10 text-white max-w-md w-full"
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <h2 className="text-xl font-bold mb-4 text-blue-300 flex items-center">
                <FaBug className="mr-2" /> Report an Issue
              </h2>
              <input
                type="text"
                className="w-full p-2 border border-white/10 rounded-lg mb-4 bg-gray-800/70 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
                placeholder="Issue Title"
                value={bugTitle}
                onChange={(e) => setBugTitle(e.target.value)}
              />
              <textarea
                className="w-full p-2 border border-white/10 rounded-lg mb-4 bg-gray-800/70 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30 min-h-[120px]"
                placeholder="Describe the issue/bug..."
                value={bugDescription}
                onChange={(e) => setBugDescription(e.target.value)}
              />
              <div className="mb-4">
                <label className="block text-gray-300 mb-2 text-sm">Upload Screenshot (optional)</label>
                <div className="border border-dashed border-white/20 rounded-lg p-4 bg-gray-800/30">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBugImage(e.target.files[0])}
                    className="text-gray-300 w-full text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <motion.button 
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setModalOpen(false)} 
                  className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-gray-600 border border-white/10"
                >
                  Cancel
                </motion.button>
                <motion.button 
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleBugReportSubmit} 
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:from-blue-500 hover:to-blue-400 shadow-md"
                >
                  Submit Report
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Instructions Modal */}
      <AnimatePresence>
        {isInstructionsModalOpen && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-lg shadow-xl border border-white/10 text-white max-w-md w-full"
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <h2 className="text-xl font-bold mb-4 text-blue-300 flex items-center">
                <FaQuestionCircle className="mr-2" /> How to Use Noctua
              </h2>
              <div className="space-y-3 mb-6 text-gray-300">
                <div className="flex items-start p-2 rounded-lg bg-gray-800/50 border border-white/5">
                  <div className="bg-blue-500/20 p-1.5 rounded-md flex-shrink-0 mr-3">
                    <span className="text-blue-400">1</span>
                  </div>
                  <p>Type your question in the chat box and press Enter to send</p>
                </div>
                <div className="flex items-start p-2 rounded-lg bg-gray-800/50 border border-white/5">
                  <div className="bg-blue-500/20 p-1.5 rounded-md flex-shrink-0 mr-3">
                    <span className="text-blue-400">2</span>
                  </div>
                  <p>Create a new chat by clicking the "+" button in the sidebar</p>
                </div>
                <div className="flex items-start p-2 rounded-lg bg-gray-800/50 border border-white/5">
                  <div className="bg-blue-500/20 p-1.5 rounded-md flex-shrink-0 mr-3">
                    <span className="text-blue-400">3</span>
                  </div>
                  <p>Switch between different conversations using the sidebar</p>
                </div>
                <div className="flex items-start p-2 rounded-lg bg-gray-800/50 border border-white/5">
                  <div className="bg-blue-500/20 p-1.5 rounded-md flex-shrink-0 mr-3">
                    <span className="text-blue-400">4</span>
                  </div>
                  <p>You can provide feedback on Noctua's responses with the thumbs up/down buttons</p>
                </div>
                <div className="flex items-start p-2 rounded-lg bg-gray-800/50 border border-white/5">
                  <div className="bg-blue-500/20 p-1.5 rounded-md flex-shrink-0 mr-3">
                    <span className="text-blue-400">5</span>
                  </div>
                  <p>Click the copy button to copy any response to your clipboard</p>
                </div>
              </div>
              <div className="flex justify-end">
                <motion.button 
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleCloseInstructions} 
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:from-blue-500 hover:to-blue-400 shadow-md"
                >
                  Got it
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}