import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowLeft } from "lucide-react";
import { api, type User } from "../services/api";

interface SignupPageProps {
  onNavigateBack: () => void;
  onNavigateToLogin: () => void;
  onNavigateToChat: () => void;
  onSignupSuccess: (user: User) => void;
}

export function SignupPage({ onNavigateBack, onNavigateToLogin, onNavigateToChat, onSignupSuccess }: SignupPageProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    if (!firstName || !lastName) {
      setError("Please enter both first and last name!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await api.signup({ 
        firstName, 
        lastName, 
        email, 
        password 
      });
      onSignupSuccess(user);
    } catch (err) {
      console.error("Signup error:", err);
      setError("Failed to create account. Email might already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={onNavigateBack}
          className="mb-8 p-0 h-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card className="border shadow-lg">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl mb-2">Smart Board AI</CardTitle>
            <p className="text-sm text-muted-foreground">
              Create your account to get started.
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="bg-input-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="bg-input-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-input-background"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-input-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-input-background"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  onClick={onNavigateToLogin}
                  className="text-primary hover:underline"
                >
                  Log In
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}