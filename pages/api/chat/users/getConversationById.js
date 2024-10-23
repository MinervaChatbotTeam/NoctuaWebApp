import { getToken } from "next-auth/jwt";
import { db } from '../../../../database/firebase';
import { doc, getDoc } from "firebase/firestore"; 

const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Authenticate the user
  const token = await getToken({ req, secret });

  if (!token) {
    return res.status(401).json({ error: "Unauthorized. Please log in to access conversations." });
  }

  const { conversationid } = req.query;

  // Ensure conversationid is valid
  if (!conversationid) {
    return res.status(400).json({ error: "conversationid is required" });
  }

  try {
    // Reference to the user document in Firestore
    const userDocRef = doc(db, "Users", token.email);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return res.status(404).json({ error: "User not found." });
    }

    const userData = userDocSnap.data();

    // Check if the conversationid exists in the user's conversation_ids
    if (!userData.conversation_ids || !userData.conversation_ids.includes(conversationid)) {
      return res.status(403).json({ error: "You do not have access to this conversation." });
    }

    // Fetch the conversation from Firestore
    const conversationDocRef = doc(db, "Conversations", conversationid);
    const conversationDocSnap = await getDoc(conversationDocRef);

    if (!conversationDocSnap.exists()) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    // Return the conversation data
    const conversationData = conversationDocSnap.data();
    return res.status(200).json({ conversation: conversationData });

  } catch (error) {
    console.error('Error retrieving the conversation:', error.message);
    return res.status(500).json({ error: "Failed to retrieve the conversation. Please try again later." });
  }
}
