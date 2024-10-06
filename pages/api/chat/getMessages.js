import { db } from '../../../database/firebase'; // Import the Firebase configuration
import { doc, getDoc } from "firebase/firestore"; // Ensure you import doc and getDoc

export default async function handler(req, res) {
    const { chatId } = req.query;

    try {
        // 1. Reference the conversation document in Firestore
        const docRef = doc(db, "Conversations", chatId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // 2. Log the retrieved document data for debugging
            console.log('Document data:', docSnap.data());

            // 3. Get the messages array from Firestore
            const messages = docSnap.data().messages;
            res.status(200).json({ messages });
        } else {
            console.log('Conversation not found for chatId:', chatId);
            res.status(404).json({ message: 'Conversation not found' });
        }
    } catch (error) {
        console.error('Error retrieving conversation:', error);
        res.status(500).json({ error: "Error retrieving the conversation." });
    }
}
