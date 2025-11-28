-- Create staff members table with hourly rates
CREATE TABLE IF NOT EXISTS public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department TEXT NOT NULL CHECK (department IN ('frontdesk', 'housekeeping', 'maintenance', 'restaurant')),
  hourly_rate DECIMAL(10, 2) NOT NULL DEFAULT 15.00,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create shift schedules table
CREATE TABLE IF NOT EXISTS public.shift_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES public.staff_members(id) ON DELETE CASCADE NOT NULL,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  shift_type TEXT NOT NULL CHECK (shift_type IN ('Morning', 'Day', 'Evening', 'Night', 'Split')),
  hours DECIMAL(4, 2) NOT NULL DEFAULT 8.00,
  week_number INTEGER NOT NULL DEFAULT EXTRACT(WEEK FROM CURRENT_DATE),
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create budgets table for tracking department budgets
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department TEXT NOT NULL CHECK (department IN ('frontdesk', 'housekeeping', 'maintenance', 'restaurant', 'overall')),
  weekly_budget DECIMAL(12, 2) NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(department, month, year)
);

-- Enable RLS
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
CREATE POLICY "Allow public read access to staff_members"
  ON public.staff_members FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to staff_members"
  ON public.staff_members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to staff_members"
  ON public.staff_members FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete access to staff_members"
  ON public.staff_members FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to shift_schedules"
  ON public.shift_schedules FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to shift_schedules"
  ON public.shift_schedules FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to shift_schedules"
  ON public.shift_schedules FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete access to shift_schedules"
  ON public.shift_schedules FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to budgets"
  ON public.budgets FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to budgets"
  ON public.budgets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to budgets"
  ON public.budgets FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete access to budgets"
  ON public.budgets FOR DELETE
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for staff_members
CREATE TRIGGER update_staff_members_updated_at
  BEFORE UPDATE ON public.staff_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample staff data with hourly rates
INSERT INTO public.staff_members (name, department, hourly_rate, avatar) VALUES
  ('Sarah Johnson', 'frontdesk', 18.50, 'SJ'),
  ('Michael Chen', 'frontdesk', 17.00, 'MC'),
  ('Emma Williams', 'housekeeping', 15.50, 'EW'),
  ('James Martinez', 'housekeeping', 16.00, 'JM'),
  ('Lisa Anderson', 'maintenance', 22.00, 'LA'),
  ('David Thompson', 'restaurant', 16.50, 'DT'),
  ('Sophie Brown', 'restaurant', 17.50, 'SB'),
  ('Ryan Davis', 'frontdesk', 19.00, 'RD');

-- Insert sample budget data
INSERT INTO public.budgets (department, weekly_budget, month, year) VALUES
  ('frontdesk', 3500.00, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
  ('housekeeping', 2800.00, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
  ('maintenance', 2200.00, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
  ('restaurant', 3000.00, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
  ('overall', 11500.00, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER);