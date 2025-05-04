-- AlterTable
ALTER TABLE "user_invoices" ALTER COLUMN "plan" DROP NOT NULL,
ALTER COLUMN "recurring" DROP NOT NULL,
ALTER COLUMN "reason" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "user_invoices_user_id_idx" ON "user_invoices"("user_id");
