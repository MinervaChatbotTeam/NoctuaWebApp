import { getToken } from "next-auth/jwt";
import { db } from '../../../../database/firebase';
import { doc, updateDoc, getDoc, arrayRemove, deleteDoc } from "firebase/firestore";

const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Authenticate the user
  const token = await getToken({ req, secret });

  if (!token) {
    return res.status(401).json({ error: "Unauthorized. Please log in to delete conversations." });
  }

  const { conversationid } = req.body;

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
      return res.status(403).json({ error: "Conversation ID not found in user's conversation_ids." });
    }

    // Step 1: Mark the conversation document as deleted
    const conversationDocRef = doc(db, "Conversations", conversationid);
    const conversationDocSnap = await getDoc(conversationDocRef);

    if (!conversationDocSnap.exists()) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    // Mark the conversation as deleted
    await updateDoc(conversationDocRef, {
      isDeleted: true,
      deleted_at: new Date(),
    });

    console.log(`Document ${conversationid} marked as deleted.`);

    // Step 2: Remove the conversation ID from the user's document
    await updateDoc(userDocRef, {
      conversation_ids: arrayRemove(conversationid)
    });

    console.log(`Conversation ${conversationid} removed from user.`);

    // Return a success message
    return res.status(200).json({ message: `Conversation ${conversationid} marked as deleted successfully.` });

  } catch (error) {
    console.error('Error deleting conversation:', error.message);
    return res.status(500).json({ error: "Failed to delete conversation. Please try again later." });
  }
}
