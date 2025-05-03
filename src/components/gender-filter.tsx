
'use client';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Users, User, UserRound, Ban } from 'lucide-react'; // Use appropriate icons
import type { Gender } from '@/services/sports-data'; // Import Gender type

interface GenderItem {
  name: Gender | 'All'; // Gender type or 'All'
  icon: React.ComponentType<{ className?: string }>;
}

const genders: GenderItem[] = [
    { name: 'All', icon: Ban }, // Use Ban icon for 'All'
    { name: 'Boys', icon: User },
    { name: 'Girls', icon: UserRound },
    { name: 'Mixed', icon: Users },
];


interface GenderFilterProps {
  selectedGender: string; // Keep as string for 'all' possibility
  onSelectGender: (gender: string) => void;
}

export function GenderFilter({ selectedGender, onSelectGender }: GenderFilterProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border border-border">
      <div className="flex space-x-3 p-3">
        {genders.map((gender) => (
          <Button
            key={gender.name}
            variant={selectedGender.toLowerCase() === gender.name.toLowerCase() ? 'default' : 'outline'}
            onClick={() => onSelectGender(gender.name)} // Pass the gender name directly
            className={cn(
              "flex flex-col items-center justify-center h-20 w-20 rounded-md p-2 transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-md group", // Changed to rounded-md
              selectedGender.toLowerCase() === gender.name.toLowerCase()
                ? 'bg-primary text-primary-foreground border-2 border-accent'
                : 'bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground'
            )}
            aria-pressed={selectedGender.toLowerCase() === gender.name.toLowerCase()}
          >
            <gender.icon className={cn("h-8 w-8 mb-1 transition-transform duration-200 group-hover:rotate-[5deg]", selectedGender.toLowerCase() === gender.name.toLowerCase() ? "text-accent-foreground" : "text-primary group-hover:text-accent-foreground")} />
            <span className="text-xs font-medium truncate">{gender.name}</span>
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
