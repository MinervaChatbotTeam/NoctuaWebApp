import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function ChatWindow({ messages, sendMessage }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');  // Clear input after sending
    }
  };

  return (
    <div className={styles.chatWindow}>
      <div className={styles.chatMessages}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.role === 'user' ? styles.userMessage : styles.apiMessage}
          >
            {msg.content}
          </div>
        ))}
      </div>
      <div className={styles.chatInputContainer}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className={styles.chatInputField}
        />
        <button onClick={handleSend} className={styles.chatInputButton}>
          Send
        </button>
      </div>
    </div>
  );
}
