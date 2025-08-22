// import { PrismaAdapter } from "@auth/prisma-adapter";
// import prisma from "@/lib/prisma";
// import GoogleProvider from "next-auth/providers/google";
// import NextAuth, { getServerSession, type NextAuthOptions } from "next-auth";
// import {
//   GetServerSidePropsContext,
//   NextApiRequest,
//   NextApiResponse,
// } from "next";

// export const config = {
//   pages: {
//     signIn: "/login",
//   },
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],
//   session: {
//     strategy: "jwt",
//   },
//   callbacks: {
//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.id;
//         session.user.name = token.name;
//         session.user.email = token.email;
//         session.user.image = token.picture;
//         session.user.username = token.username;
//       }

//       return session;
//     },
//     async jwt({ token, user }) {
//       const prismaUser = await prisma.user.findFirst({
//         where: {
//           email: token.email,
//         },
//       });

//       if (!prismaUser) {
//         token.id = user.id;
//         return token;
//       }
//       if (!prismaUser.username) {
//         await prisma.user.update({
//           where: {
//             id: prismaUser.id,
//           },
//           data: {
//             username: prismaUser.name?.split(" ").join("").toLowerCase(),
//           },
//         });
//       }

//       return {
//         id: prismaUser.id,
//         name: prismaUser.name,
//         email: prismaUser.email,
//         username: prismaUser.username,
//         picture: prismaUser.image,
//       };
//     },
//   },
// } satisfies NextAuthOptions;

// export default NextAuth(config);

// // Use it in server contexts
// export function auth(
//   ...args:
//     | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
//     | [NextApiRequest, NextApiResponse]
//     | []
// ) {
//   return getServerSession(...args, config);
// }

import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth, { getServerSession, type NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";

export const config = {
  pages: {
    signIn: "/signin",
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Credentials provider for manual email + password login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.username = token.username;
      }
      return session;
    },

    async jwt({ token, user }) {
      // If user data is available (during sign in), use it
      if (user) {
        token.id = user.id;
      }

      // Check if token has email before querying
      if (!token.email) {
        return token;
      }

      const prismaUser = await prisma.user.findFirst({
        where: {
          email: token.email,
        },
      });

      if (!prismaUser) {
        return token;
      }

      // Generate a unique username if it doesn't exist
      if (!prismaUser.username) {
        let baseUsername = prismaUser.name?.split(" ").join("").toLowerCase() || "user";
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

        // Now update with the unique username
        await prisma.user.update({
          where: {
            id: prismaUser.id,
          },
          data: {
            username: uniqueUsername,
          },
        });

        prismaUser.username = uniqueUsername;
      }

      return {
        id: prismaUser.id,
        name: prismaUser.name,
        email: prismaUser.email,
        username: prismaUser.username,
        picture: prismaUser.image,
      };
    },
  },
} satisfies NextAuthOptions;

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

