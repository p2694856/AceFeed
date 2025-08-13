-- AlterTable
ALTER TABLE "public"."Post" ADD COLUMN     "topicId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
