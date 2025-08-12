// app/api/auth/[...nextauth]/route.ts

import NextAuth, { type NextAuthOptions } from "next-auth";
import GitHubProvider, { type GithubProfile } from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    // 1) GitHub provider — only your admin user
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),

    // 2) Credentials provider for everyone else
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. Validate incoming form data
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        // 2. Find user in your database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // 3. If user not found, prompt them to register
        if (!user) {
          throw new Error("No account found. Please register first.");
        }

        // 4. Verify password
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        // 5. Return the user object (NextAuth will omit the password)
        return user;
      },
    }),
  ],

  // Custom pages
  pages: {
    signIn: "/login",
    error:  "/login", // Any error (e.g. from authorize) will redirect here
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    // Only allow GitHub login if username matches your admin
    async signIn({ account, profile }) {
      if (account?.provider === "github" && profile) {
        const githubProfile = profile as GithubProfile;
        return githubProfile.login === process.env.ADMIN_GITHUB_USERNAME;
      }
      return true;
    },

    // Stamp an isAdmin flag into the JWT on successful GitHub login
    async jwt({ token, user, account }) {
      if (account?.provider === "github" && user) {
        token.isAdmin = true;
      }
      token.id = token.id ?? (user?.id as string);
      return token;
    },

    // Expose id and isAdmin on the client session
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

// NextAuth handler for both GET and POST
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };