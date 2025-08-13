// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth/next";
import { authOptions } from "@/auth";

// Initialize the NextAuth handler
const handler = NextAuth(authOptions);

// Export it for both GET and POST
export { handler as GET, handler as POST };