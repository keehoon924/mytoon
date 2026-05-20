-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('PROJECT', 'CHARACTER');
CREATE TYPE "ReportReason" AS ENUM ('SPAM', 'ADULT', 'VIOLENCE', 'COPYRIGHT', 'OTHER');
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'RESOLVED_DELETED', 'RESOLVED_DISMISSED', 'RESOLVED_HOLD');

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetType" "ReportTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "detail" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Report_reporterId_targetType_targetId_key"
  ON "Report"("reporterId", "targetType", "targetId");
CREATE INDEX "Report_status_idx" ON "Report"("status");
CREATE INDEX "Report_targetType_targetId_idx" ON "Report"("targetType", "targetId");

ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey"
  FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_resolvedById_fkey"
  FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
