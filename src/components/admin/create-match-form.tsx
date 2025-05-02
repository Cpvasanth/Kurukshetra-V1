
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CalendarIcon, CheckCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { createSportsEvent } from '@/services/sports-data'; // Import the actual service function
import type { SportsEvent, Sport, Gender } from '@/services/sports-data';


// Define available sports and genders (could also be fetched or defined elsewhere)
const availableSports: Sport[] = [
  'Cricket', 'Football', 'Basketball', 'Carrom', 'Chess', 'Volleyball',
  'Throwball', 'Table Tennis', 'Kho Kho', 'Badminton', 'Athletics Indoor', 'Athletics Outdoor', 'Other'
];
const availableGenders: Gender[] = ['Boys', 'Girls', 'Mixed'];


const matchSchema = z.object({
  matchTitle: z.string().min(3, { message: 'Match title must be at least 3 characters.' }),
  sport: z.enum(availableSports as [Sport, ...Sport[]], { // Use type assertion for enum
    required_error: 'Please select a sport.',
  }),
   gender: z.enum(availableGenders as [Gender, ...Gender[]], { // Use type assertion for enum
     required_error: 'Please select a gender category.',
   }),
  matchType: z.enum(['Normal', 'Semi-final', 'Final'], { required_error: 'Please select a match type.' }),
  date: z.date({ required_error: 'Please select a date.' }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Invalid time format (HH:MM).' }),
  team1: z.string().min(1, { message: 'Please enter the first team name.' }),
  team2: z.string().min(1, { message: 'Please enter the second team name.' }),
})
// Add refine *after* the object definition for cross-field validation
.refine((data) => data.team1 !== data.team2, {
    message: "Teams must be different.",
    path: ["team2"], // Attach error to team2 field
});


type MatchFormData = z.infer<typeof matchSchema>;

interface CreateMatchFormProps {
  onMatchCreated?: () => void; // Callback without event argument needed for simple refresh
}

export function CreateMatchForm({ onMatchCreated }: CreateMatchFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();
  const form = useForm<MatchFormData>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      matchTitle: '',
      sport: undefined, // Default to undefined
      gender: undefined, // Default to undefined
      matchType: undefined,
      date: undefined,
      time: '',
      team1: '',
      team2: '',
    },
  });

  const onSubmit = async (data: MatchFormData) => {
    setIsLoading(true);
    setShowSuccess(false);
    console.log('Submitting match form data:', data);

    // Prepare data in the format expected by createSportsEvent
    const eventDataToSend = {
        matchTitle: data.matchTitle,
        sport: data.sport,
        gender: data.gender,
        matchType: data.matchType,
        date: format(data.date, 'yyyy-MM-dd'), // Format date as YYYY-MM-DD string
        time: data.time, // Time as HH:MM string
        teams: [data.team1, data.team2],
    };

    console.log('Data prepared for Firestore:', eventDataToSend); // Log data being sent

    try {
        // Use the actual createSportsEvent function from the service
        const createdEvent = await createSportsEvent(eventDataToSend);

        console.log('Successfully created event in Firestore:', createdEvent);

        setShowSuccess(true);
        form.reset(); // Reset form after successful submission
        toast({
            title: "Match Created!",
            description: (
                 <div className="flex items-center text-green-600">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    <span>{createdEvent.matchTitle} ({createdEvent.sport}, {createdEvent.gender}) scheduled successfully.</span>
                 </div>
            ),
             variant: 'default', // Use a 'success' variant if available
        });

        onMatchCreated?.(); // Call the refresh callback if provided

        // Hide success animation after a delay
        setTimeout(() => setShowSuccess(false), 3000);

    } catch (error) {
        console.error("Failed to create match in Firestore:", error);
         toast({
             title: "Error Creating Match",
             description: error instanceof Error ? error.message : "Could not schedule the match. Please check Firestore rules and console logs.",
             variant: "destructive",
         });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="matchTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Match Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Skylaros vs Dracarys Championship" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField
               control={form.control}
               name="sport"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Sport</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                     <FormControl>
                       <SelectTrigger>
                         <SelectValue placeholder="Select sport" />
                       </SelectTrigger>
                     </FormControl>
                     <SelectContent>
                       {availableSports.map(sportName => (
                         <SelectItem key={sportName} value={sportName}>
                           {sportName}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   <FormMessage />
                 </FormItem>
               )}
             />

             <FormField
               control={form.control}
               name="matchType"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Match Type</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                     <FormControl>
                       <SelectTrigger>
                         <SelectValue placeholder="Select match type" />
                       </SelectTrigger>
                     </FormControl>
                     <SelectContent>
                       <SelectItem value="Normal">Normal</SelectItem>
                       <SelectItem value="Semi-final">Semi-final</SelectItem>
                       <SelectItem value="Final">Final</SelectItem>
                     </SelectContent>
                   </Select>
                   <FormMessage />
                 </FormItem>
               )}
             />
        </div>

         <FormField
           control={form.control}
           name="gender"
           render={({ field }) => (
             <FormItem className="space-y-3">
               <FormLabel>Gender Category</FormLabel>
               <FormControl>
                 <RadioGroup
                   onValueChange={field.onChange}
                   defaultValue={field.value}
                   className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-4"
                   disabled={isLoading}
                 >
                   {availableGenders.map(genderType => (
                     <FormItem key={genderType} className="flex items-center space-x-3 space-y-0">
                       <FormControl>
                         <RadioGroupItem value={genderType} />
                       </FormControl>
                       <FormLabel className="font-normal">
                         {genderType}
                       </FormLabel>
                     </FormItem>
                   ))}
                 </RadioGroup>
               </FormControl>
               <FormMessage />
             </FormItem>
           )}
         />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <FormField
             control={form.control}
             name="date"
             render={({ field }) => (
               <FormItem className="flex flex-col">
                 <FormLabel>Date</FormLabel>
                 <Popover>
                   <PopoverTrigger asChild>
                     <FormControl>
                       <Button
                         variant={"outline"}
                         className={cn(
                           "w-full justify-start text-left font-normal",
                           !field.value && "text-muted-foreground"
                         )}
                         disabled={isLoading}
                       >
                         <CalendarIcon className="mr-2 h-4 w-4" />
                         {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                       </Button>
                     </FormControl>
                   </PopoverTrigger>
                   <PopoverContent className="w-auto p-0" align="start">
                     <Calendar
                       mode="single"
                       selected={field.value}
                       onSelect={field.onChange}
                       disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) || isLoading} // Disable past dates
                       initialFocus
                     />
                   </PopoverContent>
                 </Popover>
                 <FormMessage />
               </FormItem>
             )}
           />

           <FormField
             control={form.control}
             name="time"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Time (HH:MM)</FormLabel>
                 <FormControl>
                   {/* Use standard time input */}
                   <Input type="time" {...field} disabled={isLoading} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />
        </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="team1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team 1</FormLabel>
                  <FormControl>
                    {/* TODO: Could be a Select if teams are predefined */}
                    <Input placeholder="Enter first team name" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="team2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team 2</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter second team name" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>


        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 transition-transform transform hover:scale-105" disabled={isLoading}>
           {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Scheduling...' : 'Schedule Match'}
        </Button>

         {showSuccess && (
            <div className="flex justify-center items-center mt-4 p-3 bg-green-100 border border-green-300 rounded-md animate-pulse">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-green-700 font-medium">Match Created Successfully!</span>
            </div>
        )}
      </form>
    </Form>
  );
}
