import { getToken } from "next-auth/jwt";
import { db } from '../../../../database/firebase';
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Authenticate the user
  const token = await getToken({ req, secret });
  if (!token) {
    return res.status(401).json({ error: "Unauthorized. Invalid session token." });
  }

  const { conversationid } = req.query;
  if (!conversationid) {
    return res.status(400).json({ error: "Conversation ID is required" });
  }

  try {
    // Step 1: Query the Messages collection for documents with the specified conversation ID
    const messagesRef = collection(db, "Messages");
    const messagesQuery = query(
      messagesRef,
      where("conversation_id", "==", conversationid),
      orderBy("timestamp") // Order messages by timestamp to maintain chronological order

    );

    const querySnapshot = await getDocs(messagesQuery);
    const messages = querySnapshot.docs.map(doc => doc.data());

    // Step 2: Return the messages in the response
    return res.status(200).json({ messages });
  } catch (error) {
    console.error('Error retrieving messages:', error.message);
    return res.status(500).json({ error: "Failed to retrieve messages. Please try again later." });
  }
}
