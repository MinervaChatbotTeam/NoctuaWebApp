import axios from 'axios';

const API_BASE_URL = '/api';

const apiClient = {

  createConversation: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/conversations`, {});
      return response.data;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  },

  getConversations: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/conversations/?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  },

  deleteConversation: async (conversationId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  },

  sendMessage: async (conversationId, message) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
        conversationid: conversationId,
        message: message
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  getMessages: async (conversationId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/conversations/${conversationId}/messages`);
      return response.data;
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  },
  
};

export default apiClient;
