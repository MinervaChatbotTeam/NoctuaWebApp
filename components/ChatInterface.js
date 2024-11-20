import { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { loadMessages, sendMessage } from '../utils/api';
import styles from '../styles/Home.module.css';
import { signOut } from 'next-auth/react';
import apiClient from '@/ApiClient';

export default function ChatInterface() {
  const [activeChat, setActiveChat] = useState(null);  // Default to Chat 1
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);


  // Load messages for the active chat
  useEffect(() => {
    
    const getChats = async () => {
      const response = await (apiClient.getAllConversations(activeChat));
      setChats(response.conversations.map((chat,index)=>({id:chat.conversation_id, title: index})));
    };
    
    getChats();
  }, []);

  // Load messages for the active chat
  useEffect(() => {
    if (activeChat){
    const fetchMessages = async () => {
      const chatMessages = await apiClient.getMessages(activeChat);
      setMessages(chatMessages.messages);
    };
    
    fetchMessages();
  }
  }, [activeChat]);

  // Function to handle sending a message
  const handleSendMessage = async (message) => {
    if (message.trim() === '') return;  // Do nothing if the message is only whitespace
    const updatedMessages = await apiClient.sendMessage(activeChat, message);
    setMessages(updatedMessages);  // Update the messages in the current chat
  };

  // Add a new chat
  const addNewChat = async () => {
    const newChatId = (chats.length + 1).toString();
    const response = await (apiClient.createChat("Hey let's start", "Temp"))
    
    const newChat = { id: response.conversationid, title: `Chat ${newChatId}` };
    setChats([...chats, newChat]);  // Add the new chat to the list
    setActiveChat(response.conversationid);       // Switch to the new chat
  };

  return (
    <div className={styles.chatContainer}>
      <button
            onClick={() => signOut()}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition duration-300 ease-in-out absolute right-0 top-1"
          >
            Sign out
      </button>
      <ChatList 
        chats={chats} 
        setActiveChat={setActiveChat} 
        addNewChat={addNewChat} 
      />
      <ChatWindow
        messages={messages}
        sendMessage={handleSendMessage}
      />
    </div>
  );
}
