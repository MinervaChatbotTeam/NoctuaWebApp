import { motion } from 'framer-motion';
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

  const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

  const getConversations = async () => {
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
    }
  };

  useEffect(() => {
    getConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      const fetchMessages = async () => {
        try {
          const response = await apiClient.getMessages(activeConversation);
          setMessages(response.messages || []);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [activeConversation]);

  const handleSendMessage = async (message) => {
    if (message.trim()) {
      // Add user message to UI immediately
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'user', content: message, timestamp: new Date().toISOString() },
      ]);

      try {
        if (activeConversation) {
          // Send message to existing conversation
          const assistantMessage = await apiClient.sendMessage(activeConversation, message);
          console.log('assistantMessage')
          console.log(assistantMessage)
          setMessages((prevMessages) => [...prevMessages, assistantMessage]);
        } else {
          // Create a new conversation first
          const conversationResponse = await apiClient.createConversation();
          const newConversationId = conversationResponse.conversationId;
          
          // Then send the message to the new conversation
          const assistantMessage = await apiClient.sendMessage(newConversationId, message);
          
          // Update active conversation and refresh conversation list
          setActiveConversation(newConversationId);
          getConversations();
        } 
      } catch (error) {
        console.error('Error sending message:', error);
        alert("Error happened while sending the message");
      }
    }
  };

  const handleBugReportSubmit = () => {
    console.log(bugTitle, bugDescription, bugImage);
    setModalOpen(false);
  };

  const handleOpenInstructions = () => setInstructionsModalOpen(true);
  const handleCloseInstructions = () => setInstructionsModalOpen(false);

  return (
    <div className="flex h-screen">
      <div className={`transition-all duration-300 bg-gray-900 p-2 shadow-lg backdrop-blur-md overflow-hidden ${isSidebarCollapsed ? 'w-20' : 'w-64'} flex flex-col`}>
        {/* Sidebar content */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {isSidebarCollapsed ? (
              <GiOwl size={32} className="text-blue-400 mx-auto" />
            ) : (
              <div className="flex items-center">
                <GiOwl size={32} className="text-blue-400 mr-2" />
                <span className="text-xl font-bold text-white">Noctua</span>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="hover:text-blue-400 text-gray-300 p-2 rounded-lg transition-colors duration-300"
          >
            {isSidebarCollapsed ? <FaChevronRight size={20} /> : <FaChevronLeft size={20} />}
          </button>
        </div>
        <ConversationList
          conversations={conversations}
          setActiveConversation={setActiveConversation}
          addNewConversation={() => setActiveConversation(null)}
          getConversations={getConversations}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        {/* Bug Report Button */}
        <div className="mt-4">
          <button onClick={() => setModalOpen(true)} className={`hover:bg-gray-700 text-gray-300 p-2 rounded-lg transition-colors duration-300 w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <FaBug size={20} className="mr-2" />
            {!isSidebarCollapsed && <span className="ml-2">Report Issue</span>}
          </button>
        </div>
        {/* How-to Button */}
        <div className="mt-4">
          <button onClick={handleOpenInstructions} className={`hover:bg-gray-700 text-gray-300 p-2 rounded-lg transition-colors duration-300 w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <FaQuestionCircle size={20} className="mr-2" />
            {!isSidebarCollapsed && <span className="ml-2">How-to?</span>}
          </button>
        </div>
        {/* Sign-Out Button */}
        <div className="mt-4">
          <button
            onClick={() => signOut()}
            className={`hover:bg-gray-700 text-gray-300 p-2 rounded-lg transition-colors duration-300 w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : ''}`}
          >
            <FaSignOutAlt size={20} className="mr-2" />
            {!isSidebarCollapsed && <span className="ml-2">Sign Out</span>}
          </button>
        </div>
      </div>
      <div className="flex-1 bg-gray-900 p-4">
        <ConversationWindow messages={messages} sendMessage={handleSendMessage} />
      </div>
      {/* Bug Report Modal */}
      {isModalOpen && (
        <motion.div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Report an Issue</h2>
            <input
              type="text"
              className="w-full p-2 border border-gray-600 rounded mb-4 bg-gray-100 text-black"
              placeholder="Issue Title"
              value={bugTitle}
              onChange={(e) => setBugTitle(e.target.value)}
            />
            <textarea
              className="w-full p-2 border border-gray-600 rounded mb-4 bg-gray-100 text-black"
              placeholder="Describe the issue/bug..."
              value={bugDescription}
              onChange={(e) => setBugDescription(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBugImage(e.target.files[0])}
              className="mb-4"
            />
            <div className="flex justify-end">
              <button 
                onClick={handleBugReportSubmit} 
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2 transition-transform duration-300 hover:scale-105"
              >
                Submit
              </button>
              <button 
                onClick={() => setModalOpen(false)} 
                className="bg-gray-300 text-black px-4 py-2 rounded transition-transform duration-300 hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}
      {/* Instructions Modal */}
      {isInstructionsModalOpen && (
        <motion.div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">How to Use the Web App</h2>
            <p className="mb-4">Here are some instructions on how to use the web app...</p>
            {/* Add more detailed instructions here */}
            <div className="flex justify-end">
              <button 
                onClick={handleCloseInstructions} 
                className="bg-gray-300 text-black px-4 py-2 rounded transition-transform duration-300 hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}