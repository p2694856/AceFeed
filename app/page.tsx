// app/page.tsx
export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { checkPostTableExists } from "@/lib/db-utils";
import logo from "../acefeed-logo.png";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export default async function Home() {
  // 1. Optional session (if present we’ll filter by followed topics)
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;

  // 2. Redirect to setup if no Post table
  const tableExists = await checkPostTableExists();
  if (!tableExists) redirect("/setup");

  // 3. If logged in, lookup the user.id to filter by their followed topics
  let userId: string | null = null;
  if (userEmail) {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });
    userId = user?.id ?? null;
  }

  // 4. Build a dynamic `where` clause:
  //    - logged-in → only topics they follow
  //    - not logged-in → everything (just published posts)
  const whereClause = userId
    ? {
        published: true,
        topic: {
          userTopics: {
            some: { userId },
          },
        },
      }
    : { published: true };

  // 5. Fetch posts with topic.name and author.name
  const posts = await prisma.post.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: 9,
    include: {
      author: { select: { name: true } },
      topic: { select: { name: true } },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-8">
      <img
        src={logo.src}
        alt="AceFeed Logo"
        className="w-[16rem] h-[9rem] object-contain opacity-80 mb-4 mx-auto"
      />
      <h2 className="text-3xl font-semibold mb-8 text-[#333333]">
        Using AI to generate posts just for you
      </h2>
      <h1 className="text-5xl font-extrabold mb-8 text-[#333333]">
        Your Personal Posts
      </h1>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl mb-8">
        {posts.map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`} className="group">
            <div className="border rounded-lg shadow-md bg-white p-6 hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-2xl font-semibold text-gray-900 group-hover:underline mb-2">
                {post.topic.name}
              </h2>

              <p className="text-xs text-gray-400 mb-4">
                <img
                  src={post.imageUrl}
                  alt={post.topic.name}
                  className="rounded w-full opacity-80 mb-2 w-80 h-80 object-cover mx-auto"
                />
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              <div className="relative">
                <p className="text-gray-700 leading-relaxed line-clamp-2">
                  {post.content || "No content available."}
                </p>
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-gray-50 to-transparent" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}