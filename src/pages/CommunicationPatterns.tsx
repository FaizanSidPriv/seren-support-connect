import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  MessageCircle, 
  Heart, 
  Calendar,
  Clock,
  Users,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useActivityTracker } from "@/components/ActivityTracker";

interface CommunicationData {
  aacUsage: any[];
  emotionLogs: any[];
  routineCompletions: any[];
  activityLogs: any[];
}

interface AnalyticsData {
  mostUsedPhrases: { phrase: string; count: number }[];
  emotionTrends: { emotion: string; count: number; trend: 'up' | 'down' | 'stable' }[];
  dailyActivity: { date: string; activities: number }[];
  peakHours: { hour: number; activities: number }[];
}

export default function CommunicationPatterns() {
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("7d");
  const [data, setData] = useState<CommunicationData>({
    aacUsage: [],
    emotionLogs: [],
    routineCompletions: [],
    activityLogs: []
  });
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    mostUsedPhrases: [],
    emotionTrends: [],
    dailyActivity: [],
    peakHours: []
  });
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const { trackActivity } = useActivityTracker();

  useEffect(() => {
    fetchCommunicationData();
    trackActivity('communication_patterns_view', 'Viewed communication patterns dashboard');
  }, [selectedUser, timeRange, trackActivity]);

  const fetchCommunicationData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user is caregiver
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'caregiver') {
        setLoading(false);
        return;
      }

      // Fetch caregiver's users
      const { data: relationships } = await supabase
        .from('caregiver_relationships')
        .select('user_id, profiles!inner(*)')
        .eq('caregiver_id', user.id);

      if (relationships) {
        setUsers(relationships.map(r => r.profiles));
      }

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      startDate.setDate(endDate.getDate() - days);

      // Build user filter
      const userIds = selectedUser === 'all' 
        ? relationships?.map(r => r.user_id) || []
        : [selectedUser];

      if (userIds.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch AAC usage
      const { data: aacUsage } = await supabase
        .from('aac_usage_logs')
        .select('*')
        .in('user_id', userIds)
        .gte('used_at', startDate.toISOString())
        .lte('used_at', endDate.toISOString());

      // Fetch emotion logs
      const { data: emotionLogs } = await supabase
        .from('emotion_logs')
        .select('*')
        .in('user_id', userIds)
        .gte('logged_at', startDate.toISOString())
        .lte('logged_at', endDate.toISOString());

      // Fetch routine completions
      const { data: routineCompletions } = await supabase
        .from('routine_completions')
        .select('*')
        .in('user_id', userIds)
        .gte('completed_at', startDate.toISOString())
        .lte('completed_at', endDate.toISOString());

      // Fetch activity logs
      const { data: activityLogs } = await supabase
        .from('activity_logs')
        .select('*')
        .in('user_id', userIds)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      setData({
        aacUsage: aacUsage || [],
        emotionLogs: emotionLogs || [],
        routineCompletions: routineCompletions || [],
        activityLogs: activityLogs || []
      });

      // Process analytics
      processAnalytics({
        aacUsage: aacUsage || [],
        emotionLogs: emotionLogs || [],
        routineCompletions: routineCompletions || [],
        activityLogs: activityLogs || []
      });

    } catch (error) {
      console.error('Error fetching communication data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalytics = (data: CommunicationData) => {
    // Most used phrases (placeholder - would need AAC metadata)
    const mostUsedPhrases = [
      { phrase: "I need help", count: 12 },
      { phrase: "I'm hungry", count: 8 },
      { phrase: "Thank you", count: 15 },
      { phrase: "I feel good", count: 6 }
    ];

    // Emotion trends
    const emotionCounts = data.emotionLogs.reduce((acc, log) => {
      acc[log.emotion] = (acc[log.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const emotionTrends = Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      count,
      trend: 'stable' as const // Placeholder - would calculate actual trend
    }));

    // Daily activity
    const dailyActivity = data.activityLogs.reduce((acc, log) => {
      const date = new Date(log.created_at).toISOString().split('T')[0];
      const existing = acc.find(d => d.date === date);
      if (existing) {
        existing.activities++;
      } else {
        acc.push({ date, activities: 1 });
      }
      return acc;
    }, [] as { date: string; activities: number }[]);

    // Peak hours
    const hourCounts = data.activityLogs.reduce((acc, log) => {
      const hour = new Date(log.created_at).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const peakHours = Object.entries(hourCounts)
      .map(([hour, activities]) => ({ hour: parseInt(hour), activities }))
      .sort((a, b) => b.activities - a.activities)
      .slice(0, 5);

    setAnalytics({
      mostUsedPhrases,
      emotionTrends,
      dailyActivity,
      peakHours
    });
  };

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Communication Patterns</h1>
            <p className="text-muted-foreground">Analyze communication trends and behaviors</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">AAC Uses</p>
                <p className="text-2xl font-bold text-foreground">{data.aacUsage.length}</p>
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
                <p className="text-2xl font-bold text-foreground">{data.emotionLogs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-secondary-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Routines</p>
                <p className="text-2xl font-bold text-foreground">{data.routineCompletions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-warning-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Activities</p>
                <p className="text-2xl font-bold text-foreground">{data.activityLogs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="phrases" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="phrases">AAC Phrases</TabsTrigger>
          <TabsTrigger value="emotions">Emotion Trends</TabsTrigger>
          <TabsTrigger value="activity">Daily Activity</TabsTrigger>
          <TabsTrigger value="patterns">Time Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="phrases" className="space-y-6">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>Most Used AAC Phrases</CardTitle>
              <CardDescription>
                Common communication patterns and frequency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.mostUsedPhrases.map((phrase, index) => (
                  <div key={phrase.phrase} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <span className="font-medium">{phrase.phrase}</span>
                    </div>
                    <Badge variant="secondary">{phrase.count} uses</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emotions" className="space-y-6">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>Emotion Trends</CardTitle>
              <CardDescription>
                Emotional patterns and frequency over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.emotionTrends.map((emotion) => (
                  <div key={emotion.emotion} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-accent" />
                      <span className="font-medium capitalize">{emotion.emotion}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{emotion.count} times</Badge>
                      <TrendingUp className={`w-4 h-4 ${
                        emotion.trend === 'up' ? 'text-success' : 
                        emotion.trend === 'down' ? 'text-destructive' : 
                        'text-muted-foreground'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>Daily Activity Overview</CardTitle>
              <CardDescription>
                Activity levels throughout the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.dailyActivity.map((day) => (
                  <div key={day.date} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="font-medium">{new Date(day.date).toLocaleDateString()}</span>
                    </div>
                    <Badge variant="secondary">{day.activities} activities</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>Peak Activity Hours</CardTitle>
              <CardDescription>
                Times of day with highest activity levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.peakHours.map((hour) => (
                  <div key={hour.hour} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-secondary-foreground" />
                      <span className="font-medium">
                        {hour.hour}:00 - {hour.hour + 1}:00
                      </span>
                    </div>
                    <Badge variant="secondary">{hour.activities} activities</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}