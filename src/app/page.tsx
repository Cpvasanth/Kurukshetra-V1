

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
import { getSportsEvents, getMatchResult } from '@/services/sports-data'; // Use Firestore functions
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Clock, Calendar, Users, Trophy, Loader2, Female, Male, UserCheck } from 'lucide-react'; // Added gender icons
import { useToast } from '@/hooks/use-toast';
import type { Timestamp } from 'firebase/firestore'; // Import Timestamp type

// Helper to get the appropriate icon for gender
const getGenderIcon = (gender: string) => {
    switch (gender) {
        case 'Boys': return <Male className="w-4 h-4 shrink-0" />;
        case 'Girls': return <Female className="w-4 h-4 shrink-0" />;
        case 'Mixed': return <UserCheck className="w-4 h-4 shrink-0" />;
        default: return <Users className="w-4 h-4 shrink-0" />; // Fallback
    }
}


const HomePage: NextPage = () => {
  const [displayMode, setDisplayMode] = useState<'upcoming' | 'results'>('upcoming');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  // const [selectedGender, setSelectedGender] = useState<string>('all'); // Add state for gender filter if needed
  const [upcomingEvents, setUpcomingEvents] = useState<SportsEvent[]>([]);
  const [latestResults, setLatestResults] = useState<MatchResult[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [loadingResults, setLoadingResults] = useState(true);
  const { toast } = useToast();


   // Convert Firestore Timestamp to JS Date
   const getDateFromTimestamp = (timestamp: Timestamp | Date): Date => {
       if (timestamp instanceof Date) {
           return timestamp; // Already a Date object
       }
       // Add check for valid timestamp object
       if (timestamp && typeof timestamp.toDate === 'function') {
           return timestamp.toDate();
       }
       // Fallback or error handling for invalid timestamp
       console.warn("Invalid timestamp received:", timestamp);
       return new Date(); // Return current date as a fallback
   };


  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingUpcoming(true);
        setLoadingResults(true); // Start loading results as well

        const events = await getSportsEvents(); // Fetches from Firestore

        // Fetch results concurrently
        const resultsPromises = events.map(event => getMatchResult(event.id));
        const fetchedResults = (await Promise.all(resultsPromises)).filter(r => r !== null) as MatchResult[];

         // Sort results by descending match date/time using the timestamp from the event
         fetchedResults.sort((a, b) => {
             const matchA = events.find(e => e.id === a.matchId);
             const matchB = events.find(e => e.id === b.matchId);
             // Handle cases where match might not be found (though unlikely if data is consistent)
             if (!matchA || !matchB) return 0;
             const timeA = getDateFromTimestamp(matchA.dateTime).getTime();
             const timeB = getDateFromTimestamp(matchB.dateTime).getTime();
             return timeB - timeA; // Descending order
         });


        setUpcomingEvents(events);
        setLatestResults(fetchedResults);

      } catch (error) {
        console.error("Failed to fetch data:", error);
         toast({
            title: "Error Fetching Data",
            description: "Could not load matches or results. Please try again later.",
            variant: "destructive",
          });
      } finally {
        setLoadingUpcoming(false);
        setLoadingResults(false); // Results loading finished
      }
    }
    fetchData();
  }, [toast]); // Add toast to dependency array


  const filteredUpcomingEvents = upcomingEvents.filter(event =>
    (selectedSport === 'all' || event.sport.toLowerCase() === selectedSport.toLowerCase())
    // && (selectedGender === 'all' || event.gender.toLowerCase() === selectedGender.toLowerCase()) // Add gender filter logic if needed
  );

  const filteredResults = latestResults.filter(result => {
     const match = upcomingEvents.find(e => e.id === result.matchId);
     if (!match) return false; // Skip if match not found
     return (selectedSport === 'all' || match.sport.toLowerCase() === selectedSport.toLowerCase())
     // && (selectedGender === 'all' || match.gender.toLowerCase() === selectedGender.toLowerCase()) // Add gender filter logic if needed
  });


  return (
    <div className="space-y-8">
      {/* Sports Filter Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-primary">Filter by Sport</h2>
         <SportsFilter selectedSport={selectedSport} onSelectSport={setSelectedSport} />
         {/* Optionally add Gender Filter Component here */}
         {/* <GenderFilter selectedGender={selectedGender} onSelectGender={setSelectedGender} /> */}
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
           {selectedSport !== 'all' ? ` (${selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)})` : ''}
           {/* {selectedGender !== 'all' ? ` (${selectedGender.charAt(0).toUpperCase() + selectedGender.slice(1)})` : ''} */}
         </h2>
         {displayMode === 'upcoming' ? (
           loadingUpcoming ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[...Array(3)].map((_, i) => ( <Skeleton key={`skel-up-${i}`} className="h-[250px] rounded-lg" /> ))}
             </div>
           ) : filteredUpcomingEvents.length > 0 ? (
              <MatchList events={filteredUpcomingEvents} />
           ) : (
             <p className="text-muted-foreground text-center py-6">No upcoming matches found for the selected filters.</p>
           )
         ) : (
            loadingResults ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[...Array(3)].map((_, i) => ( <Skeleton key={`skel-res-${i}`} className="h-[180px] rounded-lg" /> ))}
              </div>
            ) : filteredResults.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredResults.map((result) => {
                  const match = upcomingEvents.find(e => e.id === result.matchId);
                  // Use a unique key combining prefix and id
                  const cardKey = `result-card-${result.matchId}`;
                  return (
                     <Card key={cardKey} className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                      <CardHeader className="bg-secondary p-4">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-semibold text-secondary-foreground truncate mr-2">
                            {match?.matchTitle || `Match ${result.matchId}`}
                            </CardTitle>
                            {match && (
                                <Badge variant="outline" className="text-xs shrink-0 capitalize">{match.sport}</Badge>
                            )}
                        </div>
                         <CardDescription className="text-xs text-muted-foreground mt-1">
                            {match ? `${format(getDateFromTimestamp(match.dateTime), 'PPP')} at ${format(getDateFromTimestamp(match.dateTime),'p')}` : 'Date unavailable'}
                          </CardDescription>
                         {match && (
                             <CardDescription className="text-xs text-muted-foreground flex items-center gap-1">
                                 {getGenderIcon(match.gender)} {match.gender}
                             </CardDescription>
                         )}
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-center font-medium">
                           <span className="truncate">{match?.teams[0] || 'Team 1'}</span>
                          <Badge variant={result.winningTeam === (match?.teams[0] || 'Team 1') ? 'default' : 'outline'} className="text-lg px-3 py-1">{result.team1Score}</Badge>
                         </div>
                         <div className="flex justify-between items-center font-medium">
                           <span className="truncate">{match?.teams[1] || 'Team 2'}</span>
                           <Badge variant={result.winningTeam === (match?.teams[1] || 'Team 2') ? 'default' : 'outline'} className="text-lg px-3 py-1">{result.team2Score}</Badge>
                         </div>
                         <div className="flex items-center justify-center pt-2 text-center border-t mt-3">
                           <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                           <span className="font-semibold text-green-600">{result.winningTeam} wins!</span>
                         </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6">No results found for the selected filters.</p>
            )
         )}
       </section>


      {/* Leaderboard Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-primary">Leaderboard</h2>
         {/* Leaderboard might need its own loading state if data comes from elsewhere */}
         <LeaderboardTable />
      </section>
    </div>
  );
};

export default HomePage;
