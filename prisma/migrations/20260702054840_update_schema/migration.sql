-- AlterTable
ALTER TABLE "Route" ALTER COLUMN "imageUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "RouteLocation" ADD COLUMN     "arrivalTime" TEXT,
ADD COLUMN     "durationMinutes" INTEGER;
