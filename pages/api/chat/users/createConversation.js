import { getToken } from "next-auth/jwt";
import { db } from '../../../../database/firebase';
import { doc, setDoc, updateDoc, arrayUnion, getDoc, addDoc, collection } from "firebase/firestore";
import { chat_completer } from "../../utils";  // For interaction with RunPod

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

  // Ensure conversationid and message are valid
  if (!conversationid || !message) {
    return res.status(400).json({ error: "conversationid and message are required" });
  }

  const userMessage = {
    content: message,
    role: 'user',
    timestamp: new Date().toISOString()  // Add timestamp for Firebase
  };

  try {
    let docRef;

    // Create a new conversation using Firestore's auto-generated document ID
    const conversationsRef = collection(db, "Conversations");
    docRef = await addDoc(conversationsRef, {
      messages: [userMessage],
      created_at: new Date(),
      updated_at: new Date(),
      conversation_id: conversationid,  // Store the user-provided conversationid (the "title")
      user_id: token.email  // Associate the conversation with the user's email
    });

    const generatedDocId = docRef.id;  // Capture the newly generated document ID

    // Update the global chat history cache
    global.chatHistories[generatedDocId] = [userMessage];

    // Add this conversation ID to the user's conversation_ids
    const userDocRef = doc(db, "Users", token.email);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      // Update the user's conversation_ids field
      await updateDoc(userDocRef, {
        conversation_ids: arrayUnion(generatedDocId)  // Add the new Firestore document ID to the array
      });
    } else {
      // Create a new user entry if it doesn't exist
      await setDoc(userDocRef, {
        email: token.email,
        conversation_ids: [generatedDocId],  // Add the new Firestore document ID
        name: token.name,
        image: token.picture,
        createdAt: new Date(),
      });
    }

    // Call the chat_completer function to get the AI response (integrate with RunPod)
    const aiResponse = (await chat_completer(global.chatHistories[generatedDocId]));
    const text = aiResponse[0].text.text
    console.log("Hi",aiResponse)
    const apiMessage = {
      content: text,
      images: aiResponse.slice(1),
      role: 'assistant',
      timestamp: new Date().toISOString()  // Add timestamp for AI response (for Firebase)
    };

    global.chatHistories[generatedDocId].push(apiMessage);

    // Update Firestore with the AI response
    await updateDoc(docRef, {
      messages: arrayUnion(apiMessage),
      updated_at: new Date()
    });

    // Return the updated chat history with the AI response
    return res.status(200).json({ messages: global.chatHistories[generatedDocId], conversationid:generatedDocId });
  } catch (error) {
    console.error('Error handling the conversation:', error.message);
    return res.status(500).json({ error: "Failed to complete the chat. Please try again later." });
  }
}
