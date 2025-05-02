'use client';

import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { SportsFilter } from '@/components/sports-filter';
import { MatchList } from '@/components/match-list';
import { LeaderboardTable } from '@/components/leaderboard-table';
import type { SportsEvent, MatchResult } from '@/services/sports-data';
import { getSportsEvents, getMatchResult } from '@/services/sports-data'; // Assuming getMatchResult exists
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Clock, Calendar, Users, Trophy } from 'lucide-react';

const HomePage: NextPage = () => {
  const [displayMode, setDisplayMode] = useState<'upcoming' | 'results'>('upcoming');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [upcomingEvents, setUpcomingEvents] = useState<SportsEvent[]>([]);
  const [latestResults, setLatestResults] = useState<MatchResult[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [loadingResults, setLoadingResults] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingUpcoming(true);
        const events = await getSportsEvents();
        // Simulate fetching results - replace with actual API call
        const resultsPromises = events.map(event => getMatchResult(event.id));
        const fetchedResults = (await Promise.all(resultsPromises)).filter(r => r !== null) as MatchResult[];

        setUpcomingEvents(events);
        setLatestResults(fetchedResults);

      } catch (error) {
        console.error("Failed to fetch data:", error);
        // Handle error state, e.g., show a toast notification
      } finally {
        setLoadingUpcoming(false);
        setLoadingResults(false); // Assume results are loaded after events for now
      }
    }
    fetchData();
  }, []);


  const filteredUpcomingEvents = upcomingEvents.filter(event =>
    selectedSport === 'all' || event.matchTitle.toLowerCase().includes(selectedSport.toLowerCase()) // Simple filtering by title for demo
  );

  const filteredResults = latestResults.filter(result =>
     selectedSport === 'all' || upcomingEvents.find(e => e.id === result.matchId)?.matchTitle.toLowerCase().includes(selectedSport.toLowerCase()) // Filter results based on match title
  );


  return (
    <div className="space-y-8">
      {/* Sports Filter Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-primary">Filter by Sport</h2>
         <SportsFilter selectedSport={selectedSport} onSelectSport={setSelectedSport} />
      </section>

      {/* Match Display Toggle */}
      <section className="flex justify-center items-center space-x-4">
        <RadioGroup
          defaultValue="upcoming"
          onValueChange={(value: 'upcoming' | 'results') => setDisplayMode(value)}
          className="flex space-x-4 bg-secondary p-1 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="upcoming" id="r-upcoming" className="peer sr-only" />
            <Label
              htmlFor="r-upcoming"
              className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground hover:bg-muted"
            >
              Upcoming Matches
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="results" id="r-results" className="peer sr-only" />
            <Label
              htmlFor="r-results"
              className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground hover:bg-muted"
            >
              Latest Results
            </Label>
          </div>
        </RadioGroup>
      </section>

       {/* Upcoming Matches / Latest Results Section */}
       <section>
         <h2 className="text-2xl font-semibold mb-4 text-primary">
           {displayMode === 'upcoming' ? 'Upcoming Matches' : 'Latest Results'}
         </h2>
         {displayMode === 'upcoming' ? (
           loadingUpcoming ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[...Array(3)].map((_, i) => ( <Skeleton key={i} className="h-[200px] rounded-lg" /> ))}
             </div>
           ) : filteredUpcomingEvents.length > 0 ? (
              <MatchList events={filteredUpcomingEvents} />
           ) : (
             <p className="text-muted-foreground">No upcoming matches found{selectedSport !== 'all' ? ` for ${selectedSport}` : ''}.</p>
           )
         ) : (
            loadingResults ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[...Array(3)].map((_, i) => ( <Skeleton key={i} className="h-[180px] rounded-lg" /> ))}
              </div>
            ) : filteredResults.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredResults.map((result) => {
                  const match = upcomingEvents.find(e => e.id === result.matchId);
                  return (
                     <Card key={result.matchId} className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                      <CardHeader className="bg-secondary p-4">
                        <CardTitle className="text-lg font-semibold text-secondary-foreground">
                          {match?.matchTitle || `Match ${result.matchId}`}
                        </CardTitle>
                         <CardDescription className="text-xs text-muted-foreground">
                            {match ? `${format(new Date(match.date), 'PPP')} at ${match.time}` : 'Date unavailable'}
                          </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-center font-medium">
                           <span>{match?.teams[0] || 'Team 1'}</span>
                          <Badge variant={result.winningTeam === (match?.teams[0] || 'Team 1') ? 'default' : 'outline'} className="text-lg px-3 py-1">{result.team1Score}</Badge>
                         </div>
                         <div className="flex justify-between items-center font-medium">
                           <span>{match?.teams[1] || 'Team 2'}</span>
                           <Badge variant={result.winningTeam === (match?.teams[1] || 'Team 2') ? 'default' : 'outline'} className="text-lg px-3 py-1">{result.team2Score}</Badge>
                         </div>
                         <div className="flex items-center justify-center pt-2 text-center">
                           <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                           <span className="font-semibold text-green-600">{result.winningTeam} wins!</span>
                         </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">No results found{selectedSport !== 'all' ? ` for ${selectedSport}` : ''}.</p>
            )
         )}
       </section>


      {/* Leaderboard Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-primary">Leaderboard</h2>
         {/* Placeholder for Leaderboard Table */}
         <LeaderboardTable />
      </section>
    </div>
  );
};

export default HomePage;
