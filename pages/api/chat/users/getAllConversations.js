import { getToken } from "next-auth/jwt";
import { db } from '../../../../database/firebase';
import { doc, getDoc, collection, query, where, getDocs, documentId } from "firebase/firestore"; 

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

  try {
    // Reference to the user document in Firestore
    const userDocRef = doc(db, "Users", token.email);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return res.status(404).json({ error: "User not found." });
    }

    const userData = userDocSnap.data();

    // Check if the user has any conversation_ids
    if (!userData.conversation_ids || userData.conversation_ids.length === 0) {
      return res.status(200).json({ conversations: [] }); // No conversations for this user
    }

    // Query Firestore for conversations using the conversation_ids array
    const conversationsQuery = query(
      collection(db, "Conversations"),
      where(documentId(), "in", userData.conversation_ids) // Use Firestore 'in' query to get multiple conversations
    );
    const conversationsSnapshot = await getDocs(conversationsQuery);

    // Collect all conversation data
    const conversations = conversationsSnapshot.docs.map(doc => doc.data());

    // Return the user's conversations
    return res.status(200).json({ conversations });

  } catch (error) {
    console.error('Error retrieving conversations:', error.message);
    return res.status(500).json({ error: "Failed to retrieve conversations. Please try again later." });
  }
}
