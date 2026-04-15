-- Speed up the admin reservation list, which filters by status + date and
-- may look up by email or eventId.
CREATE INDEX IF NOT EXISTS "Reservation_status_date_idx" ON "Reservation" ("status", "date");
CREATE INDEX IF NOT EXISTS "Reservation_date_idx" ON "Reservation" ("date");
CREATE INDEX IF NOT EXISTS "Reservation_email_idx" ON "Reservation" ("email");
CREATE INDEX IF NOT EXISTS "Reservation_eventId_idx" ON "Reservation" ("eventId");
