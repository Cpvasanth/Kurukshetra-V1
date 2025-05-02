'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import { useToast } from "@/hooks/use-toast";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/client'; // Import initialized auth instance
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, redirect to dashboard
        router.replace('/admin/dashboard'); // Use replace to avoid back button going to login
      }
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Clear previous errors

    try {
      // Use Firebase Authentication
      await signInWithEmailAndPassword(auth, email, password);

      toast({
        title: "Login Successful",
        description: "Redirecting to dashboard...",
        variant: "default", // Or use a success variant if defined
      });
      // Redirect handled by onAuthStateChanged effect, but can also push here
      // router.push('/admin/dashboard');

    } catch (err: any) {
      console.error("Firebase Login Error:", err);
       let errorMessage = "An unexpected error occurred. Please try again.";
        // Map Firebase error codes to user-friendly messages
       switch (err.code) {
         case 'auth/invalid-email':
           errorMessage = "Invalid email format.";
           break;
         case 'auth/user-not-found':
         case 'auth/wrong-password':
         case 'auth/invalid-credential': // Covers both wrong email/password in newer SDK versions
           errorMessage = "Invalid email or password.";
           break;
         case 'auth/too-many-requests':
            errorMessage = "Too many login attempts. Please try again later.";
           break;
          case 'auth/network-request-failed':
             errorMessage = "Network error. Please check your connection.";
            break;
       }
       setError(errorMessage);
       toast({
         title: "Login Failed",
         description: errorMessage,
         variant: "destructive",
       });
    } finally {
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
           {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Login Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
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
                aria-invalid={!!error} // Indicate error state for accessibility
                aria-describedby={error ? "login-error-alert" : undefined}
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
                 aria-invalid={!!error}
                 aria-describedby={error ? "login-error-alert" : undefined}
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
            {/* Update footer text if needed */}
            <p>Enter your admin credentials to proceed.</p>
         </CardFooter>
      </Card>
    </div>
  );
}
