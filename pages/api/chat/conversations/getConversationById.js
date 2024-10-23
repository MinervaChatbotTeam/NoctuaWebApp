import { db } from '../../../../database/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default async function handler(req, res) {
    const { conversation_id } = req.query;  // Extract the conversation ID from the request query

    try {
        // Reference the specific conversation document by its ID
        const conversationRef = doc(db, 'Conversations', conversation_id);
        const conversationSnap = await getDoc(conversationRef);

        if (conversationSnap.exists()) {
            // If the document exists, return the conversation data
            const conversationData = conversationSnap.data();
            res.status(200).json({ id: conversation_id, ...conversationData });
        } else {
            // If no conversation is found, return a 404
            res.status(404).json({ message: 'Conversation not found' });
        }
    } catch (error) {
        // Handle any errors that occur while retrieving the conversation
        console.error('Error fetching conversation:', error);
        res.status(500).json({ error: 'Failed to fetch conversation' });
    }
}
