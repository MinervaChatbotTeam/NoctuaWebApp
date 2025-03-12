import AuthButton from "@/components/AuthButton";
import { GiOwl } from "react-icons/gi";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900/50 to-gray-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div 
        initial={{ opacity: 0.2 }}
        animate={{ 
          opacity: [0.2, 0.3, 0.2],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/20 to-blue-700/20 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"
      />
      
      <motion.div 
        initial={{ opacity: 0.2 }}
        animate={{ 
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 10, 
          delay: 1,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"
      />
      
      <motion.div 
        initial={{ opacity: 0.1 }}
        animate={{ 
          opacity: [0.1, 0.2, 0.1],
          x: [-10, 10, -10]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
      />

      {/* Stars/particles effect - SSR safe version */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: Math.random() * 0.5 + 0.3,
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              scale: Math.random() * 0.3 + 0.1
            }}
            animate={{ 
              opacity: [Math.random() * 0.5 + 0.3, Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 0.3],
            }}
            transition={{ 
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute w-1 h-1 bg-white rounded-full"
          />
        ))}
      </div>

      {/* Login Card with Glass Effect */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8,
          ease: "easeOut"
        }}
        className="relative backdrop-blur-md bg-gray-900/70 rounded-2xl shadow-2xl p-10 max-w-md w-full text-center z-10 
          border border-white/10 overflow-hidden"
      >
        {/* Subtle glow effect */}
        <div className="absolute inset-0 flex justify-center">
          <div className="w-1/2 h-1/2 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>
        
        {/* Card Content */}
        <div className="relative z-10">
          {/* Logo and Title with Animation */}
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center justify-center mb-10"
          >
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-50"></div>
              <div className="flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 p-4 rounded-full shadow-lg relative border border-white/20">
                <GiOwl size={48} className="text-white" />
              </div>
            </div>
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-blue-400"
            >
              Noctua
            </motion.h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100px" }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="h-[1px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent mt-3"
            />
          </motion.div>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1 }}
            className="text-lg text-gray-300 mb-10 font-light"
          >
            Unlock the wisdom of Noctua. Sign in to access your AI assistant.
          </motion.p>

          {/* Auth Button with Delay */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <AuthButton />
          </motion.div>
          
          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.5 }}
            className="mt-8 text-xs text-gray-500"
          >
            By signing in, you agree to our Terms of Service and Privacy Policy
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}