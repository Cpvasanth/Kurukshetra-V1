'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateMatchForm } from '@/components/admin/create-match-form';
import { UpdateResultForm } from '@/components/admin/update-result-form';
import { SportsEvent, MatchResult } from '@/services/sports-data';
import { getSportsEvents, getMatchResult } from '@/services/sports-data'; // Assuming getMatchResult exists
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Edit } from 'lucide-react';

export default function AdminDashboardPage() {
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [results, setResults] = useState<(MatchResult | null)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const fetchedEvents = await getSportsEvents();
        setEvents(fetchedEvents);

        // Fetch existing results for the update form dropdown
        const resultsPromises = fetchedEvents.map(event => getMatchResult(event.id));
        const fetchedResults = await Promise.all(resultsPromises);
        setResults(fetchedResults);

      } catch (error) {
        console.error("Failed to fetch admin data:", error);
        // Handle error (e.g., show toast)
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter out null results and get associated event details for the update form
   const matchesWithResults = events.map((event, index) => ({
       event,
       result: results[index]
   })).filter(item => item.result !== null);


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
      <p className="text-muted-foreground">Manage sports events and update match results.</p>

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
               {/* Pass a callback to potentially refresh event list after creation */}
              <CreateMatchForm onMatchCreated={() => console.log('Match created - refresh needed')} />
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
              {loading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <UpdateResultForm
                  matches={events} // Pass all events for selection
                  existingResults={results.filter(r => r !== null) as MatchResult[]} // Pass existing results for pre-population
                  onResultUpdated={() => console.log('Result updated - refresh needed')}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
