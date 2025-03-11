import { doc, getDoc, setDoc } from "firebase/firestore"; // Import Firestore functions
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "../../../database/firebase"; // Adjust this to point to your Firebase config

const allowedEmails = [
  "alaa@uni.minerva.edu", "a.soliman@uni.minerva.edu", 
  "enes@uni.minerva.edu", "aterrana@minerva.edu", 
  "jacopo@uni.minerva.edu", "laryssa@uni.minerva.edu", 
  "psterne@minerva.edu", "rlevitt@minerva.edu", "shinnosuke.uesaka@uni.minerva.edu"
];

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Check if the user's email is allowed (optional)
      console.log(user)
      if (!allowedEmails.includes(user.email)) {
        return false; // Deny sign-in if not allowed
      }

      // Firestore document reference for the user
      const userRef = doc(db, "Users", user.email);

      try {
        const userDoc = await getDoc(userRef);  // Fetch the user document

        if (!userDoc.exists()) {
          // Add new user to Firestore if they don't exist
          await setDoc(userRef, {
            name: user.name,
            email: user.email,
            image: user.image,  // Store Google profile picture
            createdAt: new Date(),
          });
          console.log(`New user added to Firestore: ${user.email}`);
        } else {
          console.log(`User already exists in Firestore: ${user.email}`);
        }
      } catch (error) {
        console.error("Error adding user to Firestore:", error);
        return false;  // Deny sign-in if there's an error with Firestore
      }

      return true;  // Allow sign-in
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    jwt: true,
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
};

export default NextAuth(authOptions);