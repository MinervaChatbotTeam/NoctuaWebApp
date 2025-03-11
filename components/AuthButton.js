import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaGoogle, FaSignOutAlt } from "react-icons/fa";

export default function AuthButton() {
  const { data: session } = useSession();

  const handleSignIn = async () => {
    await signIn("google", { redirect: false });
  };

  // Button hover animation
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.03,
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.97 }
  };

  if (!session) {
    return (
      <motion.button
        onClick={handleSignIn}
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className="flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-blue-500 
          text-white font-medium py-3 px-6 rounded-lg shadow-md transition duration-300 
          hover:from-blue-500 hover:to-blue-400 border border-white/10 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-400/20 to-blue-500/0 
          opacity-0 group-hover:opacity-100 transition-opacity duration-500 
          transform translate-x-full group-hover:translate-x-0"></div>
        
        <div className="bg-white/10 p-1.5 rounded-full mr-3 flex items-center justify-center relative z-10">
          <FaGoogle className="text-white" size={16} />
        </div>
        <span className="text-sm font-medium tracking-wide relative z-10">Sign in with Google</span>
      </motion.button>
    );
  }

  // If the user is already signed in and this is in the login page,
  // show a button that navigates to the main app
  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-center space-x-4">
        {session.user.image ? (
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full bg-blue-500 blur-sm opacity-30"></div>
            <Image
              src={session.user.image}
              alt={session.user.name || "User avatar"}
              width={40}
              height={40}
              className="rounded-full border border-blue-400/30 bg-gray-900 relative z-10"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {session.user.name?.charAt(0) || "U"}
            </span>
          </div>
        )}
        <div className="text-left">
          <p className="text-gray-200 text-sm font-medium">{session.user.name}</p>
          <p className="text-gray-400 text-xs truncate max-w-[150px]">{session.user.email}</p>
        </div>
      </div>
      
      <motion.a
        href="/chat"
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className="flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-blue-500 
          text-white font-medium py-3 px-6 rounded-lg shadow-md transition duration-300 
          hover:from-blue-500 hover:to-blue-400 border border-white/10"
      >
        Continue to App
      </motion.a>
      
      <motion.button
        onClick={() => signOut()}
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className="flex items-center justify-center w-full px-6 py-2.5 bg-transparent hover:bg-gray-800/50 
          text-gray-300 rounded-lg transition duration-300 border border-white/10"
      >
        <FaSignOutAlt className="mr-2" size={14} />
        <span className="text-sm">Sign out</span>
      </motion.button>
    </div>
  );
}