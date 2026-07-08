/*
  Warnings:

  - The `tags` column on the `Location` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "LocationTag" AS ENUM ('NATURE', 'LAKE', 'MEAT', 'FAMILY', 'ACTIVE', 'HISTORY', 'CHEAP', 'LUXURY');

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "tags",
ADD COLUMN     "tags" "LocationTag"[];
