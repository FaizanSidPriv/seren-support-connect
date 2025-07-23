import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { User, Heart, Users, Palette, Accessibility } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useActivityTracker } from "@/components/ActivityTracker";

type OnboardingStep = 'role' | 'preferences' | 'profile' | 'complete';

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('role');
  const [role, setRole] = useState<'user' | 'caregiver'>('user');
  const [simplifiedUI, setSimplifiedUI] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fullName, setFullName] = useState('');
  const [ageGroup, setAgeGroup] = useState<'child' | 'teen' | 'adult' | ''>('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update({
          role,
          full_name: fullName,
          age_group: ageGroup,
          preferences: {
            simplified_ui: simplifiedUI,
            high_contrast: highContrast,
            theme: 'light',
            notifications: true
          },
          onboarding_completed: true
        })
        .eq('id', user.id);

      if (error) throw error;

      // Log onboarding completion
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          activity_type: 'onboarding',
          activity_description: `Completed onboarding as ${role}`,
          metadata: { role, simplified_ui: simplifiedUI, high_contrast: highContrast }
        });

      toast({
        title: "Welcome!",
        description: "Your profile has been set up successfully.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Setup Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    switch (currentStep) {
      case 'role':
        setCurrentStep('preferences');
        break;
      case 'preferences':
        setCurrentStep('profile');
        break;
      case 'profile':
        setCurrentStep('complete');
        break;
    }
  };

  const prevStep = () => {
    switch (currentStep) {
      case 'preferences':
        setCurrentStep('role');
        break;
      case 'profile':
        setCurrentStep('preferences');
        break;
      case 'complete':
        setCurrentStep('profile');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      {/* Activity tracking will be handled by the hook */}
      
      <Card className="w-full max-w-2xl card-glass">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-gradient">
            Welcome to Autism Care
          </CardTitle>
          <CardDescription className="text-lg">
            Let's set up your personalized experience
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {['role', 'preferences', 'profile', 'complete'].map((step, index) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentStep === step
                      ? 'bg-primary scale-125'
                      : index < ['role', 'preferences', 'profile', 'complete'].indexOf(currentStep)
                      ? 'bg-primary/60'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Role Selection */}
          {currentStep === 'role' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Choose Your Role</h3>
                <p className="text-muted-foreground">How will you be using this app?</p>
              </div>
              
              <RadioGroup value={role} onValueChange={(value: 'user' | 'caregiver') => setRole(value)}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="user" id="user" />
                    <Label htmlFor="user" className="flex items-center space-x-3 cursor-pointer flex-1">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">I'm a User</div>
                        <div className="text-sm text-muted-foreground">
                          I want to track my routines, emotions, and communicate
                        </div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="caregiver" id="caregiver" />
                    <Label htmlFor="caregiver" className="flex items-center space-x-3 cursor-pointer flex-1">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-secondary-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">I'm a Caregiver</div>
                        <div className="text-sm text-muted-foreground">
                          I want to support and monitor users in my care
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Preferences */}
          {currentStep === 'preferences' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Accessibility Preferences</h3>
                <p className="text-muted-foreground">Customize the interface for your needs</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center space-x-3">
                    <Accessibility className="w-5 h-5 text-primary" />
                    <div>
                      <Label className="font-medium">Simplified Interface</Label>
                      <p className="text-sm text-muted-foreground">Reduce visual complexity</p>
                    </div>
                  </div>
                  <Switch checked={simplifiedUI} onCheckedChange={setSimplifiedUI} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center space-x-3">
                    <Palette className="w-5 h-5 text-primary" />
                    <div>
                      <Label className="font-medium">High Contrast</Label>
                      <p className="text-sm text-muted-foreground">Enhance visual clarity</p>
                    </div>
                  </div>
                  <Switch checked={highContrast} onCheckedChange={setHighContrast} />
                </div>
              </div>
            </div>
          )}

          {/* Profile Setup */}
          {currentStep === 'profile' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Profile Information</h3>
                <p className="text-muted-foreground">Tell us a bit about yourself</p>
              </div>

              <div className="flex justify-center mb-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="ageGroup">Age Group</Label>
                  <RadioGroup value={ageGroup} onValueChange={setAgeGroup} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="child" id="child" />
                      <Label htmlFor="child">Child (5-12)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="teen" id="teen" />
                      <Label htmlFor="teen">Teen (13-17)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="adult" id="adult" />
                      <Label htmlFor="adult">Adult (18+)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          {/* Complete */}
          {currentStep === 'complete' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-success/10 mx-auto flex items-center justify-center">
                <Heart className="w-8 h-8 text-success" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">You're All Set!</h3>
                <p className="text-muted-foreground">
                  Your personalized dashboard is ready. Let's begin your journey!
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 'role'}
              className="btn-glass"
            >
              Previous
            </Button>
            
            {currentStep === 'complete' ? (
              <Button
                onClick={handleCompleteOnboarding}
                disabled={loading}
                className="btn-modern"
              >
                {loading ? 'Setting up...' : 'Get Started'}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={currentStep === 'profile' && (!fullName || !ageGroup)}
                className="btn-modern"
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}