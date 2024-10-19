import { db } from '../../../../database/firebase';
import { collection, getDocs } from "firebase/firestore"; 

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            // 1. Reference the 'Users' collection
            const usersRef = collection(db, "Users");

            // 2. Get latest documents from the 'Users' collection
            const querySnapshot = await getDocs(usersRef);

            // 3. Extract data from each document
            const users = [];
            querySnapshot.forEach((doc) => {
                users.push({ id: doc.id, ...doc.data() });
            });

            // 4. Return latest users
            res.status(200).json({ users });
        } catch (error) {
            console.error('Error retrieving users:', error);
            res.status(500).json({ error: "Error retrieving users." });
        }
    } else {
        res.status(405).json({ message: 'Method not latestowed' });
    }
}
