

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SportsEvent } from '@/services/sports-data';
import { format } from 'date-fns';
import { Calendar, Clock, Users, MapPin, Trophy, Activity, User, UserRound } from 'lucide-react'; // Replaced Female, Male, UserCheck with User, UserRound, Users
import { MatchCountdown } from './match-countdown'; // Assuming this component exists
import type { Timestamp } from 'firebase/firestore'; // Import Timestamp type

interface MatchListProps {
  events: SportsEvent[];
}

// Helper to get the appropriate icon for gender
const getGenderIcon = (gender: string) => {
    switch (gender) {
        case 'Boys': return <User className="w-4 h-4 shrink-0" />; // Using User icon for Boys
        case 'Girls': return <UserRound className="w-4 h-4 shrink-0" />; // Using UserRound icon for Girls
        case 'Mixed': return <Users className="w-4 h-4 shrink-0" />; // Using Users icon for Mixed
        default: return <Users className="w-4 h-4 shrink-0" />; // Fallback
    }
}


export function MatchList({ events }: MatchListProps) {

   // Convert Firestore Timestamp to JS Date
   const getDateFromTimestamp = (timestamp: Timestamp | Date): Date => {
     if (timestamp instanceof Date) {
         return timestamp; // Already a Date object (should not happen with Firestore fetch)
     }
     if (typeof timestamp?.toDate !== 'function') {
         console.warn("Received non-Timestamp value in MatchList:", timestamp);
         return new Date(); // Return current date as fallback
     }
     return timestamp.toDate();
   };


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event, index) => {
         // Ensure dateTime exists and is valid before converting
        const matchDateTime = event.dateTime ? getDateFromTimestamp(event.dateTime) : new Date(); // Fallback to current date

        return (
        <Card
          key={event.id}
          className="overflow-hidden transition-all duration-500 ease-out hover:shadow-xl animate-fade-in-up flex flex-col" // Added flex flex-col
          style={{ animationDelay: `${index * 100}ms` }} // Stagger animation
        >
          <CardHeader className="bg-gradient-to-r from-primary to-blue-700 text-primary-foreground p-4">
             <div className="flex justify-between items-start gap-2">
               <CardTitle className="text-xl font-bold flex-grow mr-2">{event.matchTitle}</CardTitle>
               <div className="flex flex-col items-end space-y-1 shrink-0">
                 <Badge variant="secondary" className="capitalize bg-accent text-accent-foreground px-2 py-1 text-xs">
                   {event.matchType}
                 </Badge>
                 <Badge variant="outline" className="capitalize bg-background/20 text-primary-foreground border-primary-foreground/50 px-2 py-1 text-xs">
                   {event.sport}
                 </Badge>
               </div>
             </div>
             <CardDescription className="text-sm text-blue-200 flex items-center gap-2 mt-1 truncate">
                <Users className="w-4 h-4 shrink-0" /> {event.teams.join(' vs ')}
             </CardDescription>
               <CardDescription className="text-sm text-blue-200 flex items-center gap-2 mt-1">
                  {getGenderIcon(event.gender)} {event.gender}
               </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3 flex-grow"> {/* Added flex-grow */}
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2 text-primary shrink-0" />
              {/* Format date from the converted timestamp */}
              <span>{format(matchDateTime, 'EEEE, MMMM do, yyyy')}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-2 text-primary shrink-0" />
               {/* Format time from the converted timestamp */}
              <span>{format(matchDateTime, 'p')}</span> {/* 'p' for localized time */}
            </div>
             {/* Location section removed */}
             {/*
             <div className="flex items-center text-sm text-muted-foreground">
               <MapPin className="w-4 h-4 mr-2 text-primary shrink-0" />
               <span>Main Stadium</span> // Removed
             </div>
             */}

            {/* Match Countdown - Pass the JS Date object */}
             <div className="pt-2"> {/* Add padding top for spacing */}
                <MatchCountdown targetDate={matchDateTime} />
             </div>

          </CardContent>
           <CardFooter className="p-4 bg-secondary/50 mt-auto"> {/* Added mt-auto */}
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
      )})}
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
