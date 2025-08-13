-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Post" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Topic
CREATE TABLE IF NOT EXISTS "public"."Topic" (
    "id"   TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Topic.name
CREATE UNIQUE INDEX IF NOT EXISTS "Topic_name_key"
    ON "public"."Topic" ("name");

-- CreateTable: UserTopic
CREATE TABLE IF NOT EXISTS "public"."UserTopic" (
    "id"      TEXT NOT NULL,
    "userId"  TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    CONSTRAINT "UserTopic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");


-- CreateIndex: UserTopic.userId + topicId
CREATE UNIQUE INDEX IF NOT EXISTS "UserTopic_userId_topicId_key"
    ON "public"."UserTopic" ("userId", "topicId");
    
-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- AddForeignKey: link UserTopic.userId → User.id
ALTER TABLE "public"."UserTopic"
  ADD CONSTRAINT "UserTopic_userId_fkey"
  FOREIGN KEY ("userId")
  REFERENCES "public"."User" ("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- AddForeignKey: link UserTopic.topicId → Topic.id
ALTER TABLE "public"."UserTopic"
  ADD CONSTRAINT "UserTopic_topicId_fkey"
  FOREIGN KEY ("topicId")
  REFERENCES "public"."Topic" ("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

