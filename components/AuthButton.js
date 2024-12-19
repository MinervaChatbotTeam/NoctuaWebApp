import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default () => {
  const { data: session } = useSession();

  const handleSignIn = async () => {
    const res = await signIn("google", { redirect: false });
  };

  return (
    <div className="flex flex-col items-center">
      {!session ? (
        <button
          onClick={handleSignIn}
          className="flex items-center justify-center bg-white text-gray-700 font-medium py-3 px-6 rounded-lg shadow-md transition duration-500 hover:shadow-lg hover:border-blue-500 border border-transparent"
        >
          <Image
            src="/google.png"
            alt="Google Logo"
            width={20}
            height={20}
            className="mr-3"
          />
          <span className="text-sm">Sign in with Google</span>
        </button>
      ) : (
        <div className="text-center">
          <p className="text-gray-800 text-lg mb-4">Welcome, {session.user.name}!</p>
          <button
            onClick={() => signOut()}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg shadow-md transition duration-500 hover:shadow-lg"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};
