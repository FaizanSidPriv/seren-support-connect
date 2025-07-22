-- Create activity logs table for tracking user activities
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  activity_description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own activity logs
CREATE POLICY "Users can manage their own activity logs" 
ON public.activity_logs 
FOR ALL
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_activity_logs_user_id_created_at ON public.activity_logs (user_id, created_at DESC);
CREATE INDEX idx_activity_logs_activity_type ON public.activity_logs (activity_type);