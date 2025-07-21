import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Users, Brain, MessageCircle, Calendar, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation Header */}
      <nav className="bg-card/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-emphasis">SupportSpace</span>
          </div>
          <Link to="/auth">
            <Button className="btn-calm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-emphasis mb-6 leading-tight">
            A Safe Space for
            <span className="text-transparent bg-gradient-to-r from-primary to-primary-glow bg-clip-text block mt-2">
              Growth & Connection
            </span>
          </h1>
          <p className="text-xl text-gentle mb-8 max-w-2xl mx-auto leading-relaxed">
            Supporting individuals with autism and their caregivers through thoughtful tools, 
            real-time insights, and a calming, accessible experience designed with care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <Button size="lg" className="btn-calm px-8 py-4 text-lg">
                Start Your Journey
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="btn-gentle px-8 py-4 text-lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-emphasis mb-4">
            Thoughtfully Designed Features
          </h2>
          <p className="text-lg text-gentle max-w-2xl mx-auto">
            Every tool is crafted with neurodivergent-friendly design principles, 
            focusing on clarity, calm, and meaningful support.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* User Features */}
          <Card className="card-glow group hover:scale-105 transition-transform duration-300">
            <div className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-emphasis mb-3">Routine Planner</h3>
              <p className="text-gentle leading-relaxed">
                Create and track daily routines with gentle reminders and visual progress tracking.
              </p>
            </div>
          </Card>

          <Card className="card-glow group hover:scale-105 transition-transform duration-300">
            <div className="p-6">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-success/20 transition-colors">
                <Heart className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-emphasis mb-3">Emotion Logger</h3>
              <p className="text-gentle leading-relaxed">
                Track feelings and emotional patterns with confidence levels and contextual notes.
              </p>
            </div>
          </Card>

          <Card className="card-glow group hover:scale-105 transition-transform duration-300">
            <div className="p-6">
              <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-warning/20 transition-colors">
                <MessageCircle className="w-6 h-6 text-warning" />
              </div>
              <h3 className="text-xl font-semibold text-emphasis mb-3">AAC Communication</h3>
              <p className="text-gentle leading-relaxed">
                Build sentences and communicate using an intuitive word board interface.
              </p>
            </div>
          </Card>

          {/* Caregiver Features */}
          <Card className="card-glow group hover:scale-105 transition-transform duration-300">
            <div className="p-6">
              <div className="w-12 h-12 bg-primary-glow/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-glow/20 transition-colors">
                <Users className="w-6 h-6 text-primary-glow" />
              </div>
              <h3 className="text-xl font-semibold text-emphasis mb-3">Caregiver Dashboard</h3>
              <p className="text-gentle leading-relaxed">
                Monitor connected users with privacy-respecting insights and gentle alerts.
              </p>
            </div>
          </Card>

          <Card className="card-glow group hover:scale-105 transition-transform duration-300">
            <div className="p-6">
              <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-destructive/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-emphasis mb-3">Pattern Recognition</h3>
              <p className="text-gentle leading-relaxed">
                AI-assisted insights help identify behavioral patterns and positive trends.
              </p>
            </div>
          </Card>

          <Card className="card-glow group hover:scale-105 transition-transform duration-300">
            <div className="p-6">
              <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
                <Brain className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-emphasis mb-3">Interactive Assistant</h3>
              <p className="text-gentle leading-relaxed">
                A supportive AI companion that suggests routines and calming activities.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-card border-t border-border/50">
        <div className="container mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-emphasis mb-4">
            Ready to Begin?
          </h2>
          <p className="text-lg text-gentle mb-8 max-w-xl mx-auto">
            Join a community designed with understanding, patience, and genuine care 
            for neurodivergent individuals and their support networks.
          </p>
          <Link to="/auth">
            <Button size="lg" className="btn-calm px-10 py-4 text-lg">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border/50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-primary rounded-md flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-emphasis font-medium">SupportSpace</span>
            </div>
            <p className="text-gentle text-sm">
              Built with care for the autism community
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
