'use client';

import { useState, useEffect } from 'react';
import { SportsEvent } from '@/services/sports-data';
import { getSportsEvents } from '@/services/sports-data';
import { MatchList } from '@/components/match-list';
import { SportsFilter } from '@/components/sports-filter';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays } from 'lucide-react';

export default function SchedulePage() {
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<string>('all');

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const fetchedEvents = await getSportsEvents();
        // Sort events by date and time
        fetchedEvents.sort((a, b) => {
           const dateA = new Date(`${a.date}T${a.time}`);
           const dateB = new Date(`${b.date}T${b.time}`);
           return dateA.getTime() - dateB.getTime();
        });
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Failed to load schedule:", error);
        // Add error handling (e.g., toast notification)
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const filteredEvents = events.filter(event =>
     selectedSport === 'all' || event.matchTitle.toLowerCase().includes(selectedSport.toLowerCase()) // Basic filtering
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
         <h2 className="text-xl font-semibold mb-4 text-primary">Upcoming Events</h2>
        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => ( <Skeleton key={i} className="h-[250px] rounded-lg" /> ))}
            </div>
        ) : filteredEvents.length > 0 ? (
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
