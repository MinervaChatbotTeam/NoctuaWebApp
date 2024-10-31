import { getToken } from "next-auth/jwt";
import { db } from '../../../../database/firebase';
import { doc, setDoc, updateDoc, arrayUnion, getDoc } from "firebase/firestore"; 
import { v4 as uuidv4 } from 'uuid';

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
  if (!token) {
    return res.status(401).json({ error: "Unauthorized. Invalid session token." });
  }

  const { conversationid, message } = req.body;
  console.log("Received conversationid:", conversationid);
  console.log("Received message:", message);

  if (!conversationid || !message) {
    return res.status(400).json({ error: "Conversation ID and message content are required" });
  }

  // Step 1: Generate a unique ID for the message document
  const messageId = uuidv4();
  console.log("Generated messageId:", messageId);

  try {
    // Step 2: Check if the conversation ID exists in the Conversations collection
    const conversationDocRef = doc(db, "Conversations", conversationid);
    const conversationSnap = await getDoc(conversationDocRef);

    if (!conversationSnap.exists()) {
      return res.status(404).json({ error: "Conversation ID not found" });
    }

    // Initialize global chat history for the conversation if it doesn't exist
    if (!global.chatHistories[conversationid]) {
      global.chatHistories[conversationid] = [];
      console.log("Initialized chat history for conversation:", conversationid);
    }

    // Step 3: Add user message to global chat history
    const userMessage = { content: message, role: 'user', timestamp: new Date().toISOString() };
    global.chatHistories[conversationid].push(userMessage);

    // Step 4: Call the chat_completer function to get AI response
    const aiResponse = await chat_completer(global.chatHistories[conversationid]);
    const apiMessage = {
      content: aiResponse,
      role: 'assistant',
      timestamp: new Date().toISOString()
    };

    // Update the global chat history with the AI response
    global.chatHistories[conversationid].push(apiMessage);

    // Step 5: Store the user message and AI response in the Messages collection
    const messageDocRef = doc(db, "Messages", messageId);
    await setDoc(messageDocRef, {
      message_id: messageId,
      conversation_id: conversationid,
      user_message: userMessage.content,
      ai_response: apiMessage.content,
      timestamp: new Date(),
      user_id: token.email
    });

    // Step 6: Add the unique message ID to the messages list in the Conversations collection
    await updateDoc(conversationDocRef, {
      messages: arrayUnion(messageId),
      updated_at: new Date()
    });

    // Return success response
    return res.status(200).json({
      message_id: messageId,
      conversation_id: conversationid,
      user_message: userMessage.content,
      ai_response: apiMessage.content
    });
  } catch (error) {
    console.error('Error handling the message and response:', error.message);
    return res.status(500).json({ error: "Failed to process the message. Please try again later." });
  }
}
