'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, Trophy } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
          'h-8 w-8 text-primary transition-all duration-1000 ease-out',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        )}
      />
      <span
        className={cn(
          'text-2xl font-bold text-primary transition-all duration-1000 ease-out delay-200',
          visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        )}
      >
        Scoreboard Central
      </span>
    </Link>
  );
};


export function Header() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/results', label: 'Results' },
    { href: '/schedule', label: 'Schedules' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/admin', label: 'Admin Login' },
  ];

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
            <SheetContent side="right" className="w-[250px] bg-primary text-primary-foreground p-4">
              <div className="flex justify-between items-center mb-6">
                 <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <Trophy className="h-6 w-6 text-accent" />
                    <span className="text-xl font-bold text-accent">Scoreboard</span>
                 </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-primary-foreground hover:bg-primary/90">
                  <X className="h-6 w-6" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg hover:text-accent transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <nav className="flex space-x-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium hover:text-accent transition-colors duration-200 ease-in-out transform hover:scale-105"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
        {/* Banner - Desktop */}
       {!isMobile && (
        <div className="bg-accent text-accent-foreground text-center py-2 text-sm font-medium">
          Welcome to Scoreboard Central - Your hub for all sports action!
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
