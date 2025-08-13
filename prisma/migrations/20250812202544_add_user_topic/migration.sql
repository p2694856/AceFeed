-- DropForeignKey
ALTER TABLE "public"."UserTopic" DROP CONSTRAINT "UserTopic_topicId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserTopic" DROP CONSTRAINT "UserTopic_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."UserTopic" ADD CONSTRAINT "UserTopic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserTopic" ADD CONSTRAINT "UserTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
