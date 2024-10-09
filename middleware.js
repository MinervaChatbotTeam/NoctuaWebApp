import { getToken } from 'next-auth/jwt';


export async function middleware(req) {
  // Get the session token from the request
  const session = await getToken({ req, secret:process.env.NEXTAUTH_SECRET });

    if (!session && !req.nextUrl.pathname.startsWith('/login')) {
      return Response.redirect(new URL('/login', req.url))
    }
    
    if (session && req.nextUrl.pathname.startsWith('/login')) {
      return Response.redirect(new URL('/', req.url))
    }
  }
   
  export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
  }