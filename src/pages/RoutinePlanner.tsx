import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useActivityTracker } from '@/components/ActivityTracker';
import { useToast } from '@/hooks/use-toast';
import { Plus, Calendar, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Routine {
  id: string;
  title: string;
  description: string;
  tasks: string[];
  is_recurring: boolean;
  is_active: boolean;
  created_at: string;
}

export default function RoutinePlanner() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoutine, setNewRoutine] = useState({
    title: '',
    description: '',
    tasks: [''],
    is_recurring: false
  });
  const [userId, setUserId] = useState<string>('');
  const { logActivity } = useActivityTracker(userId);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await fetchRoutines(user.id);
      }
    };
    getUser();
  }, []);

  const fetchRoutines = async (uid: string) => {
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch routines' });
    } else {
      setRoutines(data || []);
    }
  };

  const createRoutine = async () => {
    if (!newRoutine.title.trim()) return;

    const { error } = await supabase.from('routines').insert({
      user_id: userId,
      title: newRoutine.title,
      description: newRoutine.description,
      tasks: newRoutine.tasks.filter(task => task.trim()),
      is_recurring: newRoutine.is_recurring,
      is_active: true
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to create routine' });
    } else {
      await logActivity('routine_created', `Created routine: ${newRoutine.title}`);
      toast({ title: 'Success', description: 'Routine created successfully!' });
      setShowCreateForm(false);
      setNewRoutine({ title: '', description: '', tasks: [''], is_recurring: false });
      await fetchRoutines(userId);
    }
  };

  const completeRoutine = async (routineId: string, routineTitle: string) => {
    const { error } = await supabase.from('routine_completions').insert({
      user_id: userId,
      routine_id: routineId
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to mark routine as complete' });
    } else {
      await logActivity('routine_completed', `Completed routine: ${routineTitle}`);
      toast({ title: 'Great job!', description: 'Routine completed successfully!' });
    }
  };

  const addTask = () => {
    setNewRoutine(prev => ({ ...prev, tasks: [...prev.tasks, ''] }));
  };

  const updateTask = (index: number, value: string) => {
    setNewRoutine(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => i === index ? value : task)
    }));
  };

  const removeTask = (index: number) => {
    setNewRoutine(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index)
    }));
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
              <h1 className="text-4xl font-bold text-gradient">Routine Planner</h1>
              <p className="text-muted-foreground mt-2">Create and manage your daily routines</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-modern"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Routine
          </Button>
        </div>

        {showCreateForm && (
          <Card className="card-modern mb-8">
            <CardHeader>
              <CardTitle>Create New Routine</CardTitle>
              <CardDescription>Set up a new routine to help organize your day</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Routine title"
                value={newRoutine.title}
                onChange={(e) => setNewRoutine(prev => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="Description (optional)"
                value={newRoutine.description}
                onChange={(e) => setNewRoutine(prev => ({ ...prev, description: e.target.value }))}
              />
              
              <div>
                <label className="text-sm font-medium mb-2 block">Tasks</label>
                {newRoutine.tasks.map((task, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      placeholder={`Task ${index + 1}`}
                      value={task}
                      onChange={(e) => updateTask(index, e.target.value)}
                    />
                    {newRoutine.tasks.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeTask(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addTask} className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={newRoutine.is_recurring}
                  onChange={(e) => setNewRoutine(prev => ({ ...prev, is_recurring: e.target.checked }))}
                />
                <label htmlFor="recurring" className="text-sm">Make this a recurring routine</label>
              </div>

              <div className="flex gap-2">
                <Button onClick={createRoutine} className="btn-modern">
                  Create Routine
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {routines.map((routine) => (
            <Card key={routine.id} className="card-modern">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      {routine.title}
                    </CardTitle>
                    {routine.description && (
                      <CardDescription className="mt-1">{routine.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {routine.is_recurring && (
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        Recurring
                      </Badge>
                    )}
                    <Button
                      onClick={() => completeRoutine(routine.id, routine.title)}
                      className="btn-modern"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {routine.tasks.length > 0 && (
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Tasks:</h4>
                    <ul className="space-y-1">
                      {routine.tasks.map((task, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
          
          {routines.length === 0 && !showCreateForm && (
            <Card className="card-modern text-center py-12">
              <CardContent>
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No routines yet</h3>
                <p className="text-muted-foreground mb-4">Create your first routine to get started</p>
                <Button onClick={() => setShowCreateForm(true)} className="btn-modern">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Routine
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}