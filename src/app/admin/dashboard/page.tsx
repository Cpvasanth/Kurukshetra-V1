'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateMatchForm } from '@/components/admin/create-match-form';
import { UpdateResultForm } from '@/components/admin/update-result-form';
import type { SportsEvent, MatchResult } from '@/services/sports-data';
import { getSportsEvents, getMatchResult, createSportsEvent, updateMatchResult } from '@/services/sports-data';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Edit, LogOut, Loader2 } from 'lucide-react';
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client'; // Import initialized auth instance
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [results, setResults] = useState<(MatchResult | null)[]>([]);
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

  // Fetch Data only if authenticated
  useEffect(() => {
    if (user) { // Only fetch if user is confirmed to be logged in
      async function fetchData() {
        try {
          setDataLoading(true);
          const fetchedEvents = await getSportsEvents();
          setEvents(fetchedEvents);

          const resultsPromises = fetchedEvents.map(event => getMatchResult(event.id));
          const fetchedResults = await Promise.all(resultsPromises);
          setResults(fetchedResults);

        } catch (error) {
          console.error("Failed to fetch admin data:", error);
           toast({
               title: "Error Fetching Data",
               description: "Could not load match or result data.",
               variant: "destructive",
           });
        } finally {
          setDataLoading(false);
        }
      }
      fetchData();
    }
  }, [user, toast]); // Re-run fetch if user changes (though unlikely here)

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

  // Refresh data after creation/update
   const refreshData = async () => {
     try {
       setDataLoading(true);
       const fetchedEvents = await getSportsEvents();
       setEvents(fetchedEvents);
       const resultsPromises = fetchedEvents.map(event => getMatchResult(event.id));
       const fetchedResults = await Promise.all(resultsPromises);
       setResults(fetchedResults);
     } catch (error) {
       console.error("Failed to refresh data:", error);
       toast({ title: "Error", description: "Could not refresh data.", variant: "destructive" });
     } finally {
       setDataLoading(false);
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

  return (
    <div className="space-y-8">
       <div className="flex justify-between items-center">
          <div>
             <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
             <p className="text-muted-foreground">Welcome, {user.email}! Manage events and results.</p>
           </div>
           <Button variant="outline" onClick={handleSignOut}>
             <LogOut className="mr-2 h-4 w-4" />
             Sign Out
           </Button>
       </div>


      <Tabs defaultValue="create-match" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="create-match" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> Create Match
          </TabsTrigger>
          <TabsTrigger value="update-result" className="flex items-center gap-2">
             <Edit className="h-4 w-4" /> Update Result
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
      </Tabs>
    </div>
  );
}
