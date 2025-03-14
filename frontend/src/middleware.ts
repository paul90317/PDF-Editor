import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL;
  
  // Log for debugging
  console.log('Middleware - Backend URL:', backendUrl);
  console.log('Middleware - Request path:', request.nextUrl.pathname);

  // Check if the request is for API or images
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Remove the /api prefix and create the URL for proxying
    const path = request.nextUrl.pathname.replace(/^\/api/, '');
    const url = new URL(path + request.nextUrl.search, backendUrl);

    // Forward the request
    return NextResponse.rewrite(url);
  } else if (request.nextUrl.pathname.startsWith('/img')) {
    // Create the URL for proxying images
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, backendUrl);
    
    // Forward the request
    return NextResponse.rewrite(url);
  }

  // Continue normal processing for other routes
  return NextResponse.next();
}

// Configure which paths should be handled by the middleware
export const config = {
  matcher: [
    '/api/:path*',
    '/img/:path*'
  ]
}; 