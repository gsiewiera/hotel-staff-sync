-- Drop the old unique constraint if it exists
ALTER TABLE shift_schedules DROP CONSTRAINT IF EXISTS shift_schedules_staff_week_unique;

-- Add a new unique constraint that includes day_of_week
-- This allows the same staff member to work multiple days in the same week
ALTER TABLE shift_schedules 
ADD CONSTRAINT shift_schedules_staff_day_week_unique 
UNIQUE (staff_id, day_of_week, week_number, year);