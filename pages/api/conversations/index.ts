import { addDoc, arrayUnion, collection, doc, documentId, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../database/firebase';

import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const token = await getToken({ req, secret });
    if (!token) {
        return res.status(401).json({ error: "Unauthorized. Invalid session token." });
    }

  if (req.method === 'POST') {
    try {
      // Logic to create a new conversation
      

      // Add conversation ID to user's conversation_ids
      const userDocRef = doc(db, "Users", token.email);
      const userDocSnap = await getDoc(userDocRef);

      const title = `Conversation ${userDocSnap.exists() ? userDocSnap.data().conversation_ids?.length + 1 : 1}`;

      const conversationsRef = collection(db, "Conversations");
      
      const docRef = await addDoc(conversationsRef, {
        messages: [],
        created_at: new Date(),
        updated_at: new Date(),
        title:  title,
        user_id: token.email
      });

      const generatedDocId = docRef.id;

      if (userDocSnap.exists()) {
        await updateDoc(userDocRef, {
          conversation_ids: arrayUnion(generatedDocId)
        });
      } else {
        await setDoc(userDocRef, {
          email: token.email,
          conversation_ids: [generatedDocId],
          name: token.name,
          image: token.picture,
          createdAt: new Date(),
        });
      }

      res.status(201).json({ conversationId: generatedDocId });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  } else if (req.method === 'GET') {
    try {
      // Get user document to get conversation IDs
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
        where(documentId(), "in", userData.conversation_ids.slice(0,30)) // Use Firestore 'in' query to get multiple conversations
      );
      const conversationsSnapshot = await getDocs(conversationsQuery);
  
      // Collect all conversation data
      const conversations = conversationsSnapshot.docs.map(doc => {
        const data = doc.data();
        data.id = doc.id;
        return data
      });
  
      // Return the user's conversations
      return res.status(200).json({ conversations });
      
    } catch (error) {
      console.error('Error getting conversations:', error);
      res.status(500).json({ error: 'Failed to get conversations' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}