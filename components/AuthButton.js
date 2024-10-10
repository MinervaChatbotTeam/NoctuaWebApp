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
          className="flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-bold py-2 px-6 rounded-full shadow-lg transition duration-300 ease-in-out hover:bg-gray-100"
        >
          <Image
            src="/google.png"
            alt="Google Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          Sign in with Google
        </button>
      ) : (
        <div className="text-center">
          <p className="text-white text-xl mb-4">Welcome, {session.user.name}!</p>
          <button
            onClick={() => signOut()}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition duration-300 ease-in-out"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};
