'use client';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FaFutbol, FaBasketballBall, FaChess, FaTableTennis, FaVolleyballBall, FaTrophy, FaMountain } from 'react-icons/fa';
import { MdSportsHandball, MdSportsSoccer, MdSportsBaseball, MdDirectionsRun } from 'react-icons/md';
import type { Sport } from '@/services/sports-data';

interface SportItem {
  name: Sport | 'All';
  icon: React.ComponentType<{ className?: string }>;
}

const sports: SportItem[] = [
  { name: 'All', icon: FaFutbol },
  { name: 'Cricket', icon: MdSportsBaseball },
  { name: 'Football', icon: FaFutbol },
  { name: 'Basketball', icon: FaBasketballBall },
  { name: 'Carrom', icon: FaChess },
  { name: 'Chess', icon: FaChess },
  { name: 'Volleyball', icon: FaVolleyballBall },
  { name: 'Throwball', icon: MdSportsHandball },
  { name: 'Table Tennis', icon: FaTableTennis },
  { name: 'Kho Kho', icon: MdSportsSoccer },
  { name: 'Badminton', icon: FaTrophy },
  { name: 'Indoor Track', icon: FaMountain }, // Indoor Athletics icon
  { name: 'Outdoor Track', icon: MdDirectionsRun }, // Outdoor Athletics icon
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
            variant={selectedSport.toLowerCase() === sport.name.toLowerCase() ? 'default' : 'outline'}
            onClick={() => onSelectSport(sport.name)}
            className={cn(
              'flex flex-col items-center justify-center h-20 w-20 rounded-full p-2 transition-all duration-200 ease-in-out transform hover:scale-110 hover:shadow-md group',
              selectedSport.toLowerCase() === sport.name.toLowerCase()
                ? 'bg-primary text-primary-foreground border-2 border-accent'
                : 'bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground'
            )}
            aria-pressed={selectedSport.toLowerCase() === sport.name.toLowerCase()}
          >
            <sport.icon
              className={cn(
                'h-8 w-8 mb-1 transition-transform duration-200 group-hover:rotate-[10deg]',
                selectedSport.toLowerCase() === sport.name.toLowerCase() ? 'text-accent-foreground' : 'text-primary group-hover:text-accent-foreground'
              )}
            />
            <span className="text-xs font-medium truncate">{sport.name}</span>
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
