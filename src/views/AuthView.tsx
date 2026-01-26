import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Logo from "@/components/Logo";
import heroImage from "@/assets/hero-trail.jpg";

interface AuthViewProps {
  onLogin: () => void;
}

const AuthView = ({ onLogin }: AuthViewProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 800);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Image */}
      <div className="relative hidden w-1/2 lg:block">
        <img
          src={heroImage}
          alt="Mountain trail at sunrise"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
        <div className="absolute bottom-12 left-12 max-w-md">
          <h2 className="mb-4 text-4xl font-bold text-primary-foreground">
            Organize Extraordinary Trail Events
          </h2>
          <p className="text-lg text-primary-foreground/90">
            From registration to race day, My Trails gives you everything you
            need to create unforgettable trail running experiences in Thailand.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <Logo size="lg" />
            <p className="mt-3 text-muted-foreground">
              Event management for trail runners
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="organizer@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Log In"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <a href="#" className="hover:text-primary">
                    Forgot your password?
                  </a>
                </p>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    placeholder="Trail Events Co."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="organizer@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  By signing up, you agree to our{" "}
                  <a href="#" className="hover:text-primary underline">
                    Terms of Service
                  </a>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
