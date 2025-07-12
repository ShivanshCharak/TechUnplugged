/*
  Warnings:

  - You are about to drop the `BlogBookmark` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BlogBookmark" DROP CONSTRAINT "BlogBookmark_bookmarkId_fkey";

-- AlterTable
ALTER TABLE "Bookmarks" ADD COLUMN     "blogsId" TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "BlogBookmark";

-- CreateTable
CREATE TABLE "BlogMeta" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "info" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "image" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL,

    CONSTRAINT "BlogMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Draft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,

    CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_materialized_view" (
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isPremium" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "blogId" TEXT NOT NULL,
    "bookmarksId" TEXT NOT NULL,
    "draftsId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "feed_materialized_view" (
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isPremium" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "blogId" TEXT NOT NULL,
    "bookmarksId" TEXT NOT NULL,
    "draftsId" TEXT NOT NULL,
    "views" INTEGER NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Draft_userId_key" ON "Draft"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Draft_userId_blogId_key" ON "Draft"("userId", "blogId");

-- AddForeignKey
ALTER TABLE "BlogMeta" ADD CONSTRAINT "BlogMeta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
