"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin;

  return (
    <header className="w-full bg-white shadow-md py-4 px-8">
      <nav className="flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold text-gray-800 hover:scale-125 transition-colors hover:transition-scale"
        >
          AceFeed
        </Link>

        <div className="flex items-center space-x-4">
          <Link
            href="/posts"
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-200 hover:text-black transition"
          >
            Posts
          </Link>

          {session ? (
            <>
              {!isAdmin && (
                <>
                  <Link
                    href="/posts/new"
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-200 hover:text-black transition"
                  >
                    New Post
                  </Link>

                  <Link
                    href="/settings/topics"
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-200 hover:text-black transition"
                  >
                    Topics
                  </Link>
                </>
              )}

              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500 text-right">
                  {session.user?.name && <div>{session.user.name}</div>}
                  <div>{session.user?.email}</div>
                </div>

                {isAdmin ? (
                  <Link
                    href="/admin"
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-200 hover:text-black transition"
                  >
                    Admin Panel
                  </Link>
                ) : (
                  <button
                    onClick={() => signOut()}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-200 hover:text-black transition"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-200 hover:text-black transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
