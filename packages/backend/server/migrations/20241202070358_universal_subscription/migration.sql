-- DropForeignKey
ALTER TABLE "user_invoices" DROP CONSTRAINT "user_invoices_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_subscriptions" DROP CONSTRAINT "user_subscriptions_user_id_fkey";

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" SERIAL NOT NULL,
    "target_id" VARCHAR NOT NULL,
    "plan" VARCHAR(20) NOT NULL,
    "recurring" VARCHAR(20) NOT NULL,
    "variant" VARCHAR(20),
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "stripe_subscription_id" TEXT,
    "stripe_schedule_id" VARCHAR,
    "status" VARCHAR(20) NOT NULL,
    "start" TIMESTAMPTZ(3) NOT NULL,
    "end" TIMESTAMPTZ(3),
    "next_bill_at" TIMESTAMPTZ(3),
    "canceled_at" TIMESTAMPTZ(3),
    "trial_start" TIMESTAMPTZ(3),
    "trial_end" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "stripe_invoice_id" TEXT NOT NULL,
    "target_id" VARCHAR NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "reason" VARCHAR,
    "last_payment_error" TEXT,
    "link" TEXT,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("stripe_invoice_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_target_id_plan_key" ON "subscriptions"("target_id", "plan");

-- CreateIndex
CREATE INDEX "invoices_target_id_idx" ON "invoices"("target_id");
