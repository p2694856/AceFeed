// src/lib/auth.ts

import { type NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import GitHubProvider, { type GithubProfile } from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    // 1) GitHub provider for your admin account only
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),

    // 2) Credentials provider for general users
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        name:     { label: "Name",     type: "text"  },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return prisma.user.create({
            data: {
              name:     credentials.name ?? credentials.email,
              email:    credentials.email,
              password: await bcrypt.hash(credentials.password, 10),
            },
          });
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    // ✅ Restrict GitHub sign-in to your admin account
    async signIn({ account, profile }) {
      if (account?.provider === "github" && profile) {
        const githubProfile = profile as GithubProfile;
        return githubProfile.login === process.env.ADMIN_GITHUB_USERNAME;
      }
      return true;
    },

    // ✅ Stamp isAdmin flag into JWT if GitHub login
    async jwt({ token, user, account }) {
      if (account?.provider === "github") {
        token.isAdmin = true;
      }

      // Ensure user ID is preserved
      if (user) {
        token.id = user.id;
      }

      return token;
    },

    // ✅ Expose isAdmin and id in session
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        isAdmin: Boolean(token.isAdmin),
      };
      return session;
    },
  },
};

export default NextAuth(authOptions);
