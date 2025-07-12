-- AlterTable
ALTER TABLE "UserInfo" ALTER COLUMN "avatar" DROP NOT NULL,
ALTER COLUMN "intro" DROP NOT NULL,
ALTER COLUMN "tech" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "UserInfo_userId_idx" ON "UserInfo"("userId");
