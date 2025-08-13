// src/auth.ts
import { type NextAuthOptions } from "next-auth";
import GitHubProvider, { type GithubProfile } from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No account found. Please register first.");
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
    error:  "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "github" && profile) {
        const githubProfile = profile as GithubProfile;
        return githubProfile.login === process.env.ADMIN_GITHUB_USERNAME;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "github" && user) {
        token.isAdmin = true;
      }
      token.id = token.id ?? (user?.id as string);
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id:      token.id as string,
        isAdmin: Boolean(token.isAdmin),
      };
      return session;
    },
  },
};