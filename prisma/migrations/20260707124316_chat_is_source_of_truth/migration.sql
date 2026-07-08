/*
  Warnings:

  - A unique constraint covering the columns `[routeId]` on the table `ChatSession` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ChatSession" ALTER COLUMN "routeId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ChatSession_routeId_key" ON "ChatSession"("routeId");
