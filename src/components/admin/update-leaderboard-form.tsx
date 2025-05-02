
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
import { updateTeamStanding } from '@/services/sports-data'; // Import the actual service function
import type { TeamStanding } from '@/services/sports-data';
import { CheckCircle, Loader2, Image as ImageIcon } from 'lucide-react'; // Added ImageIcon

const standingSchema = z.object({
  teamName: z.string().min(1, { message: 'Please select a team.' }),
  points: z.coerce.number().min(0, 'Points cannot be negative.').int('Points must be an integer.'),
  logo: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')), // Optional URL
});

type StandingFormData = z.infer<typeof standingSchema>;

interface UpdateLeaderboardFormProps {
  teams: string[]; // List of all possible team names
  currentStandings: TeamStanding[]; // Current standings for pre-population
  onStandingUpdated?: () => void; // Simple refresh callback
}

export function UpdateLeaderboardForm({ teams, currentStandings, onStandingUpdated }: UpdateLeaderboardFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<StandingFormData>({
    resolver: zodResolver(standingSchema),
    defaultValues: {
      teamName: '',
      points: 0,
      logo: '',
    },
  });

  // Update form defaults when a team is selected
  useEffect(() => {
    if (selectedTeam) {
      const currentStanding = currentStandings.find(s => s.teamName === selectedTeam);
      form.reset({
        teamName: selectedTeam,
        points: currentStanding?.points ?? 0,
        logo: currentStanding?.logo ?? '',
      });
    } else {
      form.reset({ // Reset if no team is selected
        teamName: '', points: 0, logo: ''
      });
    }
  }, [selectedTeam, form, currentStandings]);

  const onSubmit = async (data: StandingFormData) => {
    if (!selectedTeam) {
      toast({ title: "Error", description: "Please select a team first.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setShowSuccess(false);
    console.log('Updating standing data:', data);

    // Prepare data in the format expected by updateTeamStanding
    const standingDataToSend = {
        teamName: data.teamName,
        points: data.points,
        logo: data.logo || undefined, // Store as undefined if empty
    };

    try {
      // Use the actual updateTeamStanding function from the service
      await updateTeamStanding(standingDataToSend);

      console.log('Successfully updated standing in Firestore for team:', data.teamName);

      setShowSuccess(true);
      toast({
        title: "Standing Updated!",
        description: (
          <div className="flex items-center text-green-600">
            <CheckCircle className="mr-2 h-5 w-5" />
            <span>Standing for {data.teamName} updated successfully.</span>
          </div>
        ),
        variant: 'default',
      });

      onStandingUpdated?.(); // Call the refresh callback

      // Hide success message after delay
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (error) {
      console.error("Failed to update standing:", error);
      toast({
        title: "Error Updating Standing",
        description: error instanceof Error ? error.message : "Could not update the team standing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeamSelect = (teamName: string) => {
    setSelectedTeam(teamName || null);
    // Reset dependent fields handled by useEffect
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="teamName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Team</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleTeamSelect(value);
                }}
                value={field.value} // Use value for controlled component
                disabled={isLoading || teams.length === 0} // Disable if loading or no teams
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={teams.length > 0 ? "Select a team to update" : "No teams available"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Teams</SelectLabel>
                    {teams.length > 0 ? (
                      teams.map((teamName) => (
                        <SelectItem key={teamName} value={teamName}>
                          {teamName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-teams" disabled>No teams available</SelectItem>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedTeam && (
          <>
            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Points</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormDescription>Enter the total points for {selectedTeam}.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Logo URL (Optional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                       <ImageIcon className="h-5 w-5 text-muted-foreground" />
                       <Input type="url" placeholder="https://example.com/team-logo.png" {...field} disabled={isLoading} />
                    </div>
                  </FormControl>
                  <FormDescription>Enter the URL of the team's logo image.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 transition-transform transform hover:scale-105" disabled={isLoading || !selectedTeam}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Updating...' : 'Update Standing'}
            </Button>

            {showSuccess && (
              <div className="flex justify-center items-center mt-4 p-3 bg-green-100 border border-green-300 rounded-md animate-pulse">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-green-700 font-medium">Standing Updated Successfully!</span>
              </div>
            )}
          </>
        )}
      </form>
    </Form>
  );
}
