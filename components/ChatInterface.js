// ChatInterface.js
import { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { signOut } from 'next-auth/react';
import apiClient from '@/ApiClient';
import { FaChevronLeft, FaChevronRight, FaSignOutAlt } from 'react-icons/fa';
import { GiOwl } from 'react-icons/gi'; // Placeholder logo

export default function ChatInterface() {
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

  const getChats = async () => {
    const response = await apiClient.getAllConversations(activeChat);
    setChats(
      response.conversations.map((chat) => ({ id: chat.id, title: chat.conversation_id }))
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
      // Insert the user's message immediately
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'user', content: message },
      ]);

      if (activeChat) {
        // Wait for the assistant's reply and append only the new message
        const assistantMessage = await apiClient.sendMessage(activeChat, message);

        // Append only the assistant's message to avoid duplication
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      } else {
        await addNewChat(message);
      }
    }
  };

  const addNewChat = async (message) => {
    const newChatId = (chats.length + 1).toString();
    const response = await apiClient.createChat(message, `Chat ${newChatId}`);
    const newChat = { id: response.conversationid, title: `Chat ${newChatId}` };
    setChats([...chats, newChat]);
    setActiveChat(response.conversationid);

    // Ensure the user's message is displayed immediately
    setMessages([{ role: 'user', content: message }]);

    // Fetch the assistant's response and append it
    const assistantResponse = await apiClient.getMessages(response.conversationid);
    const assistantMessage = assistantResponse.messages[1]; // Get the assistant's reply
    setMessages((prevMessages) => [...prevMessages, assistantMessage]);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 bg-gray-900 p-2 shadow-lg backdrop-blur-md overflow-hidden ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } flex flex-col`}
      >
        {/* Noctua Title/Logo and Toggle Button */}
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
          isSidebarCollapsed={isSidebarCollapsed} // Corrected prop name
        />
        {/* Sign-Out Button */}
        <div className="mt-4">
          <button
            onClick={() => signOut()}
            className={`hover:text-red-500 text-gray-300 p-2 rounded-lg transition-colors duration-300 w-full flex items-center ${
              isSidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <FaSignOutAlt size={20} />
            {!isSidebarCollapsed && <span className="ml-2">Sign Out</span>}
          </button>
        </div>
      </div>
      {/* Chat Window */}
      <div className="flex-1 bg-gray-900 p-4">
        <ChatWindow messages={messages} sendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
