import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth, { getServerSession, type NextAuthOptions } from "next-auth";
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import bcrypt from "bcryptjs";

export const config = {
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  // Use adapter only if database is available
  ...(process.env.DATABASE_URL && {
    adapter: PrismaAdapter(prisma),
  }),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            username: user.username,
          };
        } catch (error) {
          console.error("[Auth Error]:", error);
          return null;
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
    async signIn({ user, account }) {
      try {
        console.log("[SignIn] User:", user?.email, "Provider:", account?.provider);
        return true;
      } catch (error) {
        console.error("[SignIn Error]:", error);
        return true;
      }
    },
    
    async redirect({ url, baseUrl }) {
      try {
        console.log("[Redirect] URL:", url, "BaseURL:", baseUrl);
        
        // Handle relative URLs
        if (url.startsWith("/")) {
          return `${baseUrl}${url}`;
        }
        
        // Handle same origin URLs
        if (url.startsWith(baseUrl)) {
          return url;
        }
        
        // Default to dashboard after successful sign in
        return `${baseUrl}/dashboard`;
      } catch (error) {
        console.error("[Redirect Error]:", error);
        return `${baseUrl}/dashboard`;
      }
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

    async jwt({ token, user }) {
      try {
        // If this is a new sign in, use the user data
        if (user) {
          token.id = user.id;
          token.picture = user.image;
          token.username = user.username;
        }

        if (!token.email) {
          return token;
        }

        // For production without database, use a simpler approach
        if (!process.env.DATABASE_URL) {
          console.log("[JWT] No DATABASE_URL, using JWT-only mode");
          return {
            ...token,
            id: token.id || `user_${token.email?.split('@')[0]}`,
            username: token.username || token.email?.split('@')[0]?.toLowerCase(),
          };
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

