// app/posts/[id]/page.tsx
export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

export default async function Post({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 1. get session + admin flag
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.isAdmin;

  // 2. load post
  const { id } = await params;
  const postId = parseInt(id, 10);

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { author: true },
  });
  if (!post) notFound();

  // 3. delete action (no auth check here – purely UI visibility)
  async function deletePost() {
    "use server";

    await prisma.post.delete({ where: { id: postId } });
    redirect("/posts");
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <article className="max-w-3xl w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          {post.title}
        </h1>
        {!post.authorId && (
              <img
                src={post.imageUrl}
                alt={post.title}
                className="rounded w-full opacity-80 mb-2"
              />
            )}
        <div className="text-lg text-gray-800 leading-relaxed space-y-6 border-t pt-6">
          {post.content ? (
            <p>{post.content}</p>
          ) : (
            <p className="italic text-gray-500">
              No content available for this post.
            </p>
          )}
        </div>
      </article>

      {isAdmin && (
        <form action={deletePost} className="mt-6">
          <button
            type="submit"
            className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete Post
          </button>
        </form>
      )}
    </div>
  );
}