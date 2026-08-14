-- Additive lifecycle fields for archive, do-not-contact, and public response tokens.
-- Existing opportunity rows are preserved. New columns are nullable or have defaults.

ALTER TABLE "Opportunity" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "Opportunity" ADD COLUMN "doNotContact" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Opportunity" ADD COLUMN "optOutReason" TEXT;
ALTER TABLE "Opportunity" ADD COLUMN "optOutAt" TIMESTAMP(3);
ALTER TABLE "Opportunity" ADD COLUMN "optOutSource" TEXT;
ALTER TABLE "Opportunity" ADD COLUMN "publicResponseToken" TEXT;

CREATE UNIQUE INDEX "Opportunity_publicResponseToken_key" ON "Opportunity"("publicResponseToken");
CREATE INDEX "Opportunity_organizationId_archivedAt_idx" ON "Opportunity"("organizationId", "archivedAt");
CREATE INDEX "Opportunity_organizationId_doNotContact_idx" ON "Opportunity"("organizationId", "doNotContact");
