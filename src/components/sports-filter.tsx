'use client';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  FaFutbol,
  FaBasketballBall,
  FaChess,
  FaTableTennis,
  FaVolleyballBall,
  FaTrophy,
  FaMountain,
} from 'react-icons/fa';
import {
  MdSportsHandball,
  MdSportsSoccer,
  MdSportsBaseball,
  MdDirectionsRun,
} from 'react-icons/md';
import type { Sport } from '@/services/sports-data';

// Define lowercase internal sport types
type SportValue =
  | 'all'
  | 'cricket'
  | 'football'
  | 'basketball'
  | 'carrom'
  | 'chess'
  | 'volleyball'
  | 'throwball'
  | 'table tennis'
  | 'kho kho'
  | 'badminton'
  | 'indoor track'
  | 'outdoor track';

interface SportItem {
  value: SportValue;
  icon: React.ComponentType<{ className?: string }>;
}

// Display names map for proper casing
const sportLabels: Record<SportValue, string> = {
  all: 'All',
  cricket: 'Cricket',
  football: 'Football',
  basketball: 'Basketball',
  carrom: 'Carrom',
  chess: 'Chess',
  volleyball: 'Volleyball',
  throwball: 'Throwball',
  'table tennis': 'Table Tennis',
  'kho kho': 'Kho Kho',
  badminton: 'Badminton',
  'indoor track': 'Indoor Track',
  'outdoor track': 'Outdoor Track',
};

// Sport item list
const sports: SportItem[] = [
  { value: 'all', icon: FaFutbol },
  { value: 'cricket', icon: MdSportsBaseball },
  { value: 'football', icon: FaFutbol },
  { value: 'basketball', icon: FaBasketballBall },
  { value: 'carrom', icon: FaChess },
  { value: 'chess', icon: FaChess },
  { value: 'volleyball', icon: FaVolleyballBall },
  { value: 'throwball', icon: MdSportsHandball },
  { value: 'table tennis', icon: FaTableTennis },
  { value: 'kho kho', icon: MdSportsSoccer },
  { value: 'badminton', icon: FaTrophy },
  { value: 'indoor track', icon: FaMountain },
  { value: 'outdoor track', icon: MdDirectionsRun },
];

interface SportsFilterProps {
  selectedSport: SportValue;
  onSelectSport: (sport: SportValue) => void;
}

export function SportsFilter({ selectedSport, onSelectSport }: SportsFilterProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border border-border">
      <div className="flex space-x-3 p-3">
        {sports.map((sport) => {
          const isSelected = selectedSport === sport.value;

          return (
            <Button
              key={sport.value}
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => onSelectSport(sport.value)}
              className={cn(
                'flex flex-col items-center justify-center h-20 w-20 rounded-full p-2 transition-all duration-200 ease-in-out transform hover:scale-110 hover:shadow-md group',
                isSelected
                  ? 'bg-primary text-primary-foreground border-2 border-accent'
                  : 'bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground'
              )}
              aria-pressed={isSelected}
            >
              <sport.icon
                className={cn(
                  'h-8 w-8 mb-1 transition-transform duration-200 group-hover:rotate-[10deg]',
                  isSelected ? 'text-accent-foreground' : 'text-primary group-hover:text-accent-foreground'
                )}
              />
              <span className="text-xs font-medium truncate">
                {sportLabels[sport.value]}
              </span>
            </Button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
