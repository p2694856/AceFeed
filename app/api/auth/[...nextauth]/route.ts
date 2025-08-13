// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/auth"; // adjust path if needed

export { authOptions };
export default NextAuth(authOptions);
