-- CreateTable
CREATE TABLE "FavoriteSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'wallet',
    "currencyCodes" TEXT[],
    "baseCurrency" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FavoriteSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateSnapshot" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "base" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "date" DATE NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "theme" TEXT NOT NULL DEFAULT 'system',
    "mainCurrency" TEXT NOT NULL DEFAULT 'USD',
    "defaultSetId" TEXT,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RateSnapshot_code_base_date_key" ON "RateSnapshot"("code", "base", "date");
