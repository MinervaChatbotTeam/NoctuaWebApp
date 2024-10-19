import { getToken } from "next-auth/jwt";
import { db } from '../../../../database/firebase';
import { collection, query, where, getDocs } from "firebase/firestore";

// Ensure the NEXTAUTH_SECRET is set in your environment
const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(req, res) {
  console.log("Incoming request method: ", req.method);

  // Only allow GET requests to this API endpoint
  if (req.method !== "GET") {
    console.log("Method not allowed");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Try to retrieve the session token from the request
  console.log("Attempting to retrieve token from request...");
  const token = await getToken({ req, secret });
  console.log("Token received: ", token); // Logs the full token object

  if (!token) {
    console.log("Unauthorized: No valid token");
    return res.status(401).json({ error: "Unauthorized. Invalid session token." });
  }

  // Check if the token contains an email field
  if (!token.email) {
    console.log("Token does not contain email: ", token);
    return res.status(400).json({ error: "Token is missing email information." });
  }

  try {
    console.log("Querying Firestore for conversations where user_id is: ", token.email);
    const q = query(
      collection(db, "Conversations"),
      where("user_id", "==", token.email) // Ensure token contains the email field
    );
    const querySnapshot = await getDocs(q);
    const conversations = querySnapshot.docs.map(doc => doc.data());

    console.log("Conversations retrieved: ", conversations);
    res.status(200).json({ conversations });
  } catch (error) {
    console.log("Error fetching conversations from Firestore: ", error);
    res.status(500).json({ error: "Error fetching conversations." });
  }
}