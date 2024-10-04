import { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { loadMessages, sendMessage } from '../utils/api';
import styles from '../styles/Home.module.css';

export default function ChatInterface() {
  const [activeChat, setActiveChat] = useState('1');  // Default to Chat 1
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
