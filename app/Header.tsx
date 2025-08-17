"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full bg-white shadow-md py-4 px-8">
      <nav className="flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold text-gray-800 hover:scale-125 transition-transform"
        >
          AceFeed
        </Link>

        {/* Hamburger/Close button (mobile only) */}
        <button
          onClick={() => setIsOpen((o) => !o)}
          className="md:hidden text-2xl p-2"
          aria-label="Toggle menu"
        >
          {isOpen ? "×" : "≡"}
        </button>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/posts"
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-200 hover:text-black transition"
          >
            Posts
          </Link>

          {session ? (
            <>
              {!isAdmin && (
                <Link
                  href="/settings/topics"
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-200 hover:text-black transition"
                >
                  Topics
                </Link>
              )}

              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500 text-right">
                  {session.user?.name && <div>{session.user.name}</div>}
                  <div>{session.user.email}</div>
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

      {/* Mobile menu (shown when isOpen) */}
      {isOpen && (
        <div className="md:hidden mt-4 space-y-2">
          <Link
            href="/posts"
            className="block bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-200 hover:text-black transition"
          >
            Posts
          </Link>

          {session ? (
            <>
              {!isAdmin && (
                <Link
                  href="/settings/topics"
                  className="block bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-200 hover:text-black transition"
                >
                  Topics
                </Link>
              )}

              {isAdmin ? (
                <Link
                  href="/admin"
                  className="block bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-200 hover:text-black transition"
                >
                  Admin Panel
                </Link>
              ) : (
                <button
                  onClick={() => signOut()}
                  className="w-full text-left bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-200 hover:text-black transition"
                >
                  Sign Out
                </button>
              )}   
            </>
          ) : (
            <Link
              href="/login"
              className="block bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-200 hover:text-black transition"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}