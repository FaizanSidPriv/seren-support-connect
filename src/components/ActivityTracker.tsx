import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ActivityTrackerProps {
  userId: string;
}

export function useActivityTracker(userId: string) {
  const logActivity = async (
    activityType: string,
    description: string,
    metadata: Record<string, any> = {}
  ) => {
    try {
      await supabase.from('activity_logs').insert({
        user_id: userId,
        activity_type: activityType,
        activity_description: description,
        metadata
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  return { logActivity };
}

export default function ActivityTracker({ userId }: ActivityTrackerProps) {
  return null; // This is a utility component
}