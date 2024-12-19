import AuthButton from "@/components/AuthButton";
import { GiOwl } from "react-icons/gi";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-blue-500 to-purple-700 rounded-full blur-3xl opacity-40 -translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-pink-500 to-red-500 rounded-full blur-3xl opacity-40 translate-x-1/3 translate-y-1/3"></div>

      {/* Auth Box */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl shadow-md p-12 max-w-md w-full text-center z-10 transition-shadow duration-700 hover:shadow-lg hover:shadow-blue-400/30">
        {/* Owl Logo and Title */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center justify-center bg-white p-3 rounded-full shadow-sm">
            <GiOwl size={40} className="text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-white ml-4">Noctua</h1>
        </div>

        {/* Description */}
        <p className="text-lg text-gray-200 mb-10">
          Unlock the wisdom of Noctua. Sign in to access your Minerva Assistant.
        </p>

        {/* Auth Button */}
        <AuthButton />
      </div>
    </div>
  );
}
