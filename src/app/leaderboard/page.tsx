'use client';

import { LeaderboardTable } from '@/components/leaderboard-table';
import { Trophy } from 'lucide-react';

export default function LeaderboardPage() {
  // In a real app, you might fetch more comprehensive leaderboard data here
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
         <Trophy className="w-7 h-7 text-yellow-500" />
         Team Leaderboard
      </h1>
      <p className="text-muted-foreground">
        Check the current standings of all participating teams across all sports.
      </p>

      <section>
         {/* You might add filters here (e.g., by sport, by season) */}
         <LeaderboardTable />
      </section>

       {/* Add more details or historical data if needed */}
       {/* <section>
         <h2 className="text-xl font-semibold mb-4 text-primary">Season Highlights</h2>
         <p className="text-muted-foreground">Top performers and notable moments...</p>
       </section> */}
    </div>
  );
}
