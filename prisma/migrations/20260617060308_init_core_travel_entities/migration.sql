/*
  Warnings:

  - You are about to drop the column `historyContext` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `startCity` on the `Route` table. All the data in the column will be lost.
  - The primary key for the `RouteLocation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[title]` on the table `Location` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[routeId,locationId]` on the table `RouteLocation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `loreContext` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shortContext` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chatId` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Route` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RouteStatus" AS ENUM ('DRAFT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT');

-- AlterEnum
ALTER TYPE "LocationType" ADD VALUE 'ACTIVITY';

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "historyContext",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isFree" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "loreContext" TEXT NOT NULL,
ADD COLUMN     "priceValue" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "shortContext" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Route" DROP COLUMN "description",
DROP COLUMN "imageUrl",
DROP COLUMN "startCity",
ADD COLUMN     "chatId" TEXT NOT NULL,
ADD COLUMN     "status" "RouteStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "RouteLocation" DROP CONSTRAINT "RouteLocation_pkey",
ADD COLUMN     "aiNote" TEXT,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "RouteLocation_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL,
    "userId" INTEGER,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "chatId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_title_key" ON "Location"("title");

-- CreateIndex
CREATE UNIQUE INDEX "RouteLocation_routeId_locationId_key" ON "RouteLocation"("routeId", "locationId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
