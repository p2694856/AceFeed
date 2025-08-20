-- CreateTable
CREATE TABLE "public"."ProxyAccount" (
    "id" SERIAL NOT NULL,
    "fbPageId" TEXT NOT NULL,
    "igBusinessId" TEXT,
    "accessToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProxyAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProxyAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "proxyId" INTEGER NOT NULL,

    CONSTRAINT "ProxyAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProxyAccount_fbPageId_key" ON "public"."ProxyAccount"("fbPageId");

-- CreateIndex
CREATE UNIQUE INDEX "ProxyAssignment_userId_proxyId_key" ON "public"."ProxyAssignment"("userId", "proxyId");

-- AddForeignKey
ALTER TABLE "public"."ProxyAssignment" ADD CONSTRAINT "ProxyAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProxyAssignment" ADD CONSTRAINT "ProxyAssignment_proxyId_fkey" FOREIGN KEY ("proxyId") REFERENCES "public"."ProxyAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
