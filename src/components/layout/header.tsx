'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'; // Added SheetHeader, SheetTitle
import { Menu, X, Trophy, LogIn, LogOut, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, firebaseInitializationError } from '@/lib/firebase/client'; // Import initialized auth instance and error
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


const AnimatedLogo = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Link href="/" className="flex items-center gap-2">
       <Trophy
        className={cn(
          'h-8 w-8 text-accent transition-all duration-1000 ease-out', // Use accent color for trophy
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        )}
      />
      <span
        className={cn(
          'text-2xl font-bold text-primary-foreground transition-all duration-1000 ease-out delay-200', // Use foreground color for text
          visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        )}
      >
        Kurukshetra {/* Updated Name */}
      </span>
    </Link>
  );
};


export function Header() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // Start loading until auth state is known
  const { toast } = useToast();
  const router = useRouter();


   // Listen for auth state changes
   useEffect(() => {
     if (firebaseInitializationError) {
        // If Firebase failed to initialize, don't attempt to use auth
        setAuthLoading(false);
        console.warn("Firebase initialization failed. Auth features will be limited.");
        return;
     }
     // Ensure auth is initialized before subscribing
     if (auth) {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false); // Auth state is now known
        });
        // Cleanup subscription on unmount
        return () => unsubscribe();
     } else {
        // Auth is null, likely due to initialization error handled above
         console.warn("Firebase Auth instance is not available in Header.");
        setAuthLoading(false);
     }

   }, []);

   const handleSignOut = async () => {
     if (!auth) {
        toast({ title: "Error", description: "Auth service unavailable.", variant: "destructive" });
        return;
     }
     try {
       await signOut(auth);
       toast({ title: "Signed Out", description: "Logged out successfully." });
       setIsOpen(false); // Close mobile menu if open
       router.push('/'); // Redirect to home after logout
     } catch (error) {
       console.error("Sign Out Error:", error);
       toast({ title: "Sign Out Error", variant: "destructive" });
     }
   };

  const navLinksBase = [
    { href: '/', label: 'Home' },
    { href: '/results', label: 'Results' },
    { href: '/schedule', label: 'Schedules' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ];

  // Determine Admin link/button based on auth state
   const adminLink = user
     ? { href: '/admin/dashboard', label: 'Admin Dashboard' }
     : { href: '/admin', label: 'Admin Login' };

   const mobileAuthAction = user ? (
      <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-lg hover:text-accent transition-colors text-primary-foreground">
        <LogOut className="mr-2 h-5 w-5" /> Sign Out
      </Button>
    ) : (
      <Link
         href="/admin"
         className="text-lg hover:text-accent transition-colors flex items-center"
         onClick={() => setIsOpen(false)}
       >
        <LogIn className="mr-2 h-5 w-5" /> Admin Login
      </Link>
    );

    const desktopAuthAction = authLoading ? (
      <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" /> // Show loader while checking auth
    ) : user ? (
      <>
        <Link
            key={adminLink.href}
            href={adminLink.href}
            className="text-sm font-medium hover:text-accent transition-colors duration-200 ease-in-out transform hover:scale-105"
        >
            {adminLink.label}
        </Link>
        <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-primary-foreground hover:bg-primary/90 hover:text-accent">
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Sign Out</span>
        </Button>
      </>
    ) : (
       <Link
         key={adminLink.href}
         href={adminLink.href}
         className="text-sm font-medium hover:text-accent transition-colors duration-200 ease-in-out transform hover:scale-105"
       >
         {adminLink.label}
       </Link>
    );


  const allNavLinks = [...navLinksBase]; // Admin link handled separately for desktop


  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <AnimatedLogo />

        {isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/90">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            {/* Added SheetHeader and SheetTitle for accessibility */}
            <SheetContent side="right" className="w-[250px] bg-primary text-primary-foreground p-4 flex flex-col">
               <SheetHeader className="flex flex-row justify-between items-center mb-6">
                 {/* Visually hidden title for screen readers */}
                 <SheetTitle className="sr-only">Main Menu</SheetTitle>
                 {/* Visual Logo in Sheet */}
                 <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <Trophy className="h-6 w-6 text-accent" />
                     <span className="text-xl font-bold text-accent">Kurukshetra</span>
                 </Link>
                 <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-primary-foreground hover:bg-primary/90">
                   <X className="h-6 w-6" />
                   <span className="sr-only">Close menu</span>
                 </Button>
               </SheetHeader>
              <nav className="flex flex-col space-y-4 flex-grow">
                {allNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg hover:text-accent transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                 {/* Spacer */}
                 <div className="flex-grow"></div>
                 {/* Auth Action */}
                 {authLoading ? <Loader2 className="h-5 w-5 animate-spin self-start mt-4 text-primary-foreground" /> : mobileAuthAction}
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <nav className="flex space-x-6 items-center">
            {allNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium hover:text-accent transition-colors duration-200 ease-in-out transform hover:scale-105"
              >
                {link.label}
              </Link>
            ))}
            {/* Desktop Auth Action */}
             <div className="flex items-center gap-2 pl-4 border-l border-primary-foreground/30">
               {desktopAuthAction}
             </div>
          </nav>
        )}
      </div>
        {/* Banner - Desktop */}
       {!isMobile && (
        <div className="bg-accent text-accent-foreground text-center py-2 text-sm font-medium">
          Welcome to Kurukshetra - Your hub for all sports action! {/* Updated Name */}
        </div>
      )}
       {/* Banner - Mobile (could be different or omitted based on design preference) */}
      {isMobile && (
         <div className="bg-accent text-accent-foreground text-center py-1 text-xs font-medium">
          Live Scores & Schedules!
        </div>
      )}
    </header>
  );
}
