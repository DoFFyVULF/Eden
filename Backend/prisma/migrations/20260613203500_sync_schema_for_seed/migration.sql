-- Keep production databases created from older migrations in sync with the
-- current Prisma schema before the automatic Docker seed runs.

ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'master';

ALTER TABLE "category"
ADD COLUMN IF NOT EXISTS "description" TEXT NOT NULL DEFAULT '';

ALTER TABLE "category"
ALTER COLUMN "description" DROP DEFAULT;

ALTER TABLE "service_price"
ADD COLUMN IF NOT EXISTS "duration_override" INTEGER;

ALTER TABLE "service"
ALTER COLUMN "description" DROP NOT NULL;

ALTER TABLE "master_schedule"
ALTER COLUMN "day_of_week" DROP NOT NULL;

CREATE TABLE IF NOT EXISTS "master_time_off" (
    "id" SERIAL NOT NULL,
    "masterId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_time_off_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "appointment_history" (
    "id" SERIAL NOT NULL,
    "appointment_id" INTEGER NOT NULL,
    "client_surname" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "client_phone" TEXT NOT NULL,
    "master_id" INTEGER NOT NULL,
    "service_id" INTEGER NOT NULL,
    "appointment_time" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "master_schedule_suggestion" (
    "id" SERIAL NOT NULL,
    "master_id" INTEGER NOT NULL,
    "target_schedule_id" INTEGER,
    "dayOfWeek" INTEGER,
    "date" TIMESTAMP(3),
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "masterScheduleId" INTEGER,

    CONSTRAINT "master_schedule_suggestion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "appointment_history_master_id_idx" ON "appointment_history"("master_id");
CREATE INDEX IF NOT EXISTS "appointment_history_service_id_idx" ON "appointment_history"("service_id");
CREATE INDEX IF NOT EXISTS "appointment_history_appointment_id_idx" ON "appointment_history"("appointment_id");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'master_time_off_masterId_fkey') THEN
        ALTER TABLE "master_time_off"
        ADD CONSTRAINT "master_time_off_masterId_fkey"
        FOREIGN KEY ("masterId") REFERENCES "master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointment_history_appointment_id_fkey') THEN
        ALTER TABLE "appointment_history"
        ADD CONSTRAINT "appointment_history_appointment_id_fkey"
        FOREIGN KEY ("appointment_id") REFERENCES "appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointment_history_master_id_fkey') THEN
        ALTER TABLE "appointment_history"
        ADD CONSTRAINT "appointment_history_master_id_fkey"
        FOREIGN KEY ("master_id") REFERENCES "master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointment_history_service_id_fkey') THEN
        ALTER TABLE "appointment_history"
        ADD CONSTRAINT "appointment_history_service_id_fkey"
        FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'master_schedule_suggestion_master_id_fkey') THEN
        ALTER TABLE "master_schedule_suggestion"
        ADD CONSTRAINT "master_schedule_suggestion_master_id_fkey"
        FOREIGN KEY ("master_id") REFERENCES "master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'master_schedule_suggestion_target_schedule_id_fkey') THEN
        ALTER TABLE "master_schedule_suggestion"
        ADD CONSTRAINT "master_schedule_suggestion_target_schedule_id_fkey"
        FOREIGN KEY ("target_schedule_id") REFERENCES "master_schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'master_schedule_suggestion_masterScheduleId_fkey') THEN
        ALTER TABLE "master_schedule_suggestion"
        ADD CONSTRAINT "master_schedule_suggestion_masterScheduleId_fkey"
        FOREIGN KEY ("masterScheduleId") REFERENCES "master_schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
