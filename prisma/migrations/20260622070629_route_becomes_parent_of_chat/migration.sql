/*
  Warnings:

  - You are about to drop the column `userId` on the `ChatSession` table. All the data in the column will be lost.
  - You are about to drop the column `chatId` on the `Route` table. All the data in the column will be lost.
  - Added the required column `routeId` to the `ChatSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Route` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Route" DROP CONSTRAINT "Route_chatId_fkey";

-- AlterTable
ALTER TABLE "ChatSession" DROP COLUMN "userId",
ADD COLUMN     "routeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Route" DROP COLUMN "chatId",
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;
