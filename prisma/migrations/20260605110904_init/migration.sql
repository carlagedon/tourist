-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('SIGHTSEEING', 'FOOD', 'HOTEL');

-- CreateTable
CREATE TABLE "Route" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "startCity" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "type" "LocationType" NOT NULL,
    "historyContext" TEXT NOT NULL,
    "coords" geometry(Point, 4326) NOT NULL,
    "embedding" vector(1024),

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteLocation" (
    "routeId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "stepOrder" INTEGER NOT NULL,

    CONSTRAINT "RouteLocation_pkey" PRIMARY KEY ("routeId","locationId")
);

-- AddForeignKey
ALTER TABLE "RouteLocation" ADD CONSTRAINT "RouteLocation_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteLocation" ADD CONSTRAINT "RouteLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
