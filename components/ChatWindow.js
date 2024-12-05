// ChatWindow.js
import { useState, useEffect } from 'react';
import ReactMarkdown from "react-markdown";
import { FaPaperPlane } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function ChatWindow({ messages, sendMessage }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (message.trim()) {
      setLoading(true);
      await sendMessage(message);
      setMessage('');
      setLoading(false);
    }
  };

  useEffect(() => {
    const chatMessagesContainer = document.querySelector('.chatMessages');
    if (chatMessagesContainer) {
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="relative bg-gray-900 text-white h-full p-4 flex flex-col">
      {/* Header and Examples */}
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center flex-grow"
        >
          <div className="text-4xl font-bold text-blue-400 mb-4">Ask Noctua!</div>
          <div className="text-lg text-gray-500">Examples: "Explain algorithms", "What is AI?"</div>
        </motion.div>
      )}

      {/* Chat Messages */}
      {messages.length > 0 && (
        <div className="chatMessages overflow-y-auto flex-grow space-y-4 pt-4">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: msg.role === 'user' ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-3 max-w-[75%] rounded-xl shadow-md ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white ml-auto rounded-br-none'
                  : 'bg-gray-700 text-white mr-auto rounded-bl-none'
              }`}
            > 
              <ReactMarkdown>{msg.content}</ReactMarkdown>
              {/* Showing images*/}
              {(msg.images&&msg.images.length>0)&&msg.images.map((img)=>
              <div className='p-2'>
                <img src={img.image_url}/>
                <ReactMarkdown>{img.title.text}</ReactMarkdown>
              </div>
              )}
            </motion.div>
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-blue-400 text-lg italic"
            >
              Noctua is thinking...
            </motion.div>
          )}
        </div>
      )}

      {/* Chat Input */}
      <div className="chatInputContainer flex mt-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 p-3 bg-gray-800 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          className={`ml-2 p-3 text-white rounded-full flex items-center hover:text-blue-500 transition duration-300 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          <FaPaperPlane size={20} />
        </button>
      </div>
    </div>
  );
}
