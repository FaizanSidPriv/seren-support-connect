import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useActivityTracker } from '@/components/ActivityTracker';
import { useToast } from '@/hooks/use-toast';
import { Heart, Smile, Frown, Meh, ArrowLeft, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const emotions = [
  { name: 'happy', icon: Smile, color: 'text-green-500', bg: 'bg-green-50 hover:bg-green-100' },
  { name: 'sad', icon: Frown, color: 'text-blue-500', bg: 'bg-blue-50 hover:bg-blue-100' },
  { name: 'neutral', icon: Meh, color: 'text-gray-500', bg: 'bg-gray-50 hover:bg-gray-100' },
  { name: 'excited', icon: Heart, color: 'text-red-500', bg: 'bg-red-50 hover:bg-red-100' },
  { name: 'anxious', icon: TrendingUp, color: 'text-yellow-500', bg: 'bg-yellow-50 hover:bg-yellow-100' },
];

interface EmotionLog {
  id: string;
  emotion: string;
  logged_at: string;
}

export default function EmotionLogger() {
  const [emotionLogs, setEmotionLogs] = useState<EmotionLog[]>([]);
  const [userId, setUserId] = useState<string>('');
  const { logActivity } = useActivityTracker(userId);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await fetchEmotionLogs(user.id);
      }
    };
    getUser();
  }, []);

  const fetchEmotionLogs = async (uid: string) => {
    const { data, error } = await supabase
      .from('emotion_logs')
      .select('*')
      .eq('user_id', uid)
      .order('logged_at', { ascending: false })
      .limit(20);

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch emotion logs' });
    } else {
      setEmotionLogs(data || []);
    }
  };

  const logEmotion = async (emotion: string) => {
    const { error } = await supabase.from('emotion_logs').insert({
      user_id: userId,
      emotion
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to log emotion' });
    } else {
      await logActivity('emotion_logged', `Logged emotion: ${emotion}`);
      toast({ title: 'Emotion logged', description: `You're feeling ${emotion} today` });
      await fetchEmotionLogs(userId);
    }
  };

  const getEmotionConfig = (emotionName: string) => {
    return emotions.find(e => e.name === emotionName) || emotions[2];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-gradient">Emotion Logger</h1>
              <p className="text-muted-foreground mt-2">Track your feelings and emotions</p>
            </div>
          </div>
        </div>

        <Card className="card-modern mb-8">
          <CardHeader>
            <CardTitle>How are you feeling today?</CardTitle>
            <CardDescription>Select an emotion to log how you're feeling right now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {emotions.map((emotion) => {
                const Icon = emotion.icon;
                return (
                  <Button
                    key={emotion.name}
                    variant="outline"
                    className={`h-24 flex flex-col gap-2 ${emotion.bg} border-2 hover:border-primary transition-all duration-300`}
                    onClick={() => logEmotion(emotion.name)}
                  >
                    <Icon className={`w-8 h-8 ${emotion.color}`} />
                    <span className="capitalize font-medium">{emotion.name}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader>
            <CardTitle>Recent Emotion Logs</CardTitle>
            <CardDescription>Your emotional journey over time</CardDescription>
          </CardHeader>
          <CardContent>
            {emotionLogs.length > 0 ? (
              <div className="space-y-3">
                {emotionLogs.map((log) => {
                  const emotionConfig = getEmotionConfig(log.emotion);
                  const Icon = emotionConfig.icon;
                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${emotionConfig.bg}`}>
                          <Icon className={`w-5 h-5 ${emotionConfig.color}`} />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{log.emotion}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(log.logged_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No emotions logged yet</h3>
                <p className="text-muted-foreground">Start tracking your emotions above</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}