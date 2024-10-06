import { db } from '../../../database/firebase';
import { collection, getDocs } from "firebase/firestore"; 

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            // 1. Reference the 'Conversations' collection
            const conversationsRef = collection(db, "Conversations");

            // 2. Get all documents from the 'Conversations' collection
            const querySnapshot = await getDocs(conversationsRef);

            // 3. Extract data from each document
            const conversations = [];
            querySnapshot.forEach((doc) => {
                conversations.push({ id: doc.id, ...doc.data() });
            });

            // 4. Return all conversations
            res.status(200).json({ conversations });
        } catch (error) {
            console.error('Error retrieving conversations:', error);
            res.status(500).json({ error: "Error retrieving conversations." });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
