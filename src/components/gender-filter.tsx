'use client';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Users, User, UserRound, Ban } from 'lucide-react'; // Icons
import type { Gender } from '@/services/sports-data'; // Gender type

// Consistent lowercase internal values
type GenderValue = 'all' | 'boys' | 'girls' | 'mixed';

interface GenderItem {
  value: GenderValue;
  icon: React.ComponentType<{ className?: string }>;
}

// Labels for UI display
const genderLabels: Record<GenderValue, string> = {
  all: 'All',
  boys: 'Boys',
  girls: 'Girls',
  mixed: 'Mixed',
};

const genders: GenderItem[] = [
  { value: 'all', icon: Ban },
  { value: 'boys', icon: User },
  { value: 'girls', icon: UserRound },
  { value: 'mixed', icon: Users },
];

interface GenderFilterProps {
  selectedGender: GenderValue;
  onSelectGender: (gender: GenderValue) => void;
}

export function GenderFilter({ selectedGender, onSelectGender }: GenderFilterProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border border-border">
      <div className="flex space-x-3 p-3">
        {genders.map((gender) => {
          const isSelected = selectedGender === gender.value;

          return (
            <Button
              key={gender.value}
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => onSelectGender(gender.value)}
              className={cn(
                'flex flex-col items-center justify-center h-20 w-20 rounded-md p-2 transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-md group',
                isSelected
                  ? 'bg-primary text-primary-foreground border-2 border-accent'
                  : 'bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground'
              )}
              aria-pressed={isSelected}
            >
              <gender.icon
                className={cn(
                  'h-8 w-8 mb-1 transition-transform duration-200 group-hover:rotate-[5deg]',
                  isSelected ? 'text-accent-foreground' : 'text-primary group-hover:text-accent-foreground'
                )}
              />
              <span className="text-xs font-medium truncate">{genderLabels[gender.value]}</span>
            </Button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
