import { config } from "@/auth";
import NextAuth from "next-auth/next";

const handler = NextAuth(config);

// Add error handling for the API route
export async function GET(request: Request) {
  try {
    return await handler(request);
  } catch (error) {
    console.error("[NextAuth API Error]:", error);
    return new Response(
      JSON.stringify({ error: "Authentication service temporarily unavailable" }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    return await handler(request);
  } catch (error) {
    console.error("[NextAuth API Error]:", error);
    return new Response(
      JSON.stringify({ error: "Authentication service temporarily unavailable" }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}
