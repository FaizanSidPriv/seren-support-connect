import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Calendar, Heart, MessageCircle, TrendingUp, Award, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useActivityTracker } from "@/components/ActivityTracker";

interface ProgressStats {
  routinesCompleted: number;
  emotionsLogged: number;
  aacUsage: number;
  streakDays: number;
  totalActivities: number;
}

export default function Progress() {
  const [stats, setStats] = useState<ProgressStats>({
    routinesCompleted: 0,
    emotionsLogged: 0,
    aacUsage: 0,
    streakDays: 0,
    totalActivities: 0,
  });
  const [loading, setLoading] = useState(true);
  const { logActivity } = useActivityTracker();

  useEffect(() => {
    fetchProgressData();
    logActivity('progress_view', 'Viewed progress dashboard');
  }, [logActivity]);

  const fetchProgressData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch routine completions for current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: routineCompletions } = await supabase
        .from('routine_completions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', startOfMonth.toISOString());

      // Fetch emotion logs for current month
      const { data: emotionLogs } = await supabase
        .from('emotion_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', startOfMonth.toISOString());

      // Fetch AAC usage for current month
      const { data: aacUsage } = await supabase
        .from('aac_usage_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('used_at', startOfMonth.toISOString());

      // Fetch total activities
      const { data: activities } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      setStats({
        routinesCompleted: routineCompletions?.length || 0,
        emotionsLogged: emotionLogs?.length || 0,
        aacUsage: aacUsage?.length || 0,
        streakDays: calculateStreak(activities || []),
        totalActivities: activities?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (activities: any[]) => {
    // Simple streak calculation - consecutive days with activities
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);

    while (currentDate >= new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)) {
      const dayActivities = activities.filter(activity => {
        const activityDate = new Date(activity.created_at);
        return activityDate.toDateString() === currentDate.toDateString();
      });

      if (dayActivities.length > 0) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const achievements = [
    { name: "First Step", description: "Completed your first routine", icon: Target, unlocked: stats.routinesCompleted > 0 },
    { name: "Emotion Explorer", description: "Logged 10 emotions", icon: Heart, unlocked: stats.emotionsLogged >= 10 },
    { name: "Communicator", description: "Used AAC board 5 times", icon: MessageCircle, unlocked: stats.aacUsage >= 5 },
    { name: "Week Warrior", description: "7-day activity streak", icon: Award, unlocked: stats.streakDays >= 7 },
  ];

  const progressGoals = [
    { name: "Daily Routines", current: stats.routinesCompleted, target: 30, icon: Calendar, color: "bg-primary" },
    { name: "Emotion Check-ins", current: stats.emotionsLogged, target: 20, icon: Heart, color: "bg-accent" },
    { name: "Communication", current: stats.aacUsage, target: 15, icon: MessageCircle, color: "bg-secondary" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="card-modern animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Progress Tracking</h1>
          <p className="text-muted-foreground">See how you're doing this month</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Routines</p>
                <p className="text-2xl font-bold text-foreground">{stats.routinesCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Emotions</p>
                <p className="text-2xl font-bold text-foreground">{stats.emotionsLogged}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-secondary-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">AAC Uses</p>
                <p className="text-2xl font-bold text-foreground">{stats.aacUsage}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-warning-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold text-foreground">{stats.streakDays} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="goals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="goals">Goals & Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {progressGoals.map((goal) => (
              <Card key={goal.name} className="card-modern">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${goal.color}/10 flex items-center justify-center`}>
                      <goal.icon className={`w-5 h-5 text-${goal.color.replace('bg-', '')}`} />
                    </div>
                    <CardTitle className="text-lg">{goal.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{goal.current}/{goal.target}</span>
                    </div>
                    <ProgressBar
                      value={(goal.current / goal.target) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {Math.max(0, goal.target - goal.current)} more to reach your goal!
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((achievement) => (
              <Card key={achievement.name} className={`card-modern ${achievement.unlocked ? 'ring-2 ring-primary/20' : 'opacity-60'}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg ${achievement.unlocked ? 'bg-primary' : 'bg-muted'} flex items-center justify-center`}>
                      <achievement.icon className={`w-6 h-6 ${achievement.unlocked ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {achievement.name}
                        {achievement.unlocked && (
                          <Badge variant="secondary" className="text-xs">
                            Unlocked
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{achievement.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}