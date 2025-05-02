
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { updateMatchResult } from '@/services/sports-data'; // Import the actual service function
import type { SportsEvent, MatchResult } from '@/services/sports-data';
import { CheckCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';


// Convert Firestore Timestamp to JS Date for display/form usage
const getDateFromTimestamp = (timestamp: Timestamp | Date | undefined): Date | null => {
   if (!timestamp) return null;
   if (timestamp instanceof Date) {
       return timestamp;
   }
   if (timestamp && typeof timestamp.toDate === 'function') {
       return timestamp.toDate();
   }
   console.warn("Invalid timestamp received:", timestamp);
   return null; // Return null for invalid cases
};


const resultSchema = z.object({
  matchId: z.string().min(1, { required_error: 'Please select a match.' }), // Ensure matchId is not empty
  team1Score: z.coerce.number().min(0, 'Score cannot be negative.').int('Score must be an integer.'),
  team2Score: z.coerce.number().min(0, 'Score cannot be negative.').int('Score must be an integer.'),
  winningTeam: z.string().min(1, { message: 'Please select the winning team.' }),
  winningTeamPhotoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')), // Optional URL
});

type ResultFormData = z.infer<typeof resultSchema>;

interface UpdateResultFormProps {
  matches: SportsEvent[];
  existingResults: MatchResult[];
  onResultUpdated?: () => void; // Simple refresh callback
}

export function UpdateResultForm({ matches, existingResults, onResultUpdated }: UpdateResultFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<SportsEvent | null>(null);
   const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<ResultFormData>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      matchId: '',
      team1Score: 0,
      team2Score: 0,
      winningTeam: '',
      winningTeamPhotoUrl: '',
    },
  });

   // Update form defaults when a match is selected
   useEffect(() => {
       if (selectedMatch) {
           const existing = existingResults.find(r => r.matchId === selectedMatch.id);
           form.reset({
               matchId: selectedMatch.id,
               team1Score: existing?.team1Score ?? 0,
               team2Score: existing?.team2Score ?? 0,
               winningTeam: existing?.winningTeam ?? '',
               winningTeamPhotoUrl: existing?.winningTeamPhotoUrl ?? '',
           });
       } else {
          form.reset({ // Reset if no match is selected
             matchId: '', team1Score: 0, team2Score: 0, winningTeam: '', winningTeamPhotoUrl: ''
           });
       }
   }, [selectedMatch, form, existingResults]);


  const onSubmit = async (data: ResultFormData) => {
    if (!selectedMatch) {
       toast({ title: "Error", description: "Please select a match first.", variant: "destructive" });
       return;
     }
    setIsLoading(true);
    setShowSuccess(false);
    console.log('Updating result data:', data);

     // Prepare data in the format expected by updateMatchResult
     const resultDataToSend: MatchResult = {
         matchId: data.matchId,
         team1Score: data.team1Score,
         team2Score: data.team2Score,
         winningTeam: data.winningTeam,
         winningTeamPhotoUrl: data.winningTeamPhotoUrl || undefined, // Store as undefined if empty
     };

    try {
        // Use the actual updateMatchResult function from the service
         const updatedResult = await updateMatchResult(resultDataToSend);

         console.log('Successfully updated result in Firestore:', updatedResult);

         setShowSuccess(true);
         // Optionally reset form or just show success
         // form.reset(); // Consider if resetting is desired after update
         toast({
             title: "Result Updated!",
             description: (
                  <div className="flex items-center text-green-600">
                     <CheckCircle className="mr-2 h-5 w-5" />
                     <span>Result for {selectedMatch?.matchTitle} updated successfully.</span>
                  </div>
             ),
             variant: 'default',
         });

         onResultUpdated?.(); // Call the refresh callback

         // Hide success message after delay
          setTimeout(() => setShowSuccess(false), 3000);


    } catch (error) {
      console.error("Failed to update result:", error);
      toast({
        title: "Error Updating Result",
        description: error instanceof Error ? error.message : "Could not update the result. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatchSelect = (matchId: string) => {
     const match = matches.find(m => m.id === matchId);
     setSelectedMatch(match || null);
     // Reset dependent fields when match changes (handled by useEffect now)
     // form.setValue('winningTeam', ''); // Reset winner selection
   };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="matchId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Match</FormLabel>
              <Select
                  onValueChange={(value) => {
                      field.onChange(value);
                      handleMatchSelect(value);
                  }}
                  value={field.value} // Use value for controlled component
                  disabled={isLoading || matches.length === 0} // Disable if loading or no matches
               >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={matches.length > 0 ? "Select a match to update" : "No matches available"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                     <SelectLabel>Matches</SelectLabel>
                     {matches.length > 0 ? (
                         matches.map((match) => {
                            const matchDate = getDateFromTimestamp(match.dateTime);
                            const displayDate = matchDate ? format(matchDate, 'PP') : 'Invalid Date';
                            return (
                               <SelectItem key={match.id} value={match.id}>
                                 {match.matchTitle} ({displayDate})
                               </SelectItem>
                            )
                         })
                     ) : (
                         <SelectItem value="no-matches" disabled>No matches available</SelectItem>
                     )}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedMatch && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                 control={form.control}
                 name="team1Score"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>{selectedMatch.teams[0]} Score</FormLabel>
                     <FormControl>
                       <Input type="number" min="0" {...field} disabled={isLoading} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <FormField
                 control={form.control}
                 name="team2Score"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>{selectedMatch.teams[1]} Score</FormLabel>
                     <FormControl>
                       <Input type="number" min="0" {...field} disabled={isLoading} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
            </div>

            <FormField
              control={form.control}
              name="winningTeam"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Winning Team</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the winning team" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                       {/* Ensure teams exist before mapping */}
                      {selectedMatch.teams?.map(team => (
                         <SelectItem key={team} value={team}>{team}</SelectItem>
                      ))}
                       {/* Optionally add a 'Draw' option if applicable */}
                       {/* <SelectItem value="Draw">Draw</SelectItem> */}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

             <FormField
               control={form.control}
               name="winningTeamPhotoUrl"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Winning Team Photo URL (Optional)</FormLabel>
                   <FormControl>
                     <Input type="url" placeholder="https://example.com/winning-photo.jpg" {...field} disabled={isLoading} />
                   </FormControl>
                   <FormDescription>Enter the URL of an image for the winning team.</FormDescription>
                   <FormMessage />
                 </FormItem>
               )}
             />

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 transition-transform transform hover:scale-105" disabled={isLoading || !selectedMatch}>
               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Updating...' : 'Update Result'}
            </Button>

            {showSuccess && (
                <div className="flex justify-center items-center mt-4 p-3 bg-green-100 border border-green-300 rounded-md animate-pulse">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                    <span className="text-green-700 font-medium">Result Updated Successfully!</span>
                </div>
            )}
          </>
        )}
      </form>
    </Form>
  );
}
