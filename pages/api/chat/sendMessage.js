import { db } from '../../../database/firebase';
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore"; 
import { chat_completer } from "../utils";  

if (!global.chatHistories) {
  global.chatHistories = {};
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { chatId, message } = req.body;

    // Ensure chatId and message are valid
    if (!chatId || !message) {
      return res.status(400).json({ error: "chatId and message are required" });
    }

    const userMessage = { 
      content: message, 
      role: 'user', 
      timestamp: new Date().toISOString()  // Add timestamp here (for Firebase, not for API)
    };

    try {
      // Reference to the conversation document in Firestore
      const docRef = doc(db, "Conversations", chatId);

      // Check if chat history exists in Firebase
      const chatHistorySnap = await getDoc(docRef);
      let chatHistory = [];

      if (chatHistorySnap.exists()) {
        chatHistory = chatHistorySnap.data().messages;
      }

      // Add user's message to the chat history
      chatHistory.push(userMessage);

      // Store the updated chat history in the global cache
      if (!global.chatHistories[chatId]) {
        global.chatHistories[chatId] = [];
      }
      global.chatHistories[chatId].push(userMessage);

      // Update Firebase with the user's message (includes timestamp for local use)
      await updateDoc(docRef, {
        messages: arrayUnion({
          content: userMessage.content,
          role: userMessage.role,
          timestamp: userMessage.timestamp  // This timestamp is for Firebase, not the API
        }),
      });

      // Call the chat_completer function to get AI response
      const aiResponse = await chat_completer(global.chatHistories[chatId]);

      const apiMessage = {
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date().toISOString()  // Add timestamp for AI response (for Firebase)
      };

      // Add AI response to global chat history and Firebase
      global.chatHistories[chatId].push(apiMessage);
      await updateDoc(docRef, {
        messages: arrayUnion(apiMessage),
      });

      // Return the updated chat history
      return res.status(200).json({ messages: global.chatHistories[chatId] });
    } catch (error) {
      console.error('Error handling the conversation:', error.message);
      return res.status(500).json({ error: "Failed to complete the chat. Please try again later." });
    }

  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
