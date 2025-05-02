
'use client';

 import { useState, useEffect } from 'react';
 import { SportsEvent, MatchResult } from '@/services/sports-data';
 import { getSportsEvents, getMatchResult } from '@/services/sports-data'; // Use Firestore functions
 import { SportsFilter } from '@/components/sports-filter';
 import { Skeleton } from '@/components/ui/skeleton';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Trophy, Loader2, Users, User, UserRound } from 'lucide-react'; // Replaced Female, Male, UserCheck with User, UserRound, Users
 import { format } from 'date-fns';
 import Image from 'next/image'; // Import next/image
 import { useToast } from '@/hooks/use-toast';
 import type { Timestamp } from 'firebase/firestore'; // Import Timestamp type

 // Helper to get the appropriate icon for gender
 const getGenderIcon = (gender: string | undefined) => { // Allow undefined
     switch (gender?.toLowerCase()) { // Safe navigation and lowercase
         case 'boys': return <User className="w-4 h-4 shrink-0" />;
         case 'girls': return <UserRound className="w-4 h-4 shrink-0" />;
         case 'mixed': return <Users className="w-4 h-4 shrink-0" />;
         default: return <Users className="w-4 h-4 shrink-0" />; // Fallback
     }
 }

 // Convert Firestore Timestamp to JS Date, handling potential undefined or null
 const getDateFromTimestamp = (timestamp: Timestamp | Date | undefined): Date | null => {
     if (!timestamp) return null;
     if (timestamp instanceof Date) {
         return timestamp;
     }
     if (timestamp && typeof timestamp.toDate === 'function') {
         return timestamp.toDate();
     }
     console.warn("Invalid timestamp received in results:", timestamp);
     return null;
 };


 export default function ResultsPage() {
   const [events, setEvents] = useState<SportsEvent[]>([]);
   const [results, setResults] = useState<MatchResult[]>([]);
   const [loading, setLoading] = useState(true);
   const [selectedSport, setSelectedSport] = useState<string>('all');
   const { toast } = useToast();


   useEffect(() => {
     async function loadData() {
       try {
         setLoading(true);
         console.log("ResultsPage: Fetching events...");
         const fetchedEvents = await getSportsEvents(); // Fetches from Firestore
         console.log("ResultsPage: Fetched events count:", fetchedEvents.length);
         setEvents(fetchedEvents);

         console.log("ResultsPage: Fetching results...");
         // Fetch results for all events concurrently
         const resultsPromises = fetchedEvents.map(event => getMatchResult(event.id));
         const fetchedResults = (await Promise.all(resultsPromises))
            .filter(r => r !== null) as MatchResult[];
         console.log("ResultsPage: Fetched results count:", fetchedResults.length);


         // Sort results by match date (descending - most recent first) using timestamp
         fetchedResults.sort((a, b) => {
             const matchA = fetchedEvents.find(e => e.id === a.matchId);
             const matchB = fetchedEvents.find(e => e.id === b.matchId);
             if (!matchA || !matchB) return 0; // Should not happen if data is consistent
             const timeA = getDateFromTimestamp(matchA.dateTime)?.getTime() ?? 0; // Use nullish coalescing
             const timeB = getDateFromTimestamp(matchB.dateTime)?.getTime() ?? 0;
             return timeB - timeA; // Descending order
         });

         setResults(fetchedResults);
         console.log("ResultsPage: Data loading complete.");

       } catch (error) {
         console.error("Failed to load results data:", error);
          toast({
            title: "Error Loading Results",
            description: "Could not fetch match results. Please try again later.",
            variant: "destructive",
          });
       } finally {
         setLoading(false);
       }
     }
     loadData();
   }, [toast]); // Add toast dependency

    // Filter results based on the selected sport, ensuring the associated match exists
    const filteredResults = results.filter(result => {
       const match = events.find(e => e.id === result.matchId);
       if (!match) return false; // Skip if match details not found
       return selectedSport === 'all' || match.sport.toLowerCase() === selectedSport.toLowerCase(); // Filter by sport name
   });


   return (
     <div className="space-y-8">
       <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
         <Trophy className="w-7 h-7 text-yellow-500" />
         Match Results
       </h1>
        <p className="text-muted-foreground">
          View the outcomes of recently completed matches. Filter by sport below.
        </p>


       <section>
         <h2 className="text-xl font-semibold mb-3 text-primary">Filter by Sport</h2>
         <SportsFilter selectedSport={selectedSport} onSelectSport={setSelectedSport} />
       </section>

       <section>
          <h2 className="text-xl font-semibold mb-4 text-primary">
            Completed Matches
             {selectedSport !== 'all' ? ` (${selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)})` : ''}
          </h2>
         {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => ( <Skeleton key={`skel-res-pg-${i}`} className="h-[250px] rounded-lg" /> ))}
            </div>
         ) : filteredResults.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredResults.map((result, index) => {
               const match = events.find(e => e.id === result.matchId);
               // Match should always exist based on filter logic, but add a check for safety
               if (!match) {
                  console.warn("Could not find match details for result:", result);
                  return null;
               }

               const matchDate = getDateFromTimestamp(match.dateTime);

                return (
                   <Card
                     key={result.matchId} // Use matchId as the key
                     className="overflow-hidden transition-all duration-500 ease-out hover:shadow-xl animate-fade-in flex flex-col" // Added flex flex-col
                     style={{ animationDelay: `${index * 100}ms` }}
                   >
                     <CardHeader className="p-4 bg-secondary">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg font-semibold text-secondary-foreground truncate mr-2">
                            {match.matchTitle}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs shrink-0 capitalize">{match.sport}</Badge>
                        </div>
                       <CardDescription className="text-xs text-muted-foreground mt-1">
                          {/* Safely format date and time */}
                          {matchDate ? `${format(matchDate, 'PPP')} - ${format(matchDate, 'p')}` : 'Date unavailable'}
                       </CardDescription>
                        <CardDescription className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            {getGenderIcon(match.gender)} {match.gender}
                        </CardDescription>
                     </CardHeader>
                     <CardContent className="p-4 space-y-3 flex-grow"> {/* Added flex-grow */}
                       {result.winningTeamPhotoUrl && (
                          <div className="relative h-32 w-full rounded-md overflow-hidden mb-3">
                            <Image
                              src={result.winningTeamPhotoUrl}
                              alt={`${result.winningTeam} winning moment`}
                              fill // Use fill layout
                              style={{ objectFit: 'cover' }} // Use style for objectFit
                              data-ai-hint="winning team photo"
                              className="transition-transform duration-300 hover:scale-105"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Add sizes prop
                            />
                          </div>
                       )}
                       <div className="flex justify-between items-center font-medium">
                         <span className="truncate">{match.teams[0]}</span>
                         <Badge
                            variant={result.winningTeam === match.teams[0] ? 'default' : 'outline'}
                            // Adjusted styling for score badges
                            className={`text-lg px-3 py-1 ${result.winningTeam === match.teams[0] ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border'}`}
                         >
                           {result.team1Score}
                         </Badge>
                       </div>
                       <div className="flex justify-between items-center font-medium">
                         <span className="truncate">{match.teams[1]}</span>
                         <Badge
                             variant={result.winningTeam === match.teams[1] ? 'default' : 'outline'}
                             className={`text-lg px-3 py-1 ${result.winningTeam === match.teams[1] ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border'}`}
                         >
                           {result.team2Score}
                         </Badge>
                       </div>
                       <div className="flex items-center justify-center pt-2 text-center border-t border-border mt-3">
                         <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                         <span className="font-semibold text-green-600">{result.winningTeam} wins!</span>
                       </div>
                     </CardContent>
                   </Card>
                );
              })}
           </div>
         ) : (
           <p className="text-muted-foreground text-center py-8">
             No results found{selectedSport !== 'all' ? ` for ${selectedSport}` : ''}.
           </p>
         )}
       </section>
       <style jsx>{`
         @keyframes fadeIn {
           from { opacity: 0; transform: translateY(10px); } /* Add slight upward motion */
           to { opacity: 1; transform: translateY(0); }
         }
         .animate-fade-in {
           animation: fadeIn 0.5s ease-out forwards;
           opacity: 0; /* Start hidden */
         }
       `}</style>
        {/* Add pagination if needed */}
     </div>
   );
 }
