
'use client';

import { useState, useEffect } from 'react'; // Import useState and useEffect
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Minus, Loader2 } from 'lucide-react'; // Icons for position change, Loader2 for loading
import { getLeaderboardStandings } from '@/services/sports-data'; // Import Firestore function
import type { TeamStanding } from '@/services/sports-data'; // Import TeamStanding type
import { useToast } from '@/hooks/use-toast';

// Helper to get team initial
const getInitials = (name: string) => {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??'; // Add fallback
}

// Helper to render change icon (remains the same, assumes change logic is handled externally or simplified)
// For now, we'll just show 'same' as we don't track change from Firestore directly here
const renderChangeIcon = (change: 'up' | 'down' | 'same' = 'same') => {
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
  const [leaderboardData, setLeaderboardData] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      try {
        const standings = await getLeaderboardStandings();
        setLeaderboardData(standings);
      } catch (error) {
        console.error("Failed to load leaderboard data:", error);
        toast({
          title: "Error Loading Leaderboard",
          description: "Could not fetch team standings. Please try again later.",
          variant: "destructive",
        });
        setLeaderboardData([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, [toast]); // Re-fetch if toast instance changes (unlikely but good practice)

  if (loading) {
     return (
       <div className="flex justify-center items-center h-[200px] rounded-lg border bg-card">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
         <p className="ml-3 text-muted-foreground">Loading Leaderboard...</p>
       </div>
     );
   }

  return (
    <div className="rounded-lg border overflow-hidden shadow-md bg-card">
      <Table>
        <TableHeader className="bg-secondary">
          <TableRow>
            <TableHead className="w-[80px] text-center">Position</TableHead>
            <TableHead>Team</TableHead>
            <TableHead className="text-right">Points</TableHead>
             {/* <TableHead className="w-[80px] text-center">Change</TableHead> // Hide 'Change' for now */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboardData.length > 0 ? (
             leaderboardData.map((entry, index) => ( // Use index + 1 for position
                <TableRow key={entry.id || entry.teamName} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium text-center">{index + 1}</TableCell>
                <TableCell>
                    <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                         {/* Use optional chaining for logo */}
                        <AvatarImage src={entry.logo ?? undefined} alt={`${entry.teamName} logo`} data-ai-hint={`${entry.teamName} logo`} />
                        <AvatarFallback>{getInitials(entry.teamName)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{entry.teamName}</span>
                    </div>
                </TableCell>
                <TableCell className="text-right font-semibold text-primary">{entry.points}</TableCell>
                 {/* <TableCell className="text-center">
                    <div className="flex justify-center items-center">
                    {renderChangeIcon()}
                    </div>
                </TableCell> */}
                </TableRow>
            ))
          ) : (
             <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                    No leaderboard data available yet.
                </TableCell>
             </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
