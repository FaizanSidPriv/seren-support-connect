import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Calendar, Brain, MessageCircle, TrendingUp, Users, Settings, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'user' | 'caregiver';
  age_group: 'child' | 'adult' | null;
  onboarding_completed: boolean;
  preferences: any;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate('/auth');
        } else if (session.user) {
          // Defer profile fetching to prevent deadlocks
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate('/auth');
      } else {
        fetchUserProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      // Clean up auth state
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Ignore errors
      }
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      
      // Force page reload for clean state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-primary-foreground animate-pulse" />
          </div>
          <p className="text-gentle">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const userFeatures = [
    {
      title: "Routine Planner",
      description: "Create and track daily routines with gentle reminders",
      icon: Calendar,
      color: "bg-primary/10 text-primary",
      path: "/routines"
    },
    {
      title: "Emotion Logger",
      description: "Track your feelings and emotional patterns",
      icon: Heart,
      color: "bg-success/10 text-success",
      path: "/emotions"
    },
    {
      title: "AAC Communication",
      description: "Build sentences using word boards",
      icon: MessageCircle,
      color: "bg-warning/10 text-warning",
      path: "/communication"
    },
    {
      title: "Pattern Tracker",
      description: "View insights about your behaviors and progress",
      icon: TrendingUp,
      color: "bg-destructive/10 text-destructive",
      path: "/patterns"
    }
  ];

  const caregiverFeatures = [
    {
      title: "User Dashboard",
      description: "Monitor connected users and their activities",
      icon: Users,
      color: "bg-primary/10 text-primary",
      path: "/users"
    },
    {
      title: "Insights & Alerts",
      description: "Real-time summaries and behavioral alerts",
      icon: TrendingUp,
      color: "bg-success/10 text-success",
      path: "/insights"
    },
    {
      title: "Communication Logs",
      description: "Review AAC usage and communication patterns",
      icon: MessageCircle,
      color: "bg-warning/10 text-warning",
      path: "/communication-logs"
    },
    {
      title: "Reports",
      description: "Generate analytical reports and summaries",
      icon: Brain,
      color: "bg-destructive/10 text-destructive",
      path: "/reports"
    }
  ];

  const features = profile.role === 'user' ? userFeatures : caregiverFeatures;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-emphasis">
                Welcome back, {profile.full_name || 'Friend'}
              </h1>
              <p className="text-sm text-gentle capitalize">
                {profile.role} Dashboard {profile.age_group && `• ${profile.age_group}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="btn-gentle">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="btn-gentle">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {!profile.onboarding_completed && (
          <Card className="card-glow mb-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary">Complete Your Setup</CardTitle>
              <CardDescription>
                Let's personalize your experience to better support your needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="btn-calm">
                Complete Onboarding
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-floating">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-gentle">Today's Progress</p>
                  <p className="text-2xl font-bold text-emphasis">0/0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-floating">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gentle">Recent Emotions</p>
                  <p className="text-2xl font-bold text-emphasis">-</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-floating">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-gentle">Communications</p>
                  <p className="text-2xl font-bold text-emphasis">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div>
          <h2 className="text-2xl font-bold text-emphasis mb-6">
            {profile.role === 'user' ? 'Your Tools' : 'Caregiver Tools'}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="card-glow group hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => navigate(feature.path)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.color} group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-emphasis mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gentle leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="card-floating mt-8">
          <CardHeader>
            <CardTitle className="text-emphasis">Recent Activity</CardTitle>
            <CardDescription className="text-gentle">
              Your latest interactions and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-gentle">No recent activity yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start using the tools above to see your progress here
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;