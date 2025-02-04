import { useState, useEffect } from 'react';
import ReactMarkdown from "react-markdown";
import { FaPaperPlane, FaPaperclip, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function ChatWindow({ messages, sendMessage }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (message.trim()) {
      setLoading(true);
      const currentMessage = message; // Store the message before clearing the input
      setMessage(''); // Clear the input field immediately
      await sendMessage(currentMessage); // Call the sendMessage function with the stored message
      setLoading(false);
    }
  };

  useEffect(() => {
    const chatMessagesContainer = document.querySelector('.chatMessages');
    if (chatMessagesContainer) {
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
  }, [messages]);

  const renderReferences = (content) => {
    const referenceRegex = /<(.+?)\|(.+?)>/g;
    const unwantedTextRegex = /(\*\*|\*|\bReferences\b|pages:|,)+/gi;
    const matches = [...content.matchAll(referenceRegex)];

    let contentWithoutReferences = content
      .replace(referenceRegex, '')
      .replace(unwantedTextRegex, '')
      .replace(/,\s*,/g, '')
      .replace(/^\s*,|,\s*$/g, '')
      .trim();

    if (matches.length === 0) return { contentWithoutReferences, references: null };

    const references = (
      <div className="flex flex-wrap space-x-2 mt-2">
        {matches.map((match, index) => {
          const [_, url, label] = match;

          return (
            <div key={index} className="relative group inline-block">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-6 h-6 bg-gray-600 text-white text-sm font-bold rounded-full cursor-pointer hover:bg-blue-500 transition-colors"
              >
                {index + 1}
              </a>
              <div
                className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-md p-2 mt-2 z-10 w-max max-w-sm shadow-lg"
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>
    );

    return { contentWithoutReferences, references };
  };

  return (
    <div className="relative bg-gray-900 text-white h-full p-4 flex flex-col">
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

      {messages.length > 0 && (
        <div className="chatMessages overflow-y-auto flex-grow space-y-6 pt-4">
          {messages.map((msg, index) => {
            const { contentWithoutReferences, references } = renderReferences(msg.content);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: msg.role === 'user' ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-4 max-w-[75%] rounded-xl shadow-md ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white ml-auto rounded-br-none'
                    : 'bg-gray-700 text-white mr-auto rounded-bl-none'
                }`}
              >
                <ReactMarkdown className="text-base leading-relaxed text-gray-100">{contentWithoutReferences}</ReactMarkdown>
                {references}
                {msg.role === 'assistant' && (
                  <FeedbackButtons messageId={index} /> // Add feedback buttons for assistant messages
                )}
                {msg.images && msg.images.length > 0 && (
                  <div className="space-y-6 mt-4">
                    {msg.images.map((img, idx) => (
                      <div key={idx} className="overflow-hidden rounded-lg shadow-md border border-gray-700">
                        <img
                          src={img.image_url}
                          alt="Chat Image"
                          className="w-full h-auto object-cover"
                        />
                        {img.title?.text && (
                          <div className="p-3 bg-gray-800 text-center text-sm">
                            <ReactMarkdown className="text-gray-300">{img.title.text}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
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

      <div className="chatInputContainer flex mt-4">
        <input
          type="file"
          accept="*/*"
          className="hidden"
          id="fileInput"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              console.log("File selected:", file);
            }
          }}
        />
        <label htmlFor="fileInput" className="flex items-center justify-center p-3 bg-gray-800 text-white rounded-full cursor-pointer hover:bg-blue-500 transition duration-300 mr-2">
          <FaPaperclip size={20} /> {/* Paperclip icon */}
        </label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend(); // Call handleSend to send the message
            }
          }}
          placeholder="Type a message..."
          className="flex-1 p-3 bg-gray-800 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          className={`ml-2 p-3 text-white rounded-full flex items-center bg-blue-600 hover:bg-blue-700 transition duration-300 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          <FaPaperPlane size={20} />
        </button>
      </div>
      <p className="text-gray-500 text-xs mt-1 text-center">AI can make mistakes, for reference only.</p>
    </div>
  );
}

// FeedbackButtons Component
function FeedbackButtons({ messageId }) {
  const [feedback, setFeedback] = useState(null); // Local state for feedback (up, down, or null)

  const handleFeedback = (type) => {
    setFeedback(type); // Set feedback state
    console.log(`Feedback for message ${messageId}: ${type}`);
    // Here you can implement the logic to send feedback to the server
  };

  return (
    <div className="flex justify-end mt-2">
      <button
        onClick={() => handleFeedback('up')}
        className={`p-2 rounded-full transition duration-300 transform hover:scale-110 ${
          feedback === 'up'
            ? 'text-green-500 hover:text-green-600'
            : 'text-gray-400 hover:text-gray-500'
        }`}
      >
        <FaThumbsUp />
      </button>
      <button
        onClick={() => handleFeedback('down')}
        className={`p-2 rounded-full ml-2 transition duration-300 transform hover:scale-110 ${
          feedback === 'down'
            ? 'text-red-500 hover:text-red-600'
            : 'text-gray-400 hover:text-gray-500'
        }`}
      >
        <FaThumbsDown />
      </button>
    </div>
  );
}