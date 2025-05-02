'use client';

 import { useState, useEffect } from 'react';
 import { SportsEvent, MatchResult } from '@/services/sports-data';
 import { getSportsEvents, getMatchResult } from '@/services/sports-data';
 import { SportsFilter } from '@/components/sports-filter';
 import { Skeleton } from '@/components/ui/skeleton';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Trophy } from 'lucide-react';
 import { format } from 'date-fns';
 import Image from 'next/image'; // Import next/image


 export default function ResultsPage() {
   const [events, setEvents] = useState<SportsEvent[]>([]);
   const [results, setResults] = useState<MatchResult[]>([]);
   const [loading, setLoading] = useState(true);
   const [selectedSport, setSelectedSport] = useState<string>('all');

   useEffect(() => {
     async function loadData() {
       try {
         setLoading(true);
         const fetchedEvents = await getSportsEvents();
         setEvents(fetchedEvents);

         // Fetch results for all events
         const resultsPromises = fetchedEvents.map(event => getMatchResult(event.id));
         const fetchedResults = (await Promise.all(resultsPromises))
            .filter(r => r !== null) as MatchResult[];

         // Sort results by match date (descending - most recent first)
         fetchedResults.sort((a, b) => {
             const matchA = fetchedEvents.find(e => e.id === a.matchId);
             const matchB = fetchedEvents.find(e => e.id === b.matchId);
             if (!matchA || !matchB) return 0; // Should not happen if data is consistent
             const dateA = new Date(`${matchA.date}T${matchA.time}`);
             const dateB = new Date(`${matchB.date}T${matchB.time}`);
             return dateB.getTime() - dateA.getTime();
         });

         setResults(fetchedResults);

       } catch (error) {
         console.error("Failed to load results:", error);
         // Add error handling
       } finally {
         setLoading(false);
       }
     }
     loadData();
   }, []);

    const filteredResults = results.filter(result => {
       const match = events.find(e => e.id === result.matchId);
       if (!match) return false; // Skip if match details not found
       return selectedSport === 'all' || match.matchTitle.toLowerCase().includes(selectedSport.toLowerCase());
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
          <h2 className="text-xl font-semibold mb-4 text-primary">Completed Matches</h2>
         {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => ( <Skeleton key={i} className="h-[200px] rounded-lg" /> ))}
            </div>
         ) : filteredResults.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredResults.map((result, index) => {
               const match = events.find(e => e.id === result.matchId);
               if (!match) return null; // Should not happen based on filter logic

                return (
                   <Card
                     key={result.matchId}
                     className="overflow-hidden transition-all duration-500 ease-out hover:shadow-xl animate-fade-in"
                     style={{ animationDelay: `${index * 100}ms` }}
                   >
                     <CardHeader className="p-4 bg-secondary">
                       <CardTitle className="text-lg font-semibold text-secondary-foreground">
                         {match.matchTitle}
                       </CardTitle>
                       <CardDescription className="text-xs text-muted-foreground">
                         {format(new Date(match.date), 'PPP')} - {match.time}
                       </CardDescription>
                     </CardHeader>
                     <CardContent className="p-4 space-y-3">
                       {result.winningTeamPhotoUrl && (
                          <div className="relative h-32 w-full rounded-md overflow-hidden mb-3">
                            <Image
                              src={result.winningTeamPhotoUrl}
                              alt={`${result.winningTeam} winning moment`}
                              layout="fill"
                              objectFit="cover"
                              data-ai-hint="winning team photo"
                              className="transition-transform duration-300 hover:scale-105"
                            />
                          </div>
                       )}
                       <div className="flex justify-between items-center font-medium">
                         <span>{match.teams[0]}</span>
                         <Badge
                            variant={result.winningTeam === match.teams[0] ? 'default' : 'outline'}
                            className="text-lg px-3 py-1 bg-primary/10 text-primary border-primary/30"
                         >
                           {result.team1Score}
                         </Badge>
                       </div>
                       <div className="flex justify-between items-center font-medium">
                         <span>{match.teams[1]}</span>
                         <Badge
                            variant={result.winningTeam === match.teams[1] ? 'default' : 'outline'}
                            className="text-lg px-3 py-1 bg-primary/10 text-primary border-primary/30"
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
           from { opacity: 0; }
           to { opacity: 1; }
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
