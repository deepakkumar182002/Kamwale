import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nextauthUrl: process.env.NEXTAUTH_URL,
      databaseConfigured: !!process.env.DATABASE_URL,
      databaseUrl: process.env.DATABASE_URL ? 
        `${process.env.DATABASE_URL.substring(0, 20)}...` : 'NOT_SET',
    };

    // Test database connection
    let dbStatus = "disconnected";
    let dbError = null;
    
    try {
      await prisma.$connect();
      // Try a simple query
      await prisma.user.count();
      dbStatus = "connected";
    } catch (error: any) {
      dbError = error.message;
      dbStatus = "error";
    } finally {
      await prisma.$disconnect();
    }

    return NextResponse.json({
      status: "ok",
      message: "Deployment Diagnostics",
      diagnostics: {
        ...diagnostics,
        database: {
          status: dbStatus,
          error: dbError,
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: "Diagnostic check failed",
      error: error.message,
    }, { status: 500 });
  }
}
