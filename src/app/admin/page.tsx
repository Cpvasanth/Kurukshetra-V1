'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import { useToast } from "@/hooks/use-toast";

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement Firebase Authentication or your chosen auth method
    console.log('Attempting login with:', email, password);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Example: Replace with actual auth check
    if (email === 'admin@example.com' && password === 'password') {
      toast({
        title: "Login Successful",
        description: "Redirecting to dashboard...",
        variant: "default", // Or use a success variant if defined
      });
      // On successful login, redirect to the admin dashboard
      router.push('/admin/dashboard');
    } else {
       toast({
         title: "Login Failed",
         description: "Invalid email or password.",
         variant: "destructive",
       });
       setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Admin Login</CardTitle>
          <CardDescription>Access the Scoreboard Central dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                disabled={isLoading}
              />
               <Button
                 type="button"
                 variant="ghost"
                 size="icon"
                 className="absolute right-1 top-[2.1rem] h-7 w-7 text-muted-foreground"
                 onClick={() => setShowPassword(!showPassword)}
                 aria-label={showPassword ? "Hide password" : "Show password"}
                 disabled={isLoading}
               >
                 {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
               </Button>
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="text-center text-xs text-muted-foreground">
            <p>Use your admin credentials to log in.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
