import axios from 'axios';

const API_BASE_URL = '/api';

const apiClient = {
  // Add method to get cookies
  getSessionToken: () => {
    // Get the session token from cookies
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find(cookie => 
      cookie.trim().startsWith('next-auth.session-token=')
    );
    return sessionCookie ? sessionCookie.split('=')[1] : null;
  },

  getConversations: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/conversations`, {
        headers: {
          'Cookie': `next-auth.session-token=${apiClient.getSessionToken()}`
        },
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  createConversation: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/conversations`, {}, {
        headers: {
          'Cookie': `next-auth.session-token=${apiClient.getSessionToken()}`
        },
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  },

  sendMessage: async (conversationId, message) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/conversations/${conversationId}/messages`,
        {
          conversationId: conversationId,
          message: message
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `next-auth.session-token=${apiClient.getSessionToken()}`
          },
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  getMessages: async (conversationId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/conversations/${conversationId}/messages`,
        {
          headers: {
            'Cookie': `next-auth.session-token=${apiClient.getSessionToken()}`
          },
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  },

  deleteConversation: async (conversationId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/conversations/${conversationId}`,
        {
          headers: {
            'Cookie': `next-auth.session-token=${apiClient.getSessionToken()}`
          },
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  },

  updateConversationTitle: async (conversationId, message) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/conversations/${conversationId}`,
        {
          message: message
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `next-auth.session-token=${apiClient.getSessionToken()}`
          },
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating conversation title:', error);
      throw error;
    }
  },
};

export default apiClient;