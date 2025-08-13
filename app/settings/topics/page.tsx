// app/settings/topics/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions }      from "@/auth"
import TopicSelector from "@/app/components/TopicSelector";

export default async function TopicsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    // You could `redirect('/login')` here if you prefer
    return <p className="p-8">Please sign in to manage your topics.</p>;
  }

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Hello, {session.user.name} — pick your topics
      </h1>
      <TopicSelector />
    </main>
  );
}