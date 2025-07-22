import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useActivityTracker } from '@/components/ActivityTracker';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Volume2, ArrowLeft, Mic, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const quickPhrases = [
  { category: 'Basic Needs', phrases: ['I need help', 'I am hungry', 'I am thirsty', 'I need the bathroom'] },
  { category: 'Feelings', phrases: ['I am happy', 'I am sad', 'I am tired', 'I am excited'] },
  { category: 'Social', phrases: ['Hello', 'Thank you', 'Please', 'Goodbye'] },
  { category: 'Activities', phrases: ['I want to play', 'I want to read', 'I want to rest', 'I want to go outside'] }
];

export default function CommunicationTools() {
  const [customMessage, setCustomMessage] = useState('');
  const [userId, setUserId] = useState<string>('');
  const { logActivity } = useActivityTracker(userId);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      speechSynthesis.speak(utterance);
      
      logActivity('text_to_speech', `Spoke text: ${text}`);
      toast({ title: 'Speaking...', description: text });
    } else {
      toast({ title: 'Error', description: 'Text-to-speech not supported in this browser' });
    }
  };

  const logAAC = async (phrase: string) => {
    await supabase.from('aac_usage_logs').insert({
      user_id: userId
    });
    await logActivity('aac_used', `Used AAC phrase: ${phrase}`);
  };

  const handlePhraseClick = (phrase: string) => {
    speakText(phrase);
    logAAC(phrase);
  };

  const handleCustomSpeak = () => {
    if (customMessage.trim()) {
      speakText(customMessage);
      logAAC(customMessage);
      setCustomMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-6xl mx-auto">
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
              <h1 className="text-4xl font-bold text-gradient">Communication Tools</h1>
              <p className="text-muted-foreground mt-2">AAC and communication support</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 mb-8">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Custom Message
              </CardTitle>
              <CardDescription>Type any message to speak aloud</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message here..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomSpeak()}
                  className="flex-1"
                />
                <Button
                  onClick={handleCustomSpeak}
                  disabled={!customMessage.trim()}
                  className="btn-modern"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Speak
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          {quickPhrases.map((category) => (
            <Card key={category.category} className="card-modern">
              <CardHeader>
                <CardTitle>{category.category}</CardTitle>
                <CardDescription>Quick phrases for {category.category.toLowerCase()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {category.phrases.map((phrase) => (
                    <Button
                      key={phrase}
                      variant="outline"
                      className="h-16 text-left justify-start p-4 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                      onClick={() => handlePhraseClick(phrase)}
                    >
                      <div className="flex items-center gap-3">
                        <Play className="w-4 h-4 text-primary" />
                        <span className="font-medium">{phrase}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="card-modern mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-primary" />
              Voice Input (Future Feature)
            </CardTitle>
            <CardDescription>Speech-to-text functionality coming soon</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled className="w-full h-16">
              <Mic className="w-6 h-6 mr-2" />
              Voice Input - Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}