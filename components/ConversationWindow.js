import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  FaGlobe,
  FaPaperPlane,
  FaPaperclip,
  FaRegCopy,
  FaThumbsDown,
  FaThumbsUp,
} from 'react-icons/fa';
import ReactMarkdown from "react-markdown";

export default function ConversationWindow({ messages, sendMessage }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchActive, setSearchActive] = useState(false); // <-- Toggles the search button state

  const handleSend = async () => {
    if (message.trim()) {
      setLoading(true);
      const currentMessage = message;
      setMessage('');
      await sendMessage(currentMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    const chatMessagesContainer = document.querySelector('.chatMessages');
    if (chatMessagesContainer) {
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
  }, [messages]);

  // Copy helper for assistant messages
  const handleCopy = (content) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(content)
        .then(() => console.log('Message copied to clipboard!'))
        .catch((err) => console.error('Failed to copy text:', err));
    }
  };

  const renderUserMessage = (msg, index) => {
    return (
      <div key={index} className="flex flex-col w-full">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-4/5 mx-auto p-4 bg-blue-600 text-white rounded-xl shadow-md"
        >
          <ReactMarkdown className="text-base leading-relaxed text-gray-100">
            {msg.content}
          </ReactMarkdown>
        </motion.div>
      </div>
    );
  };

  const renderAssistantMessage = (msg, index) => {
    // Process resources if they exist
    const resourcesComponent = msg.metadata.resources && msg.metadata.resources.length > 0 ? (
      <div className="flex flex-wrap space-x-2 mt-2">
        {msg.metadata.resources.map((resource, idx) => (
          <div key={idx} className="relative group inline-block">
            <a
              href={resource.source}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-6 h-6 bg-gray-600 text-white text-sm font-bold rounded-full cursor-pointer hover:bg-blue-500 transition-colors"
            >
              {idx + 1}
            </a>
            <div
              className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-md p-2 mt-2 z-10 w-max max-w-sm shadow-lg"
            >
              <div className="font-bold">{resource.title}</div>
              <div className="text-gray-300">{resource.h1} - {resource.h2}</div>
              <div className="mt-1 text-gray-400 text-xs">{resource.text.substring(0, 150)}...</div>
            </div>
          </div>
        ))}
      </div>
    ) : null;

    // Process images if they exist
    const imagesComponent = msg.metadata.images && msg.metadata.images.length > 0 ? (
      <div className="space-y-6 mt-4">
        {msg.metadata.images.map((img, idx) => (
          <div
            key={idx}
            className="overflow-hidden rounded-lg shadow-md border border-gray-700 w-3/5 mx-auto"
          >
            <img
              src={img}
              alt="Chat Image"
              className="w-full h-auto object-cover"
            />
          </div>
        ))}
      </div>
    ) : null;

    return (
      <div key={index} className="flex flex-col w-full">
        {/* The message container */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-4/5 mx-auto p-4 text-white"
        >
          <ReactMarkdown className="text-base leading-relaxed text-gray-100">
            {msg.content}
          </ReactMarkdown>
          {resourcesComponent}
          {imagesComponent}
        </motion.div>

        {/* Feedback + Copy buttons */}
        <div className="w-4/5 mx-auto mt-2 flex justify-end">
          <div
            className="
              flex items-center space-x-1 
              bg-gray-800/70 border border-gray-600 
              text-gray-300 rounded-full px-2 py-1
              backdrop-blur-sm
            "
          >
            <FeedbackButtons messageId={index} />

            {/* Copy button */}
            <button
              onClick={() => handleCopy(msg.content)}
              className="p-1 rounded-full transition duration-300 transform hover:scale-110 hover:text-gray-100"
              title="Copy assistant message"
            >
              <FaRegCopy />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative bg-gray-900 text-white h-full p-4 flex flex-col">
      {/* If no messages yet, show splash screen */}
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center flex-grow"
        >
          <div className="text-4xl font-bold text-blue-400 mb-4">Ask Noctua!</div>
          <div className="text-lg text-gray-500">
            Examples: "Explain algorithms", "What is AI?"
          </div>
        </motion.div>
      )}

      {/* Actual chat messages */}
      {messages.length > 0 && (
        <div className="chatMessages overflow-y-auto flex-grow space-y-6 pt-4">
          {messages.map((msg, index) => {
            return msg.role === 'user' 
              ? renderUserMessage(msg, index)
              : renderAssistantMessage(msg, index);
          })}

          {/* Loading indicator */}
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

      {/* Chat input area - increased height + new search/globe button */}
      <div className="chatInputContainer flex items-center mt-4 space-x-2">
        <div className="flex items-center space-x-2">
          {/* Attachments */}
          <input
            type="file"
            accept="*/*"
            className="hidden"
            id="fileInput"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                console.log('File selected:', file);
              }
            }}
          />
          <label
            htmlFor="fileInput"
            className="flex items-center justify-center p-3 bg-gray-800 text-white rounded-full 
                      cursor-pointer hover:bg-blue-500 transition duration-300"
          >
            <FaPaperclip size={20} />
          </label>

          {/* Search/Globe button */}
          <button
            onClick={() => setSearchActive(!searchActive)}
            className={`
              flex items-center justify-center p-3 rounded-full
              transition duration-300 transform hover:scale-110 
              ${
                searchActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }
            `}
            title="Toggle search mode"
          >
            <FaGlobe size={20} />
          </button>
        </div>

        {/* Text input, made taller and expandable */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { // Allow new lines with Shift + Enter
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="
            flex-1 p-3 bg-gray-800 text-white rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg
            resize-none // Prevent manual resizing
          "
          style={{ minHeight: '2.5rem', maxHeight: '6rem' }} // Adjusted height for 3 lines
          disabled={loading}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          className={`
            p-2 text-white rounded-md flex items-center bg-blue-600
            hover:bg-blue-700 transition duration-300
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          disabled={loading}
        >
          <FaPaperPlane size={20} />
        </button>
      </div>

      <p className="text-gray-500 text-xs mt-1 text-center">
        Noctua can make mistakes, for reference only.
      </p>
    </div>
  );
}

// Feedback buttons remain the same
function FeedbackButtons({ messageId }) {
  const [feedback, setFeedback] = useState(null);

  const handleFeedback = (type) => {
    setFeedback(type);
    console.log(`Feedback for message ${messageId}: ${type}`);
  };

  return (
    <>
      <button
        onClick={() => handleFeedback('up')}
        className={`p-2 rounded-full transition duration-300 transform hover:scale-110 ${
          feedback === 'up'
            ? 'text-green-500 hover:text-green-600'
            : 'text-gray-400 hover:text-gray-500'
        }`}
        title="Thumbs up"
      >
        <FaThumbsUp />
      </button>
      <button
        onClick={() => handleFeedback('down')}
        className={`p-2 rounded-full transition duration-300 transform hover:scale-110 ${
          feedback === 'down'
            ? 'text-red-500 hover:text-red-600'
            : 'text-gray-400 hover:text-gray-500'
        }`}
        title="Thumbs down"
      >
        <FaThumbsDown />
      </button>
    </>
  );
}
