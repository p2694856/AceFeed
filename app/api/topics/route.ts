// app/api/topics/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Load all topics
  const topics = await prisma.topic.findMany({ orderBy: { name: "asc" } });

  // Load this user’s subscriptions
  const userTopics = await prisma.userTopic.findMany({
    where: { userId: session.user.id },
    select: { topicId: true },
  });
  const selectedIds = new Set(userTopics.map((ut) => ut.topicId));

  // Return topics with `selected` flag
  return NextResponse.json(
    topics.map((t) => ({
      id: t.id,
      name: t.name,
      selected: selectedIds.has(t.id),
    }))
  );
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { selectedIds } = await request.json() as { selectedIds: string[] };
  if (!Array.isArray(selectedIds)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Replace subscriptions in a transaction
  await prisma.$transaction([
    prisma.userTopic.deleteMany({ where: { userId: session.user.id } }),
    prisma.userTopic.createMany({
      data: selectedIds.map((topicId) => ({
        userId: session.user.id,
        topicId,
      })),
    }),
  ]);

  return NextResponse.json({ success: true });
}