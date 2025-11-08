import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MaterialIcon } from "./ui/material-icon";

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
}

const features = [
  {
    icon: "psychology",
    title: "Talk to the AI",
    description: "The AI creates task plans for you"
  },
  {
    icon: "view_kanban",
    title: "Smart Kanban Board", 
    description: "Tasks are organized automatically"
  },
  {
    icon: "bolt",
    title: "Simple and Fast",
    description: "Streamlined workflow for teams of any size"
  }
];

export function LandingPage({ onNavigateToLogin, onNavigateToSignup }: LandingPageProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>
            SmartBoardAI
          </h1>
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Turn your ideas into organized tasks instantly with AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onNavigateToLogin}
              variant="outline"
              size="lg"
              className="px-8 hover:bg-surface-hover"
              style={{ 
                borderColor: 'var(--color-primary)',
                color: 'var(--color-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-background-hover)';
                e.currentTarget.style.borderColor = 'var(--color-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }}
            >
              Log In
            </Button>
            <Button 
              onClick={onNavigateToSignup}
              size="lg"
              className="px-8"
              style={{ 
                backgroundColor: 'var(--color-primary)',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
              }}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="text-center hover:shadow-lg transition-all duration-200" 
                style={{ 
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-background)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#E39C3C';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <CardHeader className="pb-4">
                  <div 
                    className="mx-auto mb-4 p-3 w-fit"
                    style={{ 
                      backgroundColor: 'var(--color-background-hover)',
                      borderRadius: '50px',
                      width: '64px',
                      height: '64px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #E39C3C'
                    }}
                  >
                    <MaterialIcon 
                      name={feature.icon}
                      size="large"
                      style={{ color: '#E39C3C' }}
                    />
                  </div>
                  <CardTitle className="text-xl font-semibold" style={{ color: 'var(--color-primary)' }}>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base" style={{ color: 'var(--color-text-muted)' }}>
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="py-12 px-4 border-t mt-16" 
        style={{ 
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-background)'
        }}
      >
        <div className="max-w-6xl mx-auto text-center pt-8">
          <p className="text-sm py-4" style={{ color: 'var(--color-text-muted)' }}>
            © 2025 SmartBoardAI. A student capstone project.
          </p>
        </div>
      </footer>
    </div>
  );
}