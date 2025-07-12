/*
  Warnings:

  - You are about to drop the column `blog_id` on the `Bookmarks` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Bookmarks` table. All the data in the column will be lost.
  - You are about to drop the `engagement` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Bookmarks` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Bookmarks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Bookmarks" DROP CONSTRAINT "Bookmarks_user_id_fkey";

-- DropForeignKey
ALTER TABLE "engagement" DROP CONSTRAINT "engagement_followerId_fkey";

-- DropForeignKey
ALTER TABLE "engagement" DROP CONSTRAINT "engagement_followingId_fkey";

-- DropIndex
DROP INDEX "Bookmarks_user_id_blog_id_key";

-- DropIndex
DROP INDEX "Bookmarks_user_id_key";

-- AlterTable
ALTER TABLE "Bookmarks" DROP COLUMN "blog_id",
DROP COLUMN "user_id",
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "engagement";

-- CreateTable
CREATE TABLE "UserInfo" (
    "id" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "tech" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogBookmark" (
    "id" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "bookmarkId" TEXT NOT NULL,

    CONSTRAINT "BlogBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Engagement" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,

    CONSTRAINT "Engagement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserInfo_userId_key" ON "UserInfo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogBookmark_blogId_bookmarkId_key" ON "BlogBookmark"("blogId", "bookmarkId");

-- CreateIndex
CREATE INDEX "Engagement_followerId_idx" ON "Engagement"("followerId");

-- CreateIndex
CREATE INDEX "Engagement_followingId_idx" ON "Engagement"("followingId");

-- CreateIndex
CREATE UNIQUE INDEX "Engagement_followerId_followingId_key" ON "Engagement"("followerId", "followingId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmarks_userId_key" ON "Bookmarks"("userId");

-- AddForeignKey
ALTER TABLE "UserInfo" ADD CONSTRAINT "UserInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmarks" ADD CONSTRAINT "Bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogBookmark" ADD CONSTRAINT "BlogBookmark_bookmarkId_fkey" FOREIGN KEY ("bookmarkId") REFERENCES "Bookmarks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Engagement" ADD CONSTRAINT "Engagement_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Engagement" ADD CONSTRAINT "Engagement_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
