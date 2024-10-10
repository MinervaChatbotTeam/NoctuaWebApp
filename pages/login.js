import AuthButton from "@/components/AuthButton";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-3xl shadow-2xl p-10 max-w-md text-center">
        <h1 className="text-4xl font-bold text-white mb-6">Noctua</h1>
        <p className="text-white mb-8">Sign in to continue</p>
        <AuthButton />
      </div>
    </div>
  );
}
