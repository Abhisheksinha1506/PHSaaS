import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimiter } from './lib/rate-limiter';

// Rate limiting middleware for API routes
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only apply rate limiting to API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Extract API name from path
  const apiName = getApiNameFromPath(pathname);
  
  if (!apiName) {
    return NextResponse.next();
  }

  // Check rate limits
  const canCall = rateLimiter.canMakeCall(apiName);
  
  if (!canCall.allowed) {
    console.warn(`🚨 Rate limit exceeded for ${apiName}: ${canCall.reason}`);
    
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: canCall.reason,
        retryAfter: canCall.retryAfter,
        rateLimitStatus: rateLimiter.getStatus(apiName)
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((canCall.retryAfter || 0) / 1000).toString(),
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + (canCall.retryAfter || 0)).toISOString()
        }
      }
    );
  }

  // Add rate limit headers to successful responses
  const response = NextResponse.next();
  const status = rateLimiter.getStatus(apiName);
  
  response.headers.set('X-RateLimit-Limit', status.maxCalls.toString());
  response.headers.set('X-RateLimit-Remaining', (status.maxCalls - status.callsInWindow).toString());
  response.headers.set('X-RateLimit-Reset', new Date(Date.now() + 60 * 60 * 1000).toISOString());
  
  return response;
}

// Extract API name from request path
function getApiNameFromPath(pathname: string): string | null {
  const apiMap: Record<string, string> = {
    '/api/product-hunt': 'producthunt',
    '/api/hacker-news': 'hackernews',
    '/api/saashub': 'github',
    '/api/search': 'search',
    '/api/analytics': 'analytics',
    '/api/realtime': 'realtime',
    '/api/export': 'export'
  };

  // Find matching API route
  for (const [path, apiName] of Object.entries(apiMap)) {
    if (pathname.startsWith(path)) {
      return apiName;
    }
  }

  return null;
}

// Configure which routes to apply middleware to
export const config = {
  matcher: [
    '/api/product-hunt/:path*',
    '/api/hacker-news/:path*',
    '/api/saashub/:path*',
    '/api/search/:path*',
    '/api/analytics/:path*',
    '/api/realtime/:path*',
    '/api/export/:path*'
  ]
};
