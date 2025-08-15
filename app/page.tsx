export const dynamic = "force-dynamic"; // This disables SSG and ISR
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { checkPostTableExists } from "@/lib/db-utils";
import logo from "./acefeed-logo.png";

export default async function Home() {
  // Check if the post table exists
  const tableExists = await checkPostTableExists();

  // If the post table doesn't exist, redirect to setup page
  if (!tableExists) {
    redirect("/setup");
  }

  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 9,
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-8">
      <h2 className="text-3xl font-semibold mb-8 text-[#333333]">Using AI to generate posts just for you</h2>
      <h1 className="text-5xl font-extrabold mb-8 text-[#333333]">Your Personal Posts</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl mb-8">
        {posts.map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`} className="group">
            <div className="border rounded-lg shadow-md bg-white p-6 hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-2xl font-semibold text-gray-900 group-hover:underline mb-2">{post.title}</h2>
              <p className="text-xs text-gray-400 mb-4">
                {!post.authorId && (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="rounded w-full opacity-80 mb-2 w-80 h-80 object-cover mx-auto"
                  />
                )}
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <div className="relative">
                <p className="text-gray-700 leading-relaxed line-clamp-2">{post.content || "No content available."}</p>
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-gray-50 to-transparent" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
