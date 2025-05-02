'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SportsEvent } from '@/services/sports-data';
import { format } from 'date-fns';
import { Calendar, Clock, Users, MapPin, Trophy } from 'lucide-react';
import { MatchCountdown } from './match-countdown'; // Assuming this component exists

interface MatchListProps {
  events: SportsEvent[];
}

export function MatchList({ events }: MatchListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event, index) => (
        <Card
          key={event.id}
          className="overflow-hidden transition-all duration-500 ease-out hover:shadow-xl animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms` }} // Stagger animation
        >
          <CardHeader className="bg-gradient-to-r from-primary to-blue-700 text-primary-foreground p-4">
             <div className="flex justify-between items-center">
               <CardTitle className="text-xl font-bold">{event.matchTitle}</CardTitle>
               <Badge variant="secondary" className="capitalize bg-accent text-accent-foreground px-2 py-1 text-xs">
                 {event.matchType}
               </Badge>
             </div>
             <CardDescription className="text-sm text-blue-200 flex items-center gap-2 mt-1">
                <Users className="w-4 h-4" /> {event.teams.join(' vs ')}
             </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2 text-primary" />
              <span>{format(new Date(event.date), 'EEEE, MMMM do, yyyy')}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-2 text-primary" />
              <span>{event.time}</span>
            </div>
             {/* Placeholder for venue */}
             <div className="flex items-center text-sm text-muted-foreground">
               <MapPin className="w-4 h-4 mr-2 text-primary" />
               <span>Main Stadium</span>
             </div>

            {/* Match Countdown */}
             <MatchCountdown targetDate={new Date(`${event.date}T${event.time}`)} />

          </CardContent>
           <CardFooter className="p-4 bg-secondary/50">
               <Button
                 variant="default"
                 size="sm"
                 className="w-full bg-accent hover:bg-accent/90 text-accent-foreground transition-transform transform hover:scale-105 hover:shadow-lg"
                 onClick={() => alert(`Viewing details for match ${event.id}`)} // Placeholder action
               >
                 View Details / Results
               </Button>
           </CardFooter>
        </Card>
      ))}
       <style jsx>{`
         @keyframes fadeInUp {
           from {
             opacity: 0;
             transform: translateY(20px);
           }
           to {
             opacity: 1;
             transform: translateY(0);
           }
         }
         .animate-fade-in-up {
           animation: fadeInUp 0.6s ease-out forwards;
           opacity: 0; /* Start hidden */
         }
       `}</style>
    </div>
  );
}
