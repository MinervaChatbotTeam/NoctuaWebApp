import { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { signOut } from 'next-auth/react';
import apiClient from '@/ApiClient';
import { FaChevronLeft, FaChevronRight, FaSignOutAlt, FaBug, FaQuestionCircle } from 'react-icons/fa';
import { GiOwl } from 'react-icons/gi';
import { motion } from 'framer-motion';

export default function ChatInterface() {
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isInstructionsModalOpen, setInstructionsModalOpen] = useState(false);
  const [bugTitle, setBugTitle] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [bugImage, setBugImage] = useState(null);

  const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

  const getChats = async () => {
    const response = await apiClient.getAllConversations(activeChat);
    setChats(
      response.conversations
        .map((chat) => {
          const lastMessageTimestamp = chat.messages.reduce((latest, message) => {
            const messageTime = new Date(message.timestamp).getTime();
            return messageTime > latest ? messageTime : latest;
          }, 0);

          return {
            id: chat.id,
            title: chat.conversation_id,
            lastMessageTimestamp
          };
        })
        .sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp)
    );
  };

  useEffect(() => {
    getChats();
  }, []);

  useEffect(() => {
    if (activeChat) {
      const fetchMessages = async () => {
        const chatMessages = await apiClient.getMessages(activeChat);
        setMessages(chatMessages.messages);
      };
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  const handleSendMessage = async (message) => {
    if (message.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'user', content: message },
      ]);

      if (activeChat) {
        const assistantMessage = await apiClient.sendMessage(activeChat, message);
        if (assistantMessage.error != undefined) {
          alert("Error happened while sending the message");
          window.location.reload();
          return;
        }
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      } else {
        await addNewChat(message);
      }
    }
  };

  const addNewChat = async (message) => {
    const newChatId = (chats.length + 1).toString();
    const response = await apiClient.createChat(message, `Chat ${newChatId}`);
    if (response.error != undefined) {
      alert("Error happened while sending the message");
      window.location.reload();
      return;
    }
    const newChat = { id: response.conversationid, title: `Chat ${newChatId}` };
    setChats([...chats, newChat]);
    setActiveChat(response.conversationid);
    setMessages([{ role: 'user', content: message }]);
    const assistantResponse = await apiClient.getMessages(response.conversationid);
    const assistantMessage = assistantResponse.messages[1];
    setMessages((prevMessages) => [...prevMessages, assistantMessage]);
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
        <ChatList
          chats={chats}
          setActiveChat={setActiveChat}
          addNewChat={() => setActiveChat(null)}
          getChats={getChats}
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
        <ChatWindow messages={messages} sendMessage={handleSendMessage} />
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