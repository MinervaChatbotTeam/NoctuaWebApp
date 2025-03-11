import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from "next-auth/jwt";
import { db } from '../../../database/firebase';

const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { conversationId } = req.query;

    const token = await getToken({ req, secret });
    if (!token) {
        return res.status(401).json({ error: "Unauthorized. Invalid session token." });
    }

    if (req.method === 'DELETE') {
        try {
            // Check if user has access to this conversation
            const userDocRef = doc(db, "Users", token.email);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                return res.status(404).json({ error: "User not found." });
            }

            const userData = userDocSnap.data();
            if (!userData.conversation_ids || !userData.conversation_ids.includes(conversationId)) {
                return res.status(403).json({ error: "You do not have access to this conversation." });
            }

            // Delete the conversation document
            const conversationDocRef = doc(db, "Conversations", conversationId as string);
            await deleteDoc(conversationDocRef);

            // Update user's conversation_ids array
            const updatedConversationIds = userData.conversation_ids.filter(id => id !== conversationId);
            await updateDoc(userDocRef, {
                conversation_ids: updatedConversationIds
            });

            res.status(200).json({ message: "Conversation deleted successfully" });
        } catch (error) {
            console.error('Error deleting conversation:', error);
            res.status(500).json({ error: 'Failed to delete conversation' });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
} 