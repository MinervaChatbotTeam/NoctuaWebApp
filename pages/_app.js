import "../styles/globals.css"
import "../styles/markdown.css"
import { SessionProvider } from "next-auth/react";
import { useRouter } from 'next/router';
import { useEffect } from 'react';

function App({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();

  // Add session monitoring
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'next-auth.session-token' && !event.newValue) {
        router.push('/login');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [router]);

  return (
    <SessionProvider 
      session={session}
      // Add session configuration
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
    >
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default App;