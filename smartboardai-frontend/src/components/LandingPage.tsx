import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Brain, Kanban, Zap } from "lucide-react";

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
  onNavigateToChat: () => void;
  onNavigateToBoard: () => void;
}

const features = [
  {
    icon: Brain,
    title: "Talk to the AI",
    description: "The AI creates task plans for you"
  },
  {
    icon: Kanban,
    title: "Smart Kanban Board", 
    description: "Tasks are organized automatically"
  },
  {
    icon: Zap,
    title: "Simple and Fast",
    description: "Designed for students and small projects"
  }
];

export function LandingPage({ onNavigateToLogin, onNavigateToSignup, onNavigateToChat, onNavigateToBoard }: LandingPageProps) {
  return (
  <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="mb-6 text-4xl md:text-6xl">
            Smart Board AI
          </h1>
          <p className="mb-8 text-xl text-muted-foreground max-w-2xl mx-auto">
            Turn your ideas into organized tasks instantly with AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onNavigateToChat}
              size="lg"
              className="px-8 bg-primary hover:bg-primary/90"
            >
              Try AI Chat
            </Button>
            <Button 
              onClick={onNavigateToBoard}
              variant="outline"
              size="lg"
              className="px-8"
            >
              View Board
            </Button>
            <Button 
              onClick={onNavigateToLogin}
              variant="outline"
              size="lg"
              className="px-8"
            >
              Log In
            </Button>
            <Button 
              onClick={onNavigateToSignup}
              size="lg"
              className="px-8"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-none bg-card">
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-background">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Smart Board AI. A student capstone project.
          </p>
        </div>
      </footer>
    </div>
  );
}