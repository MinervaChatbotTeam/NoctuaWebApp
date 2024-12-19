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
      console.log("Sending a message ...", await sendMessage(message));
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
