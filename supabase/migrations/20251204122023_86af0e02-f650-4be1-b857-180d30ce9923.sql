-- Add personal information columns to staff_members table
ALTER TABLE public.staff_members
ADD COLUMN email text,
ADD COLUMN phone text,
ADD COLUMN address text,
ADD COLUMN city text,
ADD COLUMN postal_code text,
ADD COLUMN emergency_contact_name text,
ADD COLUMN emergency_contact_phone text,
ADD COLUMN date_of_birth date,
ADD COLUMN hire_date date DEFAULT CURRENT_DATE;