import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { api, type User } from "../services/api";

interface LoginPageProps {
  onNavigateBack: () => void;
  onNavigateToSignup: () => void;
  onNavigateToChat: () => void;
  onLoginSuccess: (user: User) => void;
}

export function LoginPage({ onNavigateBack, onNavigateToSignup, onNavigateToChat, onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await api.login({ email, password });
      onLoginSuccess(user);
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="w-full max-w-md">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={onNavigateBack}
          className="mb-8 p-0 h-auto"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <span 
            className="text-sm mr-2"
            style={{ color: 'var(--color-icon-primary)' }}
          >
            ←
          </span>
          Back to Home
        </Button>

        <Card 
          className="shadow-lg"
          style={{ 
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-background-card)'
          }}
        >
          <CardHeader className="text-center pb-6">
            <CardTitle 
              className="text-2xl mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              SmartBoardAI
            </CardTitle>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Welcome back! Please sign in to your account.
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <div 
                className="mb-4 p-3 rounded-lg"
                style={{ 
                  backgroundColor: 'var(--color-error-bg)',
                  border: '1px solid var(--color-error-border)',
                  color: 'var(--color-error-text)'
                }}
              >
                <p className="text-sm">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label 
                  htmlFor="email"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ 
                    backgroundColor: 'var(--color-background-input)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label 
                  htmlFor="password"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ 
                    backgroundColor: 'var(--color-background-input)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Log In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p 
                className="text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Don't have an account?{" "}
                <button
                  onClick={onNavigateToSignup}
                  style={{ 
                    color: 'var(--color-primary)',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Sign Up
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}