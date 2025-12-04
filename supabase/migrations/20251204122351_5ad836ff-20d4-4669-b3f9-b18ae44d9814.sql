-- Create enum for time-off request status
CREATE TYPE public.time_off_status AS ENUM ('pending', 'approved', 'rejected');

-- Create enum for day of week
CREATE TYPE public.day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- Staff availability preferences (recurring weekly)
CREATE TABLE public.staff_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  day_of_week day_of_week NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  preferred_shift TEXT,
  start_time TIME,
  end_time TIME,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(staff_id, day_of_week)
);

-- Time-off requests
CREATE TABLE public.time_off_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status time_off_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staff_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for staff_availability
CREATE POLICY "Allow public read access to staff_availability"
ON public.staff_availability FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to staff_availability"
ON public.staff_availability FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to staff_availability"
ON public.staff_availability FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to staff_availability"
ON public.staff_availability FOR DELETE USING (true);

-- RLS policies for time_off_requests
CREATE POLICY "Allow public read access to time_off_requests"
ON public.time_off_requests FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to time_off_requests"
ON public.time_off_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to time_off_requests"
ON public.time_off_requests FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to time_off_requests"
ON public.time_off_requests FOR DELETE USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_staff_availability_updated_at
BEFORE UPDATE ON public.staff_availability
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_off_requests_updated_at
BEFORE UPDATE ON public.time_off_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();