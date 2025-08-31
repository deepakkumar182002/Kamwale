import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import NextAuth, { getServerSession, type NextAuthOptions } from "next-auth";
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";

export const config = {
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  // Conditionally use adapter based on environment
  ...(process.env.DATABASE_URL && {
    adapter: PrismaAdapter(prisma),
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
  
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log("[SignIn] User:", user?.email, "Provider:", account?.provider);
        return true;
      } catch (error) {
        console.error("[SignIn Error]:", error);
        return false;
      }
    },
    
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    
    async session({ session, token }) {
      try {
        if (token) {
          session.user.id = token.id;
          session.user.name = token.name;
          session.user.email = token.email;
          session.user.image = token.picture;
          session.user.username = token.username;
        }
        return session;
      } catch (error) {
        console.error("[Session Error]:", error);
        return session;
      }
    },

    async jwt({ token, user, account }) {
      try {
        if (user) {
          token.id = user.id;
        }

        if (!token.email) {
          return token;
        }

        // Skip database operations if no DATABASE_URL
        if (!process.env.DATABASE_URL) {
          console.warn("[JWT] No DATABASE_URL, skipping user lookup");
          return token;
        }

        const prismaUser = await prisma.user.findFirst({
          where: {
            email: token.email,
          },
        }).catch((error) => {
          console.error("[JWT Database Error]:", error);
          return null;
        });

        if (!prismaUser) {
          // If no user found and this is a new sign in with Google
          if (user && account?.provider === "google") {
            try {
              const newUser = await prisma.user.create({
                data: {
                  email: token.email!,
                  name: token.name,
                  image: token.picture,
                  username: await generateUniqueUsername(token.name || "user"),
                },
              });
              
              return {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                picture: newUser.image,
              };
            } catch (error) {
              console.error("[JWT User Creation Error]:", error);
            }
          }
          return token;
        }

        // Generate a unique username if it doesn't exist
        if (!prismaUser.username) {
          try {
            const uniqueUsername = await generateUniqueUsername(prismaUser.name || "user");
            
            await prisma.user.update({
              where: {
                id: prismaUser.id,
              },
              data: {
                username: uniqueUsername,
              },
            });

            prismaUser.username = uniqueUsername;
          } catch (error) {
            console.error("[JWT Username Update Error]:", error);
          }
        }

        return {
          id: prismaUser.id,
          name: prismaUser.name,
          email: prismaUser.email,
          username: prismaUser.username,
          picture: prismaUser.image,
        };
      } catch (error) {
        console.error("[JWT Error]:", error);
        return token;
      }
    },
  },
} satisfies NextAuthOptions;

// Helper function to generate unique username
async function generateUniqueUsername(name: string): Promise<string> {
  if (!process.env.DATABASE_URL) {
    return name.split(" ").join("").toLowerCase() + Math.floor(1000 + Math.random() * 9000);
  }
  
  try {
    let baseUsername = name.split(" ").join("").toLowerCase() || "user";
    let uniqueUsername = baseUsername;
    let suffix = 0;

    // Check if username already exists
    let existingUser = await prisma.user.findFirst({
      where: { username: uniqueUsername },
    });

    // Loop until we find a unique one
    while (existingUser) {
      suffix = Math.floor(1000 + Math.random() * 9000); // random 4-digit
      uniqueUsername = `${baseUsername}${suffix}`;
      existingUser = await prisma.user.findFirst({
        where: { username: uniqueUsername },
      });
    }

    return uniqueUsername;
  } catch (error) {
    console.error("[Username Generation Error]:", error);
    return name.split(" ").join("").toLowerCase() + Math.floor(1000 + Math.random() * 9000);
  }
}

export default NextAuth(config);

// For server-side access
export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, config);
}

