import axios from 'axios';

const API_BASE_URL = '/api';

const apiClient = {
  /**
   * Create a new chat conversation.
   * @returns {Promise<object>} Response data containing the new chat details.
   */
  createChat: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/chat/createChat`);
      return response.data;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Fetch conversation by ID.
   * @param {string} conversationId - The ID of the conversation to fetch.
   * @returns {Promise<object>} The conversation data.
   */
  getConversationById: async (conversationId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/getConversationById`, {
        params: { conversationid: conversationId },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Fetch the latest conversations.
   * @returns {Promise<object[]>} List of the latest conversations.
   */
  getLatestConversations: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/getLatestConversations`);
      return response.data.users; // Adjust according to the API response format.
    } catch (error) {
      console.error('Error fetching latest conversations:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Fetch messages for a specific chat.
   * @param {string} chatId - The ID of the chat to fetch messages for.
   * @returns {Promise<object[]>} List of messages for the chat.
   */
  getMessages: async (chatId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/getMessages`, {
        params: { chatId },
      });
      return response.data.messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Send a message in a specific chat and receive a response.
   * @param {string} chatId - The ID of the chat to send the message to.
   * @param {string} message - The message content to send.
   * @returns {Promise<object[]>} Updated list of messages including the AI's response.
   */
  sendMessage: async (chatId, message) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/chat/sendMessages`, {
        chatId,
        message,
      });
      return response.data.messages;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error.response?.data || error;
    }
  },
};

export default apiClient;
