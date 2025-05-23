

'use client';

import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import Image from 'next/image'; // Import next/image
import deskBanner from '@/images/Sports-Background.jpg'; // Import your image asset
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { SportsFilter } from '@/components/sports-filter';
import { GenderFilter } from '@/components/gender-filter'; // Import GenderFilter
import { MatchList } from '@/components/match-list';
import { LeaderboardTable } from '@/components/leaderboard-table';
import type { SportsEvent, MatchResult, Gender } from '@/services/sports-data'; // Add Gender type
import { getSportsEvents, getMatchResult } from '@/services/sports-data'; // Use Firestore functions
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Clock, Calendar, Users, Trophy, Loader2, User, UserRound } from 'lucide-react'; // Replaced Female, Male, UserCheck with User, UserRound, Users
import { useToast } from '@/hooks/use-toast';
import type { Timestamp } from 'firebase/firestore'; // Import Timestamp type

// Helper to get the appropriate icon for gender
const getGenderIcon = (gender: string | undefined) => { // Allow undefined
    switch (gender?.toLowerCase()) { // Add nullish coalescing and toLowerCase for safety
        case 'boys': return <User className="w-4 h-4 shrink-0" />; // Using User icon for Boys
        case 'girls': return <UserRound className="w-4 h-4 shrink-0" />; // Using UserRound icon for Girls
        case 'mixed': return <Users className="w-4 h-4 shrink-0" />; // Using Users icon for Mixed
        default: return <Users className="w-4 h-4 shrink-0" />; // Fallback
    }
}


const HomePage: NextPage = () => {
  const [displayMode, setDisplayMode] = useState<'upcoming' | 'results'>('upcoming');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all'); // Add state for gender filter
  const [allEvents, setAllEvents] = useState<SportsEvent[]>([]); // Store all fetched events
  const [latestResults, setLatestResults] = useState<MatchResult[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingResults, setLoadingResults] = useState(true);
  const { toast } = useToast();


   // Convert Firestore Timestamp to JS Date, handling potential undefined or null
   const getDateFromTimestamp = (timestamp: Timestamp | Date | undefined): Date | null => {
       if (!timestamp) return null; // Return null if timestamp is undefined or null
       if (timestamp instanceof Date) {
           return timestamp; // Already a Date object
       }
       // Add check for valid timestamp object
       if (timestamp && typeof timestamp.toDate === 'function') {
           return timestamp.toDate();
       }
       // Fallback or error handling for invalid timestamp
       console.warn("Invalid timestamp received:", timestamp);
       return null; // Return null for invalid timestamps
   };


  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingEvents(true);
        setLoadingResults(true); // Start loading results as well

        console.log("HomePage: Fetching events...");
        const events = await getSportsEvents(); // Fetches from Firestore
        setAllEvents(events); // Store all events
        console.log("HomePage: Fetched events count:", events.length);


        console.log("HomePage: Fetching results...");
        // Fetch results concurrently for all fetched events
        const resultsPromises = events.map(async (event) => {
            try {
                const result = await getMatchResult(event.id);
                // Include event details with the result for sorting and filtering
                return result ? { ...result, eventDetails: event } : null;
            } catch (error) {
                console.error(`HomePage: Failed to fetch result for event ${event.id}:`, error);
                // Return null if fetching a specific result fails, allowing others to proceed
                return null;
            }
        });
        const fetchedResultsWithDetails = (await Promise.all(resultsPromises))
            .filter(r => r !== null) as (MatchResult & { eventDetails: SportsEvent })[]; // Filter out nulls safely

        console.log("HomePage: Fetched results count (before sorting):", fetchedResultsWithDetails.length);

         // Sort results by descending match date/time using the timestamp from the event details
         fetchedResultsWithDetails.sort((a, b) => {
             // eventDetails should always exist here due to filtering
             const timeA = getDateFromTimestamp(a.eventDetails.dateTime)?.getTime() ?? 0; // Use nullish coalescing
             const timeB = getDateFromTimestamp(b.eventDetails.dateTime)?.getTime() ?? 0;
             return timeB - timeA; // Descending order
         });


        // Remove the eventDetails before setting state if not needed in MatchResult type
        const finalResults = fetchedResultsWithDetails.map(({ eventDetails, ...result }) => result);
        setLatestResults(finalResults);
         console.log("HomePage: Final results count:", finalResults.length);


      } catch (error) {
        console.error("HomePage: Failed to fetch data:", error);
         toast({
            title: "Error Fetching Data",
            description: "Could not load matches or results. Please try again later.",
            variant: "destructive",
          });
      } finally {
        setLoadingEvents(false); // Events loading finished
        setLoadingResults(false); // Results loading finished
        console.log("HomePage: Data fetching complete.");
      }
    }
    fetchData();
  }, [toast]); // Add toast to dependency array


  const filteredUpcomingEvents = allEvents
    .filter(event => !latestResults.some(res => res.matchId === event.id)) // Filter out events that have results
    .filter(event =>
        (selectedSport === 'all' || event.sport.toLowerCase() === selectedSport.toLowerCase())
        && (selectedGender === 'all' || event.gender.toLowerCase() === selectedGender.toLowerCase()) // Add gender filter logic
     )
    .sort((a, b) => { // Ensure upcoming are sorted by date ascending
        const timeA = getDateFromTimestamp(a.dateTime)?.getTime() ?? 0;
        const timeB = getDateFromTimestamp(b.dateTime)?.getTime() ?? 0;
        return timeA - timeB;
    });

  const filteredResults = latestResults.filter(result => {
     const match = allEvents.find(e => e.id === result.matchId);
     if (!match) return false; // Skip if match not found
     return (selectedSport === 'all' || match.sport.toLowerCase() === selectedSport.toLowerCase())
     && (selectedGender === 'all' || match.gender.toLowerCase() === selectedGender.toLowerCase()) // Add gender filter logic
  });


  return (
    <div className="space-y-8">
      {/* Hero Image Section */}
        <section className="mb-8">
            <div className="relative aspect-[16/6] w-full overflow-hidden rounded-lg shadow-lg"> {/* Adjust aspect ratio as needed */}
                <Image
                    src={deskBanner}// Placeholder URL
                    alt="Kurukshetra Sports Event Banner"
                    fill
                    
                    style={{ objectFit: 'cover' }} // Use style for objectFit
                    data-ai-hint="sports event banner cricket" // Hint for finding the right image
                    priority // Load image sooner
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" />
                <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-red-600">
                    <h1 className="text-3xl md:text-5xl font-extrabold drop-shadow-md mb-2">
                        Kurukshetra Sports Event
                    </h1>
                    <p className="text-lg md:text-xl font-medium drop-shadow-sm">
                        Catch all the action live!
                    </p>
                </div>
            </div>
        </section>

      {/* Filters Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-primary">Filter by Sport</h2>
          <SportsFilter selectedSport={selectedSport} onSelectSport={setSelectedSport} />
        </div>
        <div>
           <h2 className="text-2xl font-semibold mb-2 text-primary">Filter by Gender</h2>
           <GenderFilter selectedGender={selectedGender} onSelectGender={setSelectedGender} />
        </div>
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
           {selectedGender !== 'all' ? ` (${selectedGender.charAt(0).toUpperCase() + selectedGender.slice(1)})` : ''}
         </h2>
         {displayMode === 'upcoming' ? (
           loadingEvents ? (
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
                  const match = allEvents.find(e => e.id === result.matchId);
                  // Use a unique key combining prefix and id
                  const cardKey = `result-card-${result.matchId || Math.random()}`; // Fallback key if matchId is somehow missing
                  if (!match) {
                    // If match details aren't found (data inconsistency), skip rendering this result card
                     console.warn(`Match details not found for result with matchId: ${result.matchId}. Skipping card.`);
                     return null;
                  }
                  const matchDate = getDateFromTimestamp(match?.dateTime); // Get JS Date or null

                  return (
                     <Card key={cardKey} className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                      <CardHeader className="bg-secondary p-4">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-semibold text-secondary-foreground truncate mr-2">
                             {match.matchTitle}
                            </CardTitle>
                            {match && (
                                <Badge variant="outline" className="text-xs shrink-0 capitalize">{match.sport}</Badge>
                            )}
                        </div>
                         <CardDescription className="text-xs text-muted-foreground mt-1">
                            {/* Format date safely */}
                            {matchDate ? `${format(matchDate, 'PPP')} at ${format(matchDate,'p')}` : 'Date unavailable'}
                          </CardDescription>
                         {match && (
                             <CardDescription className="text-xs text-muted-foreground flex items-center gap-1">
                                 {getGenderIcon(match.gender)} {match.gender}
                             </CardDescription>
                         )}
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-center font-medium">
                           <span className="truncate">{match.teams[0]}</span>
                           {/* Ensure scores are numbers before displaying */}
                           <Badge variant={result.winningTeam === match.teams[0] ? 'default' : 'outline'} className="text-lg px-3 py-1">{typeof result.team1Score === 'number' ? result.team1Score : '-'}</Badge>
                         </div>
                         <div className="flex justify-between items-center font-medium">
                           <span className="truncate">{match.teams[1]}</span>
                            <Badge variant={result.winningTeam === match.teams[1] ? 'default' : 'outline'} className="text-lg px-3 py-1">{typeof result.team2Score === 'number' ? result.team2Score : '-'}</Badge>
                         </div>
                         <div className="flex items-center justify-center pt-2 text-center border-t mt-3">
                           <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                            {/* Ensure winningTeam is a string */}
                           <span className="font-semibold text-green-600">{result.winningTeam || 'N/A'} wins!</span>
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
         {/* LeaderboardTable now fetches its own data */}
         <LeaderboardTable />
      </section>
    </div>
  );
};

export default HomePage;

