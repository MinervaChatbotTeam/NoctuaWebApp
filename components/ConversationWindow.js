import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  FaThumbsUp,
  FaThumbsDown,
  FaRegCopy,
  FaRobot,
  FaUser,
  FaHourglassHalf
} from 'react-icons/fa';
import ReactMarkdown from "react-markdown";
import AiInput from './ui/ai-input'; 
import { Card, CardContent } from './ui/card.jsx';

export default function ConversationWindow({ messages, sendMessage, loading, processingQueue }) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [feedbackStates, setFeedbackStates] = useState({});

  const handleSend = async () => {
    if (message.trim()) {
      setIsLoading(true);
      const currentMessage = message;
      setMessage('');
      await sendMessage(currentMessage, selectedFile);
      setSelectedFile(null);
      setIsLoading(false);
    }
  };

  const handleFileChange = (file) => {
    setSelectedFile(file);
  };

  const handleMessageFeedback = (messageId, type) => {
    setFeedbackStates(prev => ({
      ...prev,
      [messageId]: type === prev[messageId] ? null : type // Toggle if same button is clicked
    }));
    console.log(`Feedback for message ${messageId}: ${type}`);
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

    if (matches.length === 0) {
      return { contentWithoutReferences, references: null };
    }

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
                className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full cursor-pointer hover:bg-blue-500 transition-colors border border-white/20"
              >
                {index + 1}
              </a>
              <div
                className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-md p-2 mt-2 z-10 w-max max-w-sm shadow-lg border border-white/10"
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

  const FeedbackButtons = ({ messageId }) => {
    return (
      <>
        <button
          onClick={() => handleMessageFeedback(messageId, 'up')}
          className={`p-1 rounded-full transition duration-300 border ${
            feedbackStates[messageId] === 'up'
              ? 'text-green-400 border-green-400/30 bg-green-400/5'
              : 'text-gray-400 border-white/5 hover:border-white/10 hover:bg-gray-700/20 hover:text-gray-300'
          }`}
          title="Thumbs up"
        >
          <FaThumbsUp className="text-xs" />
        </button>
        
        <button
          onClick={() => handleMessageFeedback(messageId, 'down')}
          className={`p-1 rounded-full transition duration-300 border ${
            feedbackStates[messageId] === 'down'
              ? 'text-red-400 border-red-400/30 bg-red-400/5'
              : 'text-gray-400 border-white/5 hover:border-white/10 hover:bg-gray-700/20 hover:text-gray-300'
          }`}
          title="Thumbs down"
        >
          <FaThumbsDown className="text-xs" />
        </button>
      </>
    );
  };

  const renderTypingIndicator = () => {
    // Check if this message is in queue or actively being processed
    const inQueue = processingQueue && !loading;
    
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-11/12 sm:w-4/5 mx-auto mt-4"
      >
        <Card className="bg-gray-800/30 border-white/10 backdrop-blur-sm p-2 rounded-lg">
          <CardContent className="p-3">
            <div className="flex items-center space-x-3 text-blue-300">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-full shadow-md border border-white/10">
                <FaRobot className="text-white text-xs" />
              </div>
              
              {inQueue ? (
                <div className="flex items-center space-x-2">
                  <FaHourglassHalf className="text-yellow-400 animate-pulse" />
                  <span className="text-sm font-light">In queue...</span>
                </div>
              ) : (
                <>
                  <div className="flex space-x-1.5">
                    <motion.div
                      className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full shadow-sm"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full shadow-sm"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full shadow-sm"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                    />
                  </div>
                  <span className="text-sm font-light">Noctua is thinking...</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Determine if a message is temporary (waiting to be sent)
  const hasTempMessages = messages.some(m => m.isTemp);
  // Show indicator when other chats are processing but current one isn't
  const otherChatsProcessing = processingQueue && !loading;

  return (
    <div className="relative bg-gray-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-black text-white h-full p-4 flex flex-col">
      {/* Background processing indicator */}
      {otherChatsProcessing && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gray-800/70 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-500/30 shadow-md">
            <div className="flex items-center space-x-2">
              <FaHourglassHalf className="text-yellow-400 animate-pulse" size={10} />
              <span className="text-xs text-gray-300">Processing in background...</span>
            </div>
          </div>
        </div>
      )}
      
      {/* If no messages yet, show splash screen */}
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center flex-grow"
        >
          <div className="text-4xl font-bold text-blue-400 mb-4">Ask Noctua!</div>
          <div className="text-lg text-gray-300 mb-6">
            Examples: "Explain algorithms", "What is AI?"
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mt-4">
            {/* Cards with more subtle styling, no plus variant */}
            <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-white/10 hover:from-blue-900/30 hover:to-purple-900/30 backdrop-blur-sm transition-all cursor-pointer hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] rounded-lg">
              <CardContent>
                <h3 className="text-blue-300 font-medium mb-2">Explain quantum computing</h3>
                <p className="text-gray-300 text-sm">Learn about qubits and quantum states</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-indigo-900/20 to-pink-900/20 border-white/10 hover:from-indigo-900/30 hover:to-pink-900/30 backdrop-blur-sm transition-all cursor-pointer hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] rounded-lg">
              <CardContent>
                <h3 className="text-indigo-300 font-medium mb-2">Write a poem about stars</h3>
                <p className="text-gray-300 text-sm">Get creative with celestial themes</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-white/10 hover:from-cyan-900/30 hover:to-blue-900/30 backdrop-blur-sm transition-all cursor-pointer hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] rounded-lg">
              <CardContent>
                <h3 className="text-cyan-300 font-medium mb-2">Debug my React code</h3>
                <p className="text-gray-300 text-sm">Upload a file for code analysis</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-emerald-900/20 to-blue-900/20 border-white/10 hover:from-emerald-900/30 hover:to-blue-900/30 backdrop-blur-sm transition-all cursor-pointer hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] rounded-lg">
              <CardContent>
                <h3 className="text-emerald-300 font-medium mb-2">Summarize a scientific paper</h3>
                <p className="text-gray-300 text-sm">Get concise explanations of complex topics</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Actual chat messages */}
      {messages.length > 0 && (
        <div className="chatMessages overflow-y-auto flex-grow space-y-6 pt-4 w-full max-w-full">
          {messages.map((msg, index) => {
            const { contentWithoutReferences, references } = msg.content ? renderReferences(msg.content) : { contentWithoutReferences: null, references: null };
            const isUser = msg.role === 'user';

            return (
              <div key={index} className="flex flex-col w-full mb-8">
                {/* Message sender icon */}
                <div className="w-11/12 sm:w-4/5 mx-auto mb-2 flex items-center">
                  <div className={`flex items-center w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="flex items-center space-x-2">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-full shadow-md border border-white/10">
                          <FaRobot className="text-white text-xs" />
                        </div>
                        <span className="text-blue-300 text-xs font-medium">Noctua</span>
                      </div>
                    )}
                    {isUser && (
                      <div className="flex items-center space-x-2">
                        <span className="text-emerald-300 text-xs font-medium">You</span>
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 rounded-full shadow-md border border-white/10">
                          <FaUser className="text-white text-xs" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* The message container with more subtle styling */}
                <motion.div
                  initial={{ opacity: 0, x: isUser ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-11/12 sm:w-4/5 mx-auto"
                >
                  <Card 
                    className={isUser 
                      ? "bg-gradient-to-br from-blue-600/20 via-blue-500/15 to-indigo-600/10 border-white/10 text-white backdrop-blur-md hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-300 rounded-lg w-full" 
                      : "bg-gradient-to-br from-gray-900/20 via-gray-800/15 to-gray-900/10 border-white/10 text-white backdrop-blur-md hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-300 rounded-lg w-full"
                    }
                  >
                    <CardContent className="p-3 sm:p-4 w-full">
                      <div className="relative w-full">
                        <div className="markdown-wrapper w-full">
                          <ReactMarkdown className="text-sm sm:text-base leading-relaxed markdown-content">
                            {contentWithoutReferences || msg.content}
                          </ReactMarkdown>
                        </div>
                        {references}

                        {/* Any images inside the message */}
                        {msg.images && msg.images.length > 0 && (
                          <div className="space-y-6 mt-4 w-full">
                            {msg.images.map((img, idx) => (
                              <div
                                key={idx}
                                className="overflow-hidden rounded-lg shadow-lg border border-white/10 w-full sm:w-4/5 md:w-3/5 mx-auto max-w-full"
                              >
                                <img
                                  src={img.image_url}
                                  alt="Chat Image"
                                  className="w-full h-auto object-contain max-w-full"
                                />
                                {img.title?.text && (
                                  <div className="p-3 bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm text-center text-sm border-t border-white/10">
                                    <ReactMarkdown className="text-gray-300">
                                      {img.title.text}
                                    </ReactMarkdown>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Feedback + Copy for assistant messages, styled better but back in original location */}
                {!isUser && (
                  <div className="w-11/12 sm:w-4/5 mx-auto mt-2 flex justify-end">
                    <div className="flex items-center space-x-1.5 bg-gray-800/30 rounded-full px-2 py-0.5 backdrop-blur-sm">
                      <FeedbackButtons messageId={index} />
                      
                      <button
                        onClick={() => handleCopy(msg.content)}
                        className="p-1 rounded-full transition duration-300 border border-white/5 hover:border-white/10 hover:bg-gray-700/20 text-gray-400 hover:text-gray-300"
                        title="Copy assistant message"
                      >
                        <FaRegCopy className="text-xs" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading indicator */}
          {loading && renderTypingIndicator()}
        </div>
      )}

      {/* New chat input area using AiInput component */}
      <div className="w-full mt-4 relative">
        <AiInput 
          message={message}
          setMessage={setMessage}
          handleSend={handleSend}
          loading={loading || isLoading}
          searchActive={searchActive}
          setSearchActive={setSearchActive}
          onFileChange={handleFileChange}
        />
        <p className="text-gray-300 text-xs mt-1 text-center">
          Noctua can make mistakes, for reference only.
        </p>
      </div>
    </div>
  );
}