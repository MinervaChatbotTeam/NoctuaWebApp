import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import { FaBug, FaChevronLeft, FaChevronRight, FaQuestionCircle, FaSignOutAlt } from 'react-icons/fa';
import { GiOwl } from 'react-icons/gi';
import apiClient from '../ApiClient';
import ConversationList from './ConversationList';
import ConversationWindow from './ConversationWindow';

export default function ConversationInterface() {
  const [activeConversation, setActiveConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isInstructionsModalOpen, setInstructionsModalOpen] = useState(false);
  const [bugTitle, setBugTitle] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [bugImage, setBugImage] = useState(null);
  
  // Updated loading state - now specific to different operations
  const [isLoading, setIsLoading] = useState({
    conversations: false,     // Loading conversations list
    messages: false,          // Loading messages for a conversation
    processing: false         // Processing a message (AI responding)
  });
  
  // Keep track of which conversation is currently being processed
  const [processingConversationId, setProcessingConversationId] = useState(null);
  
  // Message queue for handling multiple messages
  const messageQueue = useRef([]);
  const isProcessingQueue = useRef(false);
  
  // Store temporary messages per conversation
  const [tempMessages, setTempMessages] = useState({});
  
  // Track which conversations have messages in the queue
  const getQueuedConversationIds = () => {
    return messageQueue.current.map(item => item.conversationId);
  };
  
  const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

  const getConversations = async () => {
    setIsLoading(prev => ({ ...prev, conversations: true }));
    try {
      const response = await apiClient.getConversations();
      if (response.conversations) {
        // Get the list of queued conversation IDs
        const queuedConversationIds = getQueuedConversationIds();
        
        setConversations(
          response.conversations
            .map((conversation) => {
              const lastMessageTimestamp = conversation.messages && conversation.messages.length > 0 
                ? conversation.messages.reduce((latest, message) => {
                    const messageTime = new Date(message.timestamp).getTime();
                    return messageTime > latest ? messageTime : latest;
                  }, 0)
                : new Date(conversation.updated_at).getTime();

              return {
                id: conversation.id,
                title: conversation.title || `Conversation ${conversation.id}`,
                lastMessageTimestamp,
                isProcessing: conversation.id === processingConversationId,
                inQueue: queuedConversationIds.includes(conversation.id) && conversation.id !== processingConversationId
              };
            })
            .sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp)
        );
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, conversations: false }));
    }
  };

  useEffect(() => {
    getConversations();
  }, [processingConversationId]); // Update when processing state changes

  useEffect(() => {
    if (activeConversation) {
      const fetchMessages = async () => {
        setIsLoading(prev => ({ ...prev, messages: true }));
        try {
          const response = await apiClient.getMessages(activeConversation);
          // Combine fetched messages with any temporary messages for this conversation
          const fetchedMessages = response.messages || [];
          const conversationTempMessages = tempMessages[activeConversation] || [];
          
          setMessages([...fetchedMessages, ...conversationTempMessages]);
        } catch (error) {
          console.error('Error fetching messages:', error);
          // If there's an error, still show temp messages if available
          const conversationTempMessages = tempMessages[activeConversation] || [];
          if (conversationTempMessages.length > 0) {
            setMessages(conversationTempMessages);
          }
        } finally {
          setIsLoading(prev => ({ ...prev, messages: false }));
        }
      };
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [activeConversation, tempMessages]);

  // Function to process the next message in the queue
  const processNextInQueue = async () => {
    if (messageQueue.current.length === 0 || isProcessingQueue.current) {
      return;
    }

    isProcessingQueue.current = true;
    const { conversationId, message, file, tempMessageId } = messageQueue.current[0];
    
    try {
      setProcessingConversationId(conversationId);
      setIsLoading(prev => ({ ...prev, processing: true }));
      
      // Process the message
      const assistantMessage = await apiClient.sendMessage(conversationId, message, file);
      
      if (assistantMessage.error !== undefined) {
        alert("Error happened while sending the message");
        messageQueue.current.shift(); // Remove the failed message
        
        // Remove the temporary message
        setTempMessages(prev => {
          const newTempMessages = { ...prev };
          if (newTempMessages[conversationId]) {
            newTempMessages[conversationId] = newTempMessages[conversationId].filter(
              msg => msg.id !== tempMessageId
            );
            if (newTempMessages[conversationId].length === 0) {
              delete newTempMessages[conversationId];
            }
          }
          return newTempMessages;
        });
        
        if (messageQueue.current.length > 0) {
          processNextInQueue();
        }
        return;
      }
      
      // Only update messages UI if the user is still viewing this conversation
      if (activeConversation === conversationId) {
        setMessages(prevMessages => {
          // Filter out the temporary message
          const filteredMessages = prevMessages.filter(m => m.id !== tempMessageId);
          return [...filteredMessages, assistantMessage];
        });
      }
      
      // Remove the temporary message from storage
      setTempMessages(prev => {
        const newTempMessages = { ...prev };
        if (newTempMessages[conversationId]) {
          newTempMessages[conversationId] = newTempMessages[conversationId].filter(
            msg => msg.id !== tempMessageId
          );
          if (newTempMessages[conversationId].length === 0) {
            delete newTempMessages[conversationId];
          }
        }
        return newTempMessages;
      });
      
      // Update conversation title if needed
      if (messageQueue.current[0].isFirstMessage) {
        await apiClient.updateConversationTitle(conversationId, message);
      }
      
      // Remove the processed message from the queue
      messageQueue.current.shift();
      
      // Refresh the conversation list
      getConversations();
      
    } catch (error) {
      console.error('Error processing message:', error);
      alert("Error happened while processing the message");
      
      // Remove the temporary message
      setTempMessages(prev => {
        const newTempMessages = { ...prev };
        if (newTempMessages[conversationId]) {
          newTempMessages[conversationId] = newTempMessages[conversationId].filter(
            msg => msg.id !== tempMessageId
          );
          if (newTempMessages[conversationId].length === 0) {
            delete newTempMessages[conversationId];
          }
        }
        return newTempMessages;
      });
      
      messageQueue.current.shift(); // Remove the failed message
    } finally {
      setIsLoading(prev => ({ ...prev, processing: false }));
      setProcessingConversationId(null);
      isProcessingQueue.current = false;
      
      // Process the next message if any
      if (messageQueue.current.length > 0) {
        processNextInQueue();
      }
    }
  };

  // Add message to queue and start processing if not already doing so
  const queueMessage = (conversationId, message, file = null, isFirstMessage = false) => {
    const tempMessageId = `temp-${Date.now()}`;
    
    // Create a temporary message
    const tempMessage = { 
      id: tempMessageId,
      role: 'user', 
      content: message, 
      timestamp: new Date().toISOString(),
      isTemp: true
    };
    
    // Store the temporary message in our persistent state
    setTempMessages(prev => {
      const newTempMessages = { ...prev };
      if (!newTempMessages[conversationId]) {
        newTempMessages[conversationId] = [];
      }
      newTempMessages[conversationId] = [...newTempMessages[conversationId], tempMessage];
      return newTempMessages;
    });
    
    // If this is the active conversation, update the UI immediately
    if (activeConversation === conversationId) {
      setMessages(prevMessages => [...prevMessages, tempMessage]);
    }
    
    // Add to queue
    messageQueue.current.push({
      conversationId,
      message,
      file,
      isFirstMessage,
      tempMessageId
    });
    
    // Update conversation list to reflect queue status
    getConversations();
    
    // Start processing if not already doing so
    if (!isProcessingQueue.current) {
      processNextInQueue();
    }
  };

  const handleSendMessage = async (message, file = null) => {
    if (!message.trim()) return;
    
    if (activeConversation) {
      // Send message to existing conversation
      const currentMessages = messages.length;
      queueMessage(activeConversation, message, file, currentMessages === 0);
    } else {
      // Create a new conversation first
      try {
        setIsLoading(prev => ({ ...prev, conversations: true }));
        const conversationResponse = await apiClient.createConversation();
        const newConversationId = conversationResponse.conversationId;
        
        // Set as active conversation
        setActiveConversation(newConversationId);
        
        // Queue the message
        queueMessage(newConversationId, message, file, true);
      } catch (error) {
        console.error('Error creating conversation:', error);
        alert("Error happened while creating a new conversation");
      } finally {
        setIsLoading(prev => ({ ...prev, conversations: false }));
      }
    }
  };

  const handleBugReportSubmit = () => {
    console.log(bugTitle, bugDescription, bugImage);
    // Here you would typically send the bug report to your backend
    setModalOpen(false);
    setBugTitle('');
    setBugDescription('');
    setBugImage(null);
  };

  const handleOpenInstructions = () => setInstructionsModalOpen(true);
  const handleCloseInstructions = () => setInstructionsModalOpen(false);

  // Animation variants
  const sidebarVariants = {
    expanded: { width: '16rem' }, // 64px in tailwind
    collapsed: { width: '4.5rem' }   // Slightly smaller to prevent overflow issues
  };

  const buttonVariants = {
    hover: { backgroundColor: 'rgba(255, 255, 255, 0.1)', scale: 1.05 },
    tap: { scale: 0.95 }
  };

  // Loading state derived from different loading states
  const loading = isLoading.conversations || isLoading.messages || isLoading.processing;

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {/* Sidebar with smooth animations */}
      <motion.div 
        variants={sidebarVariants}
        initial="expanded"
        animate={isSidebarCollapsed ? "collapsed" : "expanded"}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-gradient-to-b from-gray-900 to-gray-950 p-2 shadow-lg backdrop-blur-md overflow-hidden border-r border-white/10 flex flex-col flex-shrink-0"
      >
        {/* Improved Sidebar header - border removed from toggle button when collapsed */}
        <div className="flex items-center justify-between mb-4 p-2 bg-gradient-to-r from-blue-900/20 to-gray-900 rounded-lg border border-white/5">
          <motion.div 
            className="flex items-center"
            initial={false}
            animate={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}
          >
            {isSidebarCollapsed ? (
              <GiOwl size={24} className="text-blue-400" />
            ) : (
              <div className="flex items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-full blur-sm opacity-30"></div>
                  <GiOwl size={28} className="text-blue-400 relative z-10 mr-2" />
                </div>
                <span className="text-xl font-bold text-white">Noctua</span>
              </div>
            )}
          </motion.div>
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={toggleSidebar}
            className={`hover:text-blue-400 text-gray-300 p-1 rounded-lg transition-colors duration-300 
              ${isSidebarCollapsed ? 'bg-gray-800/30' : 'border border-white/5 bg-gray-800/30'}`}
          >
            {isSidebarCollapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
          </motion.button>
        </div>
        {/* Conversation list */}
        <div className="flex-1 overflow-hidden">
          <ConversationList
            conversations={conversations}
            setActiveConversation={setActiveConversation}
            addNewConversation={() => setActiveConversation(null)}
            getConversations={getConversations}
            isSidebarCollapsed={isSidebarCollapsed}
            processingConversationId={processingConversationId}
            queueLength={messageQueue.current.length}
          />
        </div>
        
        {/* Bottom sidebar buttons - removed gradient background */}
        <motion.div 
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 1 }}
          className="mt-auto border-t border-white/5 pt-4 pb-2"
        >
          {/* Bug Report Button */}
          <motion.button 
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => setModalOpen(true)} 
            className={`hover:bg-gray-800/70 text-gray-300 p-2 rounded-lg transition-all duration-200 w-full flex items-center mb-2 
              ${isSidebarCollapsed ? 'justify-center' : 'border border-white/5'}`}
          >
            <FaBug size={isSidebarCollapsed ? 14 : 16} className={isSidebarCollapsed ? '' : 'mr-2'} />
            {!isSidebarCollapsed && <span className="text-sm">Report Issue</span>}
          </motion.button>
          
          {/* How-to Button */}
          <motion.button 
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleOpenInstructions} 
            className={`hover:bg-gray-800/70 text-gray-300 p-2 rounded-lg transition-all duration-200 w-full flex items-center mb-2 
              ${isSidebarCollapsed ? 'justify-center' : 'border border-white/5'}`}
          >
            <FaQuestionCircle size={isSidebarCollapsed ? 14 : 16} className={isSidebarCollapsed ? '' : 'mr-2'} />
            {!isSidebarCollapsed && <span className="text-sm">How to Use</span>}
          </motion.button>
          
          {/* Sign-Out Button */}
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => signOut()}
            className={`hover:bg-gray-800/70 text-gray-300 p-2 rounded-lg transition-all duration-200 w-full flex items-center 
              ${isSidebarCollapsed ? 'justify-center' : 'border border-white/5'}`}
          >
            <FaSignOutAlt size={isSidebarCollapsed ? 14 : 16} className={isSidebarCollapsed ? '' : 'mr-2'} />
            {!isSidebarCollapsed && <span className="text-sm">Sign Out</span>}
          </motion.button>
        </motion.div>
      </motion.div>
      
      {/* Main content */}
      <div className="flex-1 bg-gradient-to-b from-gray-900 via-gray-900 to-black">
        <ConversationWindow 
          messages={messages} 
          sendMessage={handleSendMessage} 
          loading={isLoading.processing && processingConversationId === activeConversation}
          processingQueue={messageQueue.current.length > 0}
        />
      </div>
      
      {/* Bug Report Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-lg shadow-xl border border-white/10 text-white max-w-md w-full"
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <h2 className="text-xl font-bold mb-4 text-blue-300 flex items-center">
                <FaBug className="mr-2" /> Report an Issue
              </h2>
              <input
                type="text"
                className="w-full p-2 border border-white/10 rounded-lg mb-4 bg-gray-800/70 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
                placeholder="Issue Title"
                value={bugTitle}
                onChange={(e) => setBugTitle(e.target.value)}
              />
              <textarea
                className="w-full p-2 border border-white/10 rounded-lg mb-4 bg-gray-800/70 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30 min-h-[120px]"
                placeholder="Describe the issue/bug..."
                value={bugDescription}
                onChange={(e) => setBugDescription(e.target.value)}
              />
              <div className="mb-4">
                <label className="block text-gray-300 mb-2 text-sm">Upload Screenshot (optional)</label>
                <div className="border border-dashed border-white/20 rounded-lg p-4 bg-gray-800/30">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBugImage(e.target.files[0])}
                    className="text-gray-300 w-full text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <motion.button 
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setModalOpen(false)} 
                  className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-gray-600 border border-white/10"
                >
                  Cancel
                </motion.button>
                <motion.button 
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleBugReportSubmit} 
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:from-blue-500 hover:to-blue-400 shadow-md"
                >
                  Submit Report
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Instructions Modal */}
      <AnimatePresence>
        {isInstructionsModalOpen && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-lg shadow-xl border border-white/10 text-white max-w-md w-full"
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <h2 className="text-xl font-bold mb-4 text-blue-300 flex items-center">
                <FaQuestionCircle className="mr-2" /> How to Use Noctua
              </h2>
              <div className="space-y-3 mb-6 text-gray-300">
                <div className="flex items-start p-2 rounded-lg bg-gray-800/50 border border-white/5">
                  <div className="bg-blue-500/20 p-1.5 rounded-md flex-shrink-0 mr-3">
                    <span className="text-blue-400">1</span>
                  </div>
                  <p>Type your question in the chat box and press Enter to send</p>
                </div>
                <div className="flex items-start p-2 rounded-lg bg-gray-800/50 border border-white/5">
                  <div className="bg-blue-500/20 p-1.5 rounded-md flex-shrink-0 mr-3">
                    <span className="text-blue-400">2</span>
                  </div>
                  <p>Create a new chat by clicking the "+" button in the sidebar</p>
                </div>
                <div className="flex items-start p-2 rounded-lg bg-gray-800/50 border border-white/5">
                  <div className="bg-blue-500/20 p-1.5 rounded-md flex-shrink-0 mr-3">
                    <span className="text-blue-400">3</span>
                  </div>
                  <p>Switch between different conversations using the sidebar</p>
                </div>
                <div className="flex items-start p-2 rounded-lg bg-gray-800/50 border border-white/5">
                  <div className="bg-blue-500/20 p-1.5 rounded-md flex-shrink-0 mr-3">
                    <span className="text-blue-400">4</span>
                  </div>
                  <p>You can provide feedback on Noctua's responses with the thumbs up/down buttons</p>
                </div>
                <div className="flex items-start p-2 rounded-lg bg-gray-800/50 border border-white/5">
                  <div className="bg-blue-500/20 p-1.5 rounded-md flex-shrink-0 mr-3">
                    <span className="text-blue-400">5</span>
                  </div>
                  <p>Click the copy button to copy any response to your clipboard</p>
                </div>
              </div>
              <div className="flex justify-end">
                <motion.button 
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleCloseInstructions} 
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:from-blue-500 hover:to-blue-400 shadow-md"
                >
                  Got it
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}