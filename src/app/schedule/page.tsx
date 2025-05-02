

'use client';

import { useState, useEffect } from 'react';
import type { SportsEvent, MatchResult } from '@/services/sports-data';
import { getSportsEvents, getMatchResult } from '@/services/sports-data'; // Use Firestore function
import { MatchList } from '@/components/match-list';
import { SportsFilter } from '@/components/sports-filter';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Timestamp } from 'firebase/firestore'; // Import Timestamp type

// Convert Firestore Timestamp to JS Date, handling potential undefined or null
const getDateFromTimestamp = (timestamp: Timestamp | Date | undefined): Date | null => {
    if (!timestamp) return null;
    if (timestamp instanceof Date) {
        return timestamp;
    }
    if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
    }
    console.warn("Invalid timestamp received in SchedulePage:", timestamp);
    return null;
};


export default function SchedulePage() {
  const [allEvents, setAllEvents] = useState<SportsEvent[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]); // Store results to filter events
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingResults, setLoadingResults] = useState(true); // Add loading state for results
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingEvents(true);
        setLoadingResults(true);
        console.log("SchedulePage: Fetching events...");
        const fetchedEvents = await getSportsEvents(); // Fetches ordered events from Firestore
        setAllEvents(fetchedEvents);
         console.log("SchedulePage: Fetched events count:", fetchedEvents.length);


        console.log("SchedulePage: Fetching results...");
        // Fetch results to identify completed matches
        const resultsPromises = fetchedEvents.map(async (event) => {
            try {
                return await getMatchResult(event.id);
            } catch (error) {
                console.error(`SchedulePage: Failed to fetch result for event ${event.id}:`, error);
                // If fetching a specific result fails, treat it as if no result exists for filtering purposes
                return null;
            }
        });
        const fetchedResults = (await Promise.all(resultsPromises)).filter(r => r !== null) as MatchResult[];
        setResults(fetchedResults);
        console.log("SchedulePage: Fetched results count:", fetchedResults.length);


      } catch (error) {
        console.error("SchedulePage: Failed to load schedule data:", error);
         toast({
             title: "Error Loading Data",
             description: "Could not fetch matches or results. Please try again later.",
             variant: "destructive",
         });
      } finally {
        setLoadingEvents(false);
        setLoadingResults(false);
        console.log("SchedulePage: Data loading complete.");
      }
    }
    loadData();
  }, [toast]); // Add toast dependency


  // Filter events: keep only those *without* results and matching the selected sport
  const filteredUpcomingEvents = allEvents
    .filter(event => !results.some(res => res.matchId === event.id)) // Exclude events with results
    .filter(event =>
        selectedSport === 'all' || event.sport.toLowerCase() === selectedSport.toLowerCase() // Filter by sport name
    )
    .sort((a, b) => { // Ensure sorting by date ascending
        const timeA = getDateFromTimestamp(a.dateTime)?.getTime() ?? 0;
        const timeB = getDateFromTimestamp(b.dateTime)?.getTime() ?? 0;
        return timeA - timeB;
    });

  const isLoading = loadingEvents || loadingResults; // Combined loading state

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <CalendarDays className="w-7 h-7" />
            Match Schedule
        </h1>
         {/* Date filter could be added here */}
      </div>
       <p className="text-muted-foreground">
         Browse upcoming sports events. Use the filter below to select a specific sport. Matches with results are automatically excluded.
       </p>

      <section>
         <h2 className="text-xl font-semibold mb-3 text-primary">Filter by Sport</h2>
        <SportsFilter selectedSport={selectedSport} onSelectSport={setSelectedSport} />
      </section>

      <section>
         <h2 className="text-xl font-semibold mb-4 text-primary">
           Upcoming Events
           {selectedSport !== 'all' ? ` (${selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)})` : ''}
         </h2>
        {isLoading ? ( // Use combined loading state
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => ( <Skeleton key={`skel-sch-${i}`} className="h-[250px] rounded-lg" /> ))}
            </div>
        ) : filteredUpcomingEvents.length > 0 ? (
          // Pass already sorted and filtered events to MatchList
          <MatchList events={filteredUpcomingEvents} />
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No upcoming matches found{selectedSport !== 'all' ? ` for ${selectedSport}` : ''}. Check back later!
          </p>
        )}
      </section>
       {/* Add pagination if the list becomes long */}
    </div>
  );
}

