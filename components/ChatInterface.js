import { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { loadMessages, sendMessage } from '../utils/api';
import styles from '../styles/Home.module.css';
import { signOut } from 'next-auth/react';

export default function ChatInterface() {
  const [activeChat, setActiveChat] = useState('chat1');  // Default to Chat 1
  const [chats, setChats] = useState([{ id: '1', title: 'Chat 1' }, { id: '2', title: 'Chat 2' }]);
  const [messages, setMessages] = useState([]);

  // Load messages for the active chat
  useEffect(() => {
    const fetchMessages = async () => {
      const chatMessages = await loadMessages(activeChat);
      setMessages(chatMessages);
    };
    fetchMessages();
  }, [activeChat]);

  // Function to handle sending a message
  const handleSendMessage = async (message) => {
    if (message.trim() === '') return;  // Do nothing if the message is only whitespace
    const updatedMessages = await sendMessage(activeChat, message);
    setMessages(updatedMessages);  // Update the messages in the current chat
  };

  // Add a new chat
  const addNewChat = () => {
    const newChatId = (chats.length + 1).toString();
    const newChat = { id: newChatId, title: `Chat ${newChatId}` };
    setChats([...chats, newChat]);  // Add the new chat to the list
    setActiveChat(newChatId);       // Switch to the new chat
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
