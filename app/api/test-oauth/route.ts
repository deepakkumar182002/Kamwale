// Test script to verify OAuth configuration
// Add this as a temporary API route: app/api/test-oauth/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    nextAuthUrl: process.env.NEXTAUTH_URL,
    googleClientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING',
    nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'SET' : 'MISSING',
    databaseUrl: process.env.DATABASE_URL ? 'SET' : 'MISSING',
    nodeEnv: process.env.NODE_ENV,
  };

  return NextResponse.json({
    message: 'OAuth Configuration Test',
    config,
    expectedCallbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
    timestamp: new Date().toISOString(),
  });
}
