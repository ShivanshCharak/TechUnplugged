/*
  Warnings:

  - The `blog_id` column on the `Bookmarks` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Blogs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blogs_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tags` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `Bookmarks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `engagement` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `engagement` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Blogs" DROP CONSTRAINT "Blogs_author_id_fkey";

-- DropForeignKey
ALTER TABLE "Bookmarks" DROP CONSTRAINT "Bookmarks_blog_id_fkey";

-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_blog_id_fkey";

-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_blog_id_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_user_id_fkey";

-- DropForeignKey
ALTER TABLE "blogs_tags" DROP CONSTRAINT "blogs_tags_blog_id_fkey";

-- DropForeignKey
ALTER TABLE "blogs_tags" DROP CONSTRAINT "blogs_tags_tag_id_fkey";

-- DropIndex
DROP INDEX "engagement_followerId_followingId_key";

-- AlterTable
ALTER TABLE "Bookmarks" DROP COLUMN "blog_id",
ADD COLUMN     "blog_id" TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "is_premium" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "engagement" ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Blogs";

-- DropTable
DROP TABLE "Comments";

-- DropTable
DROP TABLE "Reaction";

-- DropTable
DROP TABLE "blogs_tags";

-- DropTable
DROP TABLE "tags";

-- CreateIndex
CREATE UNIQUE INDEX "Bookmarks_user_id_key" ON "Bookmarks"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmarks_user_id_blog_id_key" ON "Bookmarks"("user_id", "blog_id");

-- CreateIndex
CREATE UNIQUE INDEX "engagement_userId_key" ON "engagement"("userId");

-- CreateIndex
CREATE INDEX "engagement_userId_idx" ON "engagement"("userId");
