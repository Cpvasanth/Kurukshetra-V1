
'use client';

import { useState, useEffect } from 'react';
import type { SportsEvent } from '@/services/sports-data';
import { getSportsEvents } from '@/services/sports-data'; // Use Firestore function
import { MatchList } from '@/components/match-list';
import { SportsFilter } from '@/components/sports-filter';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


export default function SchedulePage() {
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const fetchedEvents = await getSportsEvents(); // Fetches ordered events from Firestore
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Failed to load schedule:", error);
         toast({
             title: "Error Loading Schedule",
             description: "Could not fetch the match schedule. Please try again later.",
             variant: "destructive",
         });
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, [toast]); // Add toast dependency


  // Filter events based on selected sport (filtering happens client-side after fetch)
  const filteredEvents = events.filter(event =>
     selectedSport === 'all' || event.sport.toLowerCase() === selectedSport.toLowerCase() // Filter by sport name
   );

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
         Browse upcoming sports events. Use the filter below to select a specific sport.
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
        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => ( <Skeleton key={`skel-sch-${i}`} className="h-[250px] rounded-lg" /> ))}
            </div>
        ) : filteredEvents.length > 0 ? (
          // Pass already sorted events to MatchList
          <MatchList events={filteredEvents} />
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
