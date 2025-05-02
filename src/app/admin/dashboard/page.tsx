
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateMatchForm } from '@/components/admin/create-match-form';
import { UpdateResultForm } from '@/components/admin/update-result-form';
import { UpdateLeaderboardForm } from '@/components/admin/update-leaderboard-form'; // Import the new form
import type { SportsEvent, MatchResult, TeamStanding } from '@/services/sports-data'; // Add TeamStanding
import { getSportsEvents, getMatchResult, createSportsEvent, updateMatchResult, getLeaderboardStandings, updateTeamStanding } from '@/services/sports-data'; // Add leaderboard functions
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Edit, LogOut, Loader2, Trophy } from 'lucide-react'; // Add Trophy icon
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client'; // Import initialized auth instance
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [results, setResults] = useState<(MatchResult | null)[]>([]);
  const [standings, setStandings] = useState<TeamStanding[]>([]); // State for leaderboard standings
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Authentication Check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Not logged in, redirect to login
        router.replace('/admin'); // Use replace to prevent back button issues
      }
      setAuthLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);


   // Unified data fetching function
   const refreshData = async () => {
      if (!user) return; // Don't fetch if not authenticated

      try {
        setDataLoading(true);
        console.log("Refreshing admin data...");

        // Fetch Events
        const fetchedEvents = await getSportsEvents();
        console.log("Fetched Events:", fetchedEvents.length);
        setEvents(fetchedEvents);

        // Fetch Results
        const resultsPromises = fetchedEvents.map(event => getMatchResult(event.id));
        const fetchedResults = await Promise.all(resultsPromises);
        console.log("Fetched Results:", fetchedResults.filter(r => r !== null).length);
        setResults(fetchedResults);

         // Fetch Leaderboard Standings
         const fetchedStandings = await getLeaderboardStandings();
         console.log("Fetched Standings:", fetchedStandings.length);
         setStandings(fetchedStandings);

      } catch (error) {
        console.error("Failed to refresh admin data:", error);
         toast({
             title: "Error Fetching Data",
             description: "Could not load latest match, result, or leaderboard data.",
             variant: "destructive",
         });
      } finally {
        setDataLoading(false);
        console.log("Data refresh complete.");
      }
    };

  // Initial Data Fetch and Refresh setup
  useEffect(() => {
     if (user) { // Only refresh if user is logged in
        refreshData();
     }
   }, [user, toast]); // Re-run fetch if user changes


  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been logged out successfully.",
      });
      // Redirect handled by onAuthStateChanged effect
    } catch (error) {
      console.error("Sign Out Error:", error);
      toast({
        title: "Sign Out Error",
        description: "Could not sign out. Please try again.",
        variant: "destructive",
      });
    }
  };


  // Loading state for authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  // If user is null after auth check, it means redirection is happening or failed.
  // Render nothing or a minimal message while redirect occurs.
  if (!user) {
    return null; // Or a "Redirecting..." message
  }


  // Filter out null results and get associated event details for the update form
   const matchesWithResults = events.map((event, index) => ({
       event,
       result: results[index]
   })).filter(item => item.result !== null);

   // Extract unique team names from events and standings for the leaderboard form
   const uniqueTeamNames = Array.from(new Set([
        ...events.flatMap(e => e.teams),
        ...standings.map(s => s.teamName)
   ]));


  return (
    <div className="space-y-8">
       <div className="flex justify-between items-center">
          <div>
             <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
             <p className="text-muted-foreground">Welcome, {user.email}! Manage events, results, and leaderboard.</p>
           </div>
           <Button variant="outline" onClick={handleSignOut}>
             <LogOut className="mr-2 h-4 w-4" />
             Sign Out
           </Button>
       </div>


      <Tabs defaultValue="create-match" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[600px]"> {/* Adjusted grid cols */}
          <TabsTrigger value="create-match" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> Create Match
          </TabsTrigger>
          <TabsTrigger value="update-result" className="flex items-center gap-2">
             <Edit className="h-4 w-4" /> Update Result
          </TabsTrigger>
          <TabsTrigger value="update-leaderboard" className="flex items-center gap-2"> {/* New Trigger */}
             <Trophy className="h-4 w-4" /> Update Leaderboard
           </TabsTrigger>
        </TabsList>

        <TabsContent value="create-match" className="mt-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Create New Match</CardTitle>
              <CardDescription>Enter the details for the new sports event.</CardDescription>
            </CardHeader>
            <CardContent>
               {/* Pass refreshData callback */}
              <CreateMatchForm onMatchCreated={refreshData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="update-result" className="mt-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Update Match Result</CardTitle>
              <CardDescription>Select a match and enter the final scores and winner.</CardDescription>
            </CardHeader>
            <CardContent>
              {dataLoading ? (
                 <div className="flex justify-center items-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
              ) : (
                <UpdateResultForm
                  matches={events} // Pass all events for selection
                  existingResults={results.filter(r => r !== null) as MatchResult[]} // Pass existing results for pre-population
                  onResultUpdated={refreshData} // Pass refreshData callback
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="update-leaderboard" className="mt-6"> {/* New Content */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Update Team Leaderboard</CardTitle>
              <CardDescription>Select a team and update their points and logo URL.</CardDescription>
            </CardHeader>
            <CardContent>
               {dataLoading ? (
                  <div className="flex justify-center items-center h-[250px]">
                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
               ) : (
                 <UpdateLeaderboardForm
                   teams={uniqueTeamNames} // Pass unique team names
                   currentStandings={standings} // Pass current standings
                   onStandingUpdated={refreshData} // Pass refresh callback
                 />
               )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
