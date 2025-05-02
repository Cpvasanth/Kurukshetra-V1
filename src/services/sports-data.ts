/**
 * Represents a sports event.
 */
export interface SportsEvent {
  /**
   * The unique identifier of the event.
   */
  id: string;
  /**
   * The title of the match.
   */
  matchTitle: string;
  /**
   * The type of the match (e.g., Normal, Semi-final, Final).
   */
  matchType: string;
  /**
   * The date of the match.
   */
  date: string;
  /**
   * The time of the match.
   */
  time: string;
  /**
   * The teams participating in the match.
   */
  teams: string[];
}

// Placeholder data - replace with actual data fetching from Firebase/API
let sportsEvents: SportsEvent[] = [
    {
      id: '1',
      matchTitle: 'Cricket: Skylaros vs Dracarys',
      matchType: 'Normal',
      date: '2024-08-15',
      time: '10:00',
      teams: ['Skylaros', 'Dracarys'],
    },
    {
      id: '2',
      matchTitle: 'Football: Aetos vs Xanthus',
      matchType: 'Semi-final',
      date: '2024-08-16',
      time: '14:00',
      teams: ['Aetos', 'Xanthus'],
    },
     {
      id: '3',
      matchTitle: 'Basketball: Griffin Squad vs Skylaros',
      matchType: 'Final',
      date: '2024-08-20',
      time: '16:30',
      teams: ['Griffin Squad', 'Skylaros'],
    },
      {
      id: '4',
      matchTitle: 'Volleyball: Dracarys vs Aetos',
      matchType: 'Normal',
      date: '2024-08-22',
      time: '09:00',
      teams: ['Dracarys', 'Aetos'],
    },
];

// Placeholder for match results - replace with actual data fetching
let matchResults: { [key: string]: MatchResult } = {
     '1': {
        matchId: '1',
        team1Score: 155, // Example Cricket score
        team2Score: 156,
        winningTeam: 'Dracarys',
        winningTeamPhotoUrl: 'https://picsum.photos/seed/DracarysWin/300/200',
      },
     '2': {
       matchId: '2',
       team1Score: 2, // Example Football score
       team2Score: 1,
       winningTeam: 'Aetos',
       winningTeamPhotoUrl: 'https://picsum.photos/seed/AetosWin/300/200',
     },
     // Match 3 has no result yet
     // Match 4 has no result yet
};


/**
 * Asynchronously retrieves a list of sports events.
 * Simulates an API call.
 * @returns A promise that resolves to an array of SportsEvent objects.
 */
export async function getSportsEvents(): Promise<SportsEvent[]> {
  console.log("Fetching sports events...");
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log("Fetched events:", sportsEvents);
  // Return a copy to prevent direct modification of the source array
  return [...sportsEvents];
}

/**
 * Asynchronously creates a new sports event.
 * Simulates an API call.
 * @param eventData The data for the sports event to create (without ID).
 * @returns A promise that resolves to the created SportsEvent object (with ID).
 */
export async function createSportsEvent(eventData: Omit<SportsEvent, 'id'>): Promise<SportsEvent> {
   console.log("Creating sports event:", eventData);
   // Simulate API delay
   await new Promise(resolve => setTimeout(resolve, 500));

  const newEvent: SportsEvent = {
     ...eventData,
     // Simulate ID generation from backend
     id: `evt-${Date.now()}-${Math.random().toString(36).substring(7)}`
  };
  sportsEvents.push(newEvent); // Add to our mock data
  console.log("Created event:", newEvent);
  return newEvent;
}

/**
 * Asynchronously updates a sports event.
 * Simulates an API call.
 * @param event The sports event to update.
 * @returns A promise that resolves to the updated SportsEvent object.
 */
export async function updateSportsEvent(event: SportsEvent): Promise<SportsEvent> {
   console.log("Updating sports event:", event);
   // Simulate API delay
   await new Promise(resolve => setTimeout(resolve, 500));

   const index = sportsEvents.findIndex(e => e.id === event.id);
   if (index !== -1) {
       sportsEvents[index] = event;
       console.log("Updated event:", event);
       return event;
   } else {
       console.error("Event not found for update:", event.id);
       throw new Error(`Event with ID ${event.id} not found.`);
   }
}

/**
 * Represents the result of a sports match.
 */
export interface MatchResult {
  /**
   * The unique identifier of the match.
   */
  matchId: string;
  /**
   * The score of the first team.
   */
  team1Score: number;
  /**
   * The score of the second team.
   */
  team2Score: number;
  /**
   * The winning team.
   */
  winningTeam: string;
  /**
   * Optional URL of the winning team's photo.
   */
  winningTeamPhotoUrl?: string;
}

/**
 * Asynchronously retrieves the result of a match.
 * Simulates an API call.
 * @param matchId The ID of the match to retrieve the result for.
 * @returns A promise that resolves to a MatchResult object or null if no result exists.
 */
export async function getMatchResult(matchId: string): Promise<MatchResult | null> {
  console.log(`Fetching result for match ID: ${matchId}`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const result = matchResults[matchId];
  if (result) {
      console.log(`Found result for match ${matchId}:`, result);
      return {...result}; // Return a copy
  } else {
       console.log(`No result found for match ${matchId}`);
       return null;
  }
}

/**
 * Asynchronously updates the result of a match.
 * Simulates an API call.
 * @param result The match result to update.
 * @returns A promise that resolves to the updated MatchResult object.
 */
export async function updateMatchResult(result: MatchResult): Promise<MatchResult> {
  console.log("Updating match result:", result);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Check if the corresponding event exists
  const eventExists = sportsEvents.some(e => e.id === result.matchId);
  if (!eventExists) {
      console.error("Cannot update result for non-existent event:", result.matchId);
      throw new Error(`Match event with ID ${result.matchId} not found.`);
  }

  matchResults[result.matchId] = result; // Update or add the result
  console.log("Updated result:", result);
  return {...result}; // Return a copy
}
