/*
  Warnings:

  - You are about to drop the column `searchVector` on the `Blog` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Blog_searchVector_idx";

-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "searchVector";
