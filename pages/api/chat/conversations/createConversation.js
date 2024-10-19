import { getToken } from "next-auth/jwt";
import { db } from '../../../../database/firebase';
import { doc, setDoc, updateDoc, arrayUnion, getDoc } from "firebase/firestore"; 
import { chat_completer } from "../../utils";  

const secret = process.env.NEXTAUTH_SECRET;

if (!global.chatHistories) {
  global.chatHistories = {};
}



export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Authenticate the user
  const token = await getToken({ req, secret });

  console.log(token);

  if (!token) {
    return res.status(401).json({ error: "Unauthorized. Invalid session token." });
  }

  const { conversationid, message } = req.body;

  // Ensure conversationid and message are valid
  if (!conversationid || !message) {
    return res.status(400).json({ error: "conversationid and message are required" });
  }

  const userMessage = { 
    content: message, 
    role: 'user', 
    timestamp: new Date().toISOString()  // Add timestamp here (for Firebase, not for API)
  };

  try {
    // Reference to the conversation document in Firestore
    const docRef = doc(db, "Conversations", conversationid);
    let chatHistory = [];

    // Check if the conversation already exists
    const chatHistorySnap = await getDoc(docRef);

    if (!chatHistorySnap.exists()) {
      // If the conversation doesn't exist, create a new one
      await setDoc(docRef, {
        messages: [userMessage],
        created_at: new Date(),
        updated_at: new Date(),
        conversation_id: conversationid,
        user_id: token.email // Associate the conversation with the user's email
      });
      chatHistory.push(userMessage);
      global.chatHistories[conversationid] = [userMessage];
    } else {
      // If it exists, fetch the existing messages
      chatHistory = chatHistorySnap.data().messages;

      // Add the new user message to the chat history
      chatHistory.push(userMessage);

      // Store the updated chat history in the global cache
      if (!global.chatHistories[conversationid]) {
        global.chatHistories[conversationid] = [];
      }
      global.chatHistories[conversationid].push(userMessage);

      // Update the Firestore document with the new message
      await updateDoc(docRef, {
        messages: arrayUnion({
          content: userMessage.content,
          role: userMessage.role,
          timestamp: userMessage.timestamp  // This timestamp is for Firebase
        }),
        updated_at: new Date()  // Update the last modified time for the conversation
      });
    }

    // Call the chat_completer function to get AI response
    const aiResponse = await chat_completer(global.chatHistories[conversationid]);

    const apiMessage = {
      content: aiResponse,
      role: 'assistant',
      timestamp: new Date().toISOString()  // Add timestamp for AI response (for Firebase)
    };

    // Add the AI response to global chat history and Firestore
    global.chatHistories[conversationid].push(apiMessage);
    await updateDoc(docRef, {
      messages: arrayUnion(apiMessage),
      updated_at: new Date()  // Update the last modified time for the conversation
    });

    // Return the updated chat history
    return res.status(200).json({ messages: global.chatHistories[conversationid] });
  } catch (error) {
    console.error('Error handling the conversation:', error.message);
    return res.status(500).json({ error: "Failed to complete the chat. Please try again later." });
  }
}
