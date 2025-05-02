'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'; // Icons for position change

// Placeholder data - replace with actual data fetching
const leaderboardData = [
  { position: 1, team: 'Skylaros', points: 25, change: 'up', logo: 'https://picsum.photos/seed/Skylaros/40/40?grayscale' },
  { position: 2, team: 'Dracarys', points: 22, change: 'down', logo: 'https://picsum.photos/seed/Dracarys/40/40?grayscale' },
  { position: 3, team: 'Aetos', points: 20, change: 'same', logo: 'https://picsum.photos/seed/Aetos/40/40?grayscale' },
  { position: 4, team: 'Xanthus', points: 18, change: 'up', logo: 'https://picsum.photos/seed/Xanthus/40/40?grayscale' },
 // Removed Griffin Squad
];

// Helper to get team initial
const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// Helper to render change icon
const renderChangeIcon = (change: 'up' | 'down' | 'same') => {
  switch (change) {
    case 'up':
      return <ArrowUp className="h-4 w-4 text-green-500" />;
    case 'down':
      return <ArrowDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
};

export function LeaderboardTable() {
  // Add loading state if needed
  return (
    <div className="rounded-lg border overflow-hidden shadow-md bg-card">
      <Table>
        <TableHeader className="bg-secondary">
          <TableRow>
            <TableHead className="w-[80px] text-center">Position</TableHead>
            <TableHead>Team</TableHead>
            <TableHead className="text-right">Points</TableHead>
            <TableHead className="w-[80px] text-center">Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboardData.map((entry) => (
            <TableRow key={entry.team} className="hover:bg-muted/50 transition-colors">
              <TableCell className="font-medium text-center">{entry.position}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={entry.logo} alt={`${entry.team} logo`} data-ai-hint={`${entry.team} logo`} />
                    <AvatarFallback>{getInitials(entry.team)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{entry.team}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold text-primary">{entry.points}</TableCell>
              <TableCell className="text-center">
                 <div className="flex justify-center items-center">
                    {renderChangeIcon(entry.change as 'up' | 'down' | 'same')}
                 </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
       {/* Add pagination or view more if needed */}
       {/* <div className="p-4 text-center">
         <Button variant="link">View Full Leaderboard</Button>
       </div> */}
    </div>
  );
}
