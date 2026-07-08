/*
  Warnings:

  - You are about to drop the column `description` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Route` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ChatSession_routeId_key";

-- AlterTable
ALTER TABLE "Route" DROP COLUMN "description",
DROP COLUMN "imageUrl";
