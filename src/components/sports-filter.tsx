'use client';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Activity, // Generic sport / Athletics
  Dribbble, // Basketball
  Gamepad2, // Chess / Carrom (abstract)
  Target, // Throwball (abstract)
  Volleyball, // Volleyball
  Zap, // Kho Kho (abstract, energy)
  Award, // Badminton (abstract, competition)
  Waves, // Generic/Other Outdoor
  TreePine // Generic/Other Indoor
} from 'lucide-react'; // Using available icons, some abstractly

// Inline SVGs for specific sports not well represented
const CricketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 10 10"/>
    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
    <path d="M17 17l-1.9-1.9"/>
    <path d="M14 14h5v5"/>
  </svg>
);

const FootballIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="m15.7 7.4-2.8 3.3-3.1-3.8-3.8 4.4 2.3 2.7-2.3 2.7 3.8 4.4 3.1-3.8 2.8 3.3 4.4-3.8-2.7-2.3 2.7-2.3-4.4-3.8z"/>
   </svg>
);

const TableTennisIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.4 14.5c-1.4-2.4-3.9-4-6.9-4H11c-2.8 0-5 2.2-5 5s2.2 5 5 5h2.5"/>
    <path d="M14.5 14.5c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.3-3 3-3z"/>
    <path d="m12 4 2.5 2.5"/>
    <path d="m11.5 9 2 2"/>
  </svg>
);


interface Sport {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sports: Sport[] = [
    { name: 'All', icon: Activity }, // Use Activity for 'All' or a more generic icon
    { name: 'Cricket', icon: CricketIcon },
    { name: 'Football', icon: FootballIcon },
    { name: 'Basketball', icon: Dribbble },
    { name: 'Carrom', icon: Gamepad2 }, // Abstract
    { name: 'Chess', icon: Gamepad2 }, // Abstract
    { name: 'Volleyball', icon: Volleyball },
    { name: 'Throwball', icon: Target }, // Abstract
    { name: 'Table Tennis', icon: TableTennisIcon },
    { name: 'Kho Kho', icon: Zap }, // Abstract
    { name: 'Badminton', icon: Award }, // Abstract
    { name: 'Athletics Indoor', icon: TreePine }, // Abstract Indoor
    { name: 'Athletics Outdoor', icon: Waves }, // Abstract Outdoor
];


interface SportsFilterProps {
  selectedSport: string;
  onSelectSport: (sport: string) => void;
}

export function SportsFilter({ selectedSport, onSelectSport }: SportsFilterProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border border-border">
      <div className="flex space-x-3 p-3">
        {sports.map((sport) => (
          <Button
            key={sport.name}
            variant={selectedSport === sport.name.toLowerCase() ? 'default' : 'outline'}
            onClick={() => onSelectSport(sport.name.toLowerCase() === 'all' ? 'all' : sport.name)}
            className={cn(
              "flex flex-col items-center justify-center h-20 w-20 rounded-full p-2 transition-all duration-200 ease-in-out transform hover:scale-110 hover:shadow-md group",
              selectedSport === sport.name.toLowerCase()
                ? 'bg-primary text-primary-foreground border-2 border-accent'
                : 'bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground'
            )}
            aria-pressed={selectedSport === sport.name.toLowerCase()}
          >
            <sport.icon className={cn("h-8 w-8 mb-1 transition-transform duration-200 group-hover:rotate-[10deg]", selectedSport === sport.name.toLowerCase() ? "text-accent-foreground" : "text-primary group-hover:text-accent-foreground")} />
            <span className="text-xs font-medium truncate">{sport.name}</span>
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
