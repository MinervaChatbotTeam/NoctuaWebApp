import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const allowedEmails = ["alaa@uni.minerva.edu", "a.soliman@uni.minerva.edu", "enes@uni.minerva.edu", "aterrana@minerva.edu", "jacopo@uni.minerva.edu", "laryssa@uni.minerva.edu", "psterne@minerva.edu","rlevitt@minerva.edu"];


export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Check if the user's email is in the allowedEmails array
      if (allowedEmails.includes(user.email)) {
        return true; // Allow sign-in
      } else {
        return false; // Deny sign-in
      }
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

});