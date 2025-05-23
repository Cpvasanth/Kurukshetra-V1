
import { db, isFirebaseInitialized } from '@/lib/firebase/client'; // Import Firestore instance and initialization check
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  query,
  where,
  setDoc,
  orderBy,
  Timestamp, // Import Timestamp if storing dates as Firebase Timestamps
  FirestoreError // Corrected import: Use FirestoreError
} from 'firebase/firestore';

// Define specific sports and genders for consistency
export type Sport = 'Cricket' | 'Football' | 'Basketball' | 'Carrom' | 'Chess' | 'Volleyball' | 'Throwball' | 'Table Tennis' | 'Kho Kho' | 'Badminton' | 'Athletics Indoor' | 'Athletics Outdoor' | 'Other';
export type Gender = 'Boys' | 'Girls' | 'Mixed';


/**
 * Represents a sports event.
 */
export interface SportsEvent {
  /**
   * The unique identifier of the event (Firestore document ID).
   */
  id: string;
  /**
   * The title of the match.
   */
  matchTitle: string;
   /**
    * The specific sport for the event.
    */
  sport: Sport;
   /**
    * The gender category for the event.
    */
  gender: Gender;
  /**
   * The type of the match (e.g., Normal, Semi-final, Final).
   */
  matchType: string;
  /**
   * @deprecated Use dateTime instead for consistency and proper sorting.
   * This field is derived from dateTime when reading for potential UI compatibility.
   */
  date: string;
   /**
    * @deprecated Use dateTime instead for consistency and proper sorting.
    * This field is derived from dateTime when reading for potential UI compatibility.
    */
  time: string;
   /**
    * Combined datetime for sorting/querying (Firebase Timestamp).
    */
   dateTime: Timestamp; // Use Firestore Timestamp for proper sorting/filtering
  /**
   * The teams participating in the match.
   */
  teams: string[];
}

/**
 * Represents the result of a sports match.
 */
export interface MatchResult {
  /**
   * The unique identifier of the match (Should match the SportsEvent ID).
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
   * Optional URL of the winning team's photo. Stored as string or undefined.
   */
  winningTeamPhotoUrl?: string;
}

/**
 * Represents a team's standing in the leaderboard.
 */
export interface TeamStanding {
    /**
     * The unique identifier for the team standing (usually the team name).
     */
    id: string;
    /**
     * The name of the team.
     */
    teamName: string;
    /**
     * The total points accumulated by the team.
     */
    points: number;
    /**
     * Optional mascot emoji for the team.
     */
    mascot?: string;
}


// Helper function to ensure db is initialized
const getDbInstance = () => {
    if (!isFirebaseInitialized() || !db) {
      console.error("Firestore (db) is not initialized. Ensure Firebase client is configured correctly.");
      // Provide a more specific error message for debugging
      throw new Error("Firestore initialization failed. Check Firebase client configuration and environment variables.");
    }
    return db;
}


/**
 * Asynchronously retrieves a list of sports events from Firestore, ordered by date/time.
 * @returns A promise that resolves to an array of SportsEvent objects.
 */
export async function getSportsEvents(): Promise<SportsEvent[]> {
  console.log("Fetching sports events from Firestore...");
  try {
     const firestoreDb = getDbInstance();
     const eventsCollection = collection(firestoreDb, 'sportsEvents');
     const eventsQuery = query(eventsCollection, orderBy('dateTime', 'asc')); // Order by combined timestamp
    const querySnapshot = await getDocs(eventsQuery);
    const events = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Ensure dateTime is a Timestamp, default to now if invalid/missing
        const dateTime = data.dateTime instanceof Timestamp ? data.dateTime : Timestamp.now();
        const jsDate = dateTime.toDate(); // Convert Timestamp to JS Date for derivation

        return {
           id: doc.id,
           matchTitle: data.matchTitle ?? 'Unknown Match',
           sport: data.sport ?? 'Other', // Provide default if missing
           gender: data.gender ?? 'Mixed', // Provide default if missing
           matchType: data.matchType ?? 'Normal', // Provide default if missing
           dateTime: dateTime, // Store the actual Timestamp
           teams: Array.isArray(data.teams) ? data.teams : ['Team A', 'Team B'], // Provide default if missing
           // Deprecated fields (derived for potential backward compatibility in UI)
           date: jsDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
           time: jsDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }), // Format as HH:MM
        } as SportsEvent; // Using assertion, ensure data structure matches
    });
    console.log("Fetched events count:", events.length);
    return events;
  } catch (error: unknown) { // Use 'unknown' for better type safety in catch
     console.error("Error fetching sports events: ", error);
      let errorMessage = "Could not fetch sports events.";
      // Check FirestoreError and specific codes
      if (error instanceof FirestoreError || (error && typeof (error as any).code === 'string')) {
        const errorCode = (error as any).code; // Type assertion after check
        errorMessage = `Firestore error (${errorCode}): ${error.message}`;
        if (errorCode === 'permission-denied') { // Use string code
           errorMessage = "Permission denied fetching events. Check Firestore security rules for 'sportsEvents'.";
        }
        // Add other specific Firestore error codes if needed
        // else if (error.code === 'unavailable') { ... }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
     // Log the detailed error object regardless of type
     console.error("Detailed Error fetching sports events:", {
         code: (error as any)?.code, // Use optional chaining
         message: (error as Error)?.message, // Use optional chaining
         stack: (error as Error)?.stack, // Use optional chaining
         originalError: error // Log the original error object
     });
     throw new Error(errorMessage); // Throw a more informative error
  }
}

/**
 * Asynchronously creates a new sports event in Firestore.
 * Combines date and time strings into a Firestore Timestamp.
 * @param eventData The data for the sports event to create (requires date and time strings).
 * @returns A promise that resolves to the created SportsEvent object (with ID and Timestamp).
 */
export async function createSportsEvent(eventData: {
    matchTitle: string;
    sport: Sport;
    gender: Gender;
    matchType: string;
    date: string; // Expecting YYYY-MM-DD
    time: string; // Expecting HH:MM
    teams: string[];
}): Promise<SportsEvent> {
   console.log("Attempting to create sports event in Firestore with data:", eventData);
   try {
     const firestoreDb = getDbInstance();
     const eventsCollection = collection(firestoreDb, 'sportsEvents');

     // Combine date and time into a JavaScript Date object, then convert to Firestore Timestamp
     const jsDate = new Date(`${eventData.date}T${eventData.time}:00`); // Assume local timezone, ensure seconds are included
     if (isNaN(jsDate.getTime())) {
         console.error("Invalid date/time format provided:", eventData.date, eventData.time);
         throw new Error("Invalid date/time format for creating Timestamp.");
     }
     const dateTimeStamp = Timestamp.fromDate(jsDate);
     console.log("Generated Firestore Timestamp:", dateTimeStamp);

     // Data to be stored in Firestore (using the Timestamp)
     const dataToStore = {
       matchTitle: eventData.matchTitle,
       sport: eventData.sport,
       gender: eventData.gender,
       matchType: eventData.matchType,
       teams: eventData.teams,
       dateTime: dateTimeStamp, // Store the combined Timestamp
     };

     console.log("Data being sent to Firestore addDoc:", dataToStore);
     const docRef = await addDoc(eventsCollection, dataToStore);
     console.log("Document written with ID: ", docRef.id);

     // Construct the full event object to return, reflecting the stored state
     const newEvent: SportsEvent = {
       id: docRef.id,
       ...dataToStore,
       // Include derived date/time strings for potential immediate use if needed, though dateTime is primary
       date: eventData.date,
       time: eventData.time,
     };
     console.log("Successfully created event:", newEvent);
     return newEvent;
   } catch (error: unknown) { // Use 'unknown' for better type safety
     console.error("Error creating sports event in Firestore:", error);
      let errorMessage = "Could not create sports event.";
      // Check FirestoreError and specific codes
      if (error instanceof FirestoreError || (error && typeof (error as any).code === 'string')) {
        const errorCode = (error as any).code;
        errorMessage = `Firestore error (${errorCode}): ${error.message}`;
        if (errorCode === 'permission-denied') { // Use string code
           errorMessage = "Permission denied creating event. Check Firestore security rules for 'sportsEvents'.";
        } else if (errorCode === 'invalid-argument') {
           errorMessage = `Invalid data provided when creating event. Check field values. Error: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      // Log the detailed error object regardless of type
     console.error("Detailed Error creating sports event:", {
         code: (error as any)?.code, // Use optional chaining
         message: (error as Error)?.message, // Use optional chaining
         stack: (error as Error)?.stack, // Use optional chaining
         originalError: error // Log the original error object
     });
     throw new Error(errorMessage);
   }
}


/**
 * Asynchronously updates a sports event in Firestore.
 * @param event The full sports event object to update, including ID and potentially changed fields.
 *              It's expected to contain date and time strings if they need to update the dateTime timestamp.
 * @returns A promise that resolves to the updated SportsEvent object.
 */
export async function updateSportsEvent(event: SportsEvent): Promise<SportsEvent> {
   console.log("Updating sports event in Firestore:", event);
   try {
     const firestoreDb = getDbInstance();
     const eventRef = doc(firestoreDb, 'sportsEvents', event.id);

      // Re-calculate Timestamp if date or time strings are provided and potentially changed
      // This assumes the input `event` object might have updated `date` and `time` strings
      const jsDate = new Date(`${event.date}T${event.time}:00`);
      if (isNaN(jsDate.getTime())) {
           console.error("Invalid date/time format provided for update:", event.date, event.time);
           throw new Error("Invalid date/time format for creating Timestamp during update.");
      }
      const dateTimeStamp = Timestamp.fromDate(jsDate);

      // Prepare data, excluding the ID. Use the calculated Timestamp.
      const updateData: Omit<SportsEvent, 'id' | 'date' | 'time'> = {
          matchTitle: event.matchTitle,
          sport: event.sport,
          gender: event.gender,
          matchType: event.matchType,
          teams: event.teams,
          dateTime: dateTimeStamp, // Update with the new Timestamp
      };


     await updateDoc(eventRef, updateData);
     console.log("Updated event with ID:", event.id);

     // Return the event object reflecting the update (with new timestamp and derived strings)
     return {
        ...event, // Keep the original ID
        ...updateData, // Apply updated fields
        date: jsDate.toISOString().split('T')[0], // Re-derive date string
        time: jsDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }), // Re-derive time string
     };
   } catch (error: unknown) { // Use 'unknown' for better type safety
     console.error("Error updating sports event: ", error);
     let errorMessage = `Could not update event with ID ${event.id}.`;
     // Check FirestoreError and specific codes
     if (error instanceof FirestoreError || (error && typeof (error as any).code === 'string')) {
         const errorCode = (error as any).code;
         errorMessage = `Firestore error updating event ${event.id} (${errorCode}): ${error.message}`;
         if (errorCode === 'permission-denied') { // Use string code
             errorMessage = `Permission denied updating event ${event.id}. Check Firestore security rules for 'sportsEvents'.`;
         } else if (errorCode === 'invalid-argument') {
            errorMessage = `Invalid data provided when updating event ${event.id}. Check field values. Error: ${error.message}`;
         }
     } else if (error instanceof Error) {
         errorMessage = error.message;
     }
      // Log the detailed error object regardless of type
      console.error(`Detailed Error updating sports event for ${event.id}:`, {
         code: (error as any)?.code,
         message: (error as Error)?.message,
         stack: (error as Error)?.stack,
         originalError: error
      });
     throw new Error(errorMessage);
   }
}


/**
 * Asynchronously retrieves the result of a match from Firestore.
 * The result document ID should be the same as the match event ID.
 * IMPORTANT: Ensure Firestore security rules allow read access to the 'matchResults' collection.
 * @param matchId The ID of the match to retrieve the result for.
 * @returns A promise that resolves to a MatchResult object or null if no result exists or permission denied.
 */
export async function getMatchResult(matchId: string): Promise<MatchResult | null> {
    console.log(`Fetching result for match ID: ${matchId} from Firestore...`);
    if (!matchId) {
        console.warn("getMatchResult called with empty matchId.");
        return null;
    }
    try {
        const firestoreDb = getDbInstance();
        const resultRef = doc(firestoreDb, 'matchResults', matchId); // Use matchId as document ID
        const docSnap = await getDoc(resultRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Ensure numeric scores, provide defaults if missing/invalid
            const team1Score = typeof data.team1Score === 'number' ? data.team1Score : 0;
            const team2Score = typeof data.team2Score === 'number' ? data.team2Score : 0;
            const winningTeam = typeof data.winningTeam === 'string' ? data.winningTeam : 'N/A';
            // Handle photo URL: accept string, map null/undefined to undefined
            const winningTeamPhotoUrl = (typeof data.winningTeamPhotoUrl === 'string' && data.winningTeamPhotoUrl) ? data.winningTeamPhotoUrl : undefined;

            const result: MatchResult = {
                matchId: docSnap.id,
                team1Score,
                team2Score,
                winningTeam,
                ...(winningTeamPhotoUrl && { winningTeamPhotoUrl }), // Conditionally add photo URL
            };
            console.log(`Found result for match ${matchId}:`, result);
            return result;
        } else {
            console.log(`No result found for match ${matchId}`);
            return null;
        }
    } catch (error: unknown) { // Use 'unknown' for better type safety
        let errorMessage = `Could not fetch result for match ID ${matchId}.`;

        // Check FirestoreError and specific codes
        if (error instanceof FirestoreError || (error && typeof (error as any).code === 'string')) {
            const errorCode = (error as any).code;
            if (errorCode === 'permission-denied') {
                // Highlight permission issue specifically
                errorMessage = `Error fetching result for ${matchId}: Missing or insufficient permissions. Please check Firestore security rules for the 'matchResults' collection.`;
                console.error(errorMessage); // Log the specific permission error message
                // ****** Return null instead of throwing on permission denied ******
                return null;
            } else {
                errorMessage = `Firestore error fetching result for ${matchId} (${errorCode}): ${error.message}`;
            }
        } else if (error instanceof Error) {
            errorMessage = `Error fetching result for ${matchId}: ${error.message}`;
        }

        // Log the detailed error object regardless of type
        // Include the error object itself and its string representation
        console.error(`Detailed Error fetching match result for ${matchId}:`, {
            code: (error as any)?.code,
            message: (error as Error)?.message,
            stack: (error as Error)?.stack,
            originalError: error, // Log the raw error object
        });

         // Return null for other fetch errors as well to let the UI handle it.
         return null;
    }
}


/**
 * Asynchronously updates or creates the result of a match in Firestore.
 * Uses the matchId as the document ID in the 'matchResults' collection.
 * Ensures `winningTeamPhotoUrl` is handled correctly (omitted if empty/undefined).
 * @param result The match result to update/create.
 * @returns A promise that resolves to the updated/created MatchResult object.
 */
export async function updateMatchResult(result: MatchResult): Promise<MatchResult> {
    console.log("Updating/Creating match result in Firestore:", result);
    if (!result.matchId) {
        console.error("Update Match Result Error: Match ID is required.");
        throw new Error("Match ID is required to update a result.");
    }
    try {
        const firestoreDb = getDbInstance();
        const resultRef = doc(firestoreDb, 'matchResults', result.matchId); // Use matchId as document ID

        // Prepare data for Firestore. Ensure winningTeamPhotoUrl is handled correctly.
        const dataToSet: Omit<MatchResult, 'winningTeamPhotoUrl'> & { winningTeamPhotoUrl?: string } = {
            matchId: result.matchId,
            team1Score: result.team1Score ?? 0,
            team2Score: result.team2Score ?? 0,
            winningTeam: result.winningTeam ?? 'N/A',
        };

        // Only include winningTeamPhotoUrl if it's a non-empty string and valid
        if (typeof result.winningTeamPhotoUrl === 'string' && result.winningTeamPhotoUrl.trim() !== '') {
            dataToSet.winningTeamPhotoUrl = result.winningTeamPhotoUrl;
        }
        // Remove the field if it's undefined or empty to avoid Firestore error
        if (dataToSet.winningTeamPhotoUrl === undefined || dataToSet.winningTeamPhotoUrl === '') {
            delete dataToSet.winningTeamPhotoUrl;
        }


        console.log("Data being sent to Firestore setDoc:", dataToSet);

        // Use setDoc with merge: true to create or update specified fields
        await setDoc(resultRef, dataToSet, { merge: true });

        console.log("Updated/Created result for match ID:", result.matchId);
        // Fetch the updated doc to return the actual stored state
        const updatedDocSnap = await getDoc(resultRef);
        if (updatedDocSnap.exists()) {
            const updatedData = updatedDocSnap.data();
            return {
                matchId: updatedDocSnap.id,
                team1Score: updatedData?.team1Score ?? 0,
                team2Score: updatedData?.team2Score ?? 0,
                winningTeam: updatedData?.winningTeam ?? 'N/A',
                winningTeamPhotoUrl: updatedData?.winningTeamPhotoUrl || undefined,
            } as MatchResult;
        } else {
            console.error(`Failed to retrieve updated result after setDoc for match ID: ${result.matchId}`);
            throw new Error("Failed to retrieve updated result after setDoc.");
        }

    } catch (error: unknown) { // Use 'unknown' for better type safety
        console.error(`Error updating match result for ID ${result.matchId}:`, error);
        let errorMessage = `Could not update result for match ID ${result.matchId}.`;

        if (error instanceof FirestoreError || (error && typeof (error as any).code === 'string')) {
            const errorCode = (error as any).code;
            if (errorCode === 'permission-denied') {
                errorMessage = `Permission denied updating result for ${result.matchId}. Check Firestore security rules for 'matchResults'.`;
                console.error("PERMISSION ERROR:", errorMessage);
            } else if (errorCode === 'invalid-argument') {
                errorMessage = `Invalid data provided for match result ${result.matchId}. Check field values. Error: ${error.message}`;
                console.error("INVALID DATA ERROR:", errorMessage, "Data Sent:", result);
            } else {
                errorMessage = `Firestore error updating result for ${result.matchId} (${errorCode}): ${error.message}`;
            }
        } else if (error instanceof Error) {
            errorMessage = `Error updating result for ${result.matchId}: ${error.message}`;
        }

        console.error(`Detailed Error updating match result for ${result.matchId}:`, {
            code: (error as any)?.code,
            message: (error as Error)?.message,
            stack: (error as Error)?.stack,
            originalError: error
        });
        // Re-throw permission or validation errors as they likely need specific handling
        if ((error as FirestoreError)?.code === 'permission-denied' || (error as FirestoreError)?.code === 'invalid-argument') {
            throw new Error(errorMessage);
        }
        // For other errors, you might decide to throw a generic error or handle differently
        throw new Error(errorMessage);
    }
}

/**
 * Asynchronously retrieves the leaderboard (team standings) from Firestore.
 * Assumes standings are stored in a 'leaderboard' collection with team names as document IDs.
 * Orders by points descending.
 * @returns A promise that resolves to an array of TeamStanding objects.
 */
export async function getLeaderboardStandings(): Promise<TeamStanding[]> {
    console.log("Fetching leaderboard standings from Firestore...");
    try {
        const firestoreDb = getDbInstance();
        const leaderboardCollection = collection(firestoreDb, 'leaderboard');
        const standingsQuery = query(leaderboardCollection, orderBy('points', 'desc'));
        const querySnapshot = await getDocs(standingsQuery);
        const standings = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                teamName: data.teamName ?? doc.id, // Fallback to ID if name is missing
                points: typeof data.points === 'number' ? data.points : 0,
                mascot: data.mascot ?? undefined, // Store mascot emoji if available
            } as TeamStanding;
        });
        console.log("Fetched leaderboard standings count:", standings.length);
        return standings;
    } catch (error: unknown) { // Use 'unknown' for better type safety
        console.error("Error fetching leaderboard standings: ", error);
        let errorMessage = "Could not fetch leaderboard standings.";
        if (error instanceof FirestoreError || (error && typeof (error as any).code === 'string')) {
            const errorCode = (error as any).code;
            errorMessage = `Firestore error (${errorCode}): ${error.message}`;
            if (errorCode === 'permission-denied') {
                errorMessage = "Permission denied fetching leaderboard. Check Firestore security rules for 'leaderboard'.";
                console.warn(errorMessage); // Warn for permission issues
                 // Return empty array on permission denial to avoid crashing UI
                 return [];
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Detailed Error fetching leaderboard:", {
             code: (error as any)?.code,
             message: (error as Error)?.message,
             stack: (error as Error)?.stack,
             originalError: error
        });
        throw new Error(errorMessage);
    }
}

/**
 * Asynchronously updates or creates a team's standing in the leaderboard.
 * Uses the teamName as the document ID in the 'leaderboard' collection.
 * @param standing The team standing data to update/create.
 * @returns A promise that resolves when the operation is complete.
 */
export async function updateTeamStanding(standing: { teamName: string; points: number; mascot?: string }): Promise<void> {
    console.log("Updating/Creating team standing in Firestore:", standing);
    if (!standing.teamName) {
        console.error("Update Team Standing Error: Team name is required.");
        throw new Error("Team name is required to update a standing.");
    }
    try {
        const firestoreDb = getDbInstance();
        // Use teamName as the document ID for simplicity and uniqueness
        const standingRef = doc(firestoreDb, 'leaderboard', standing.teamName);

        // Prepare data for Firestore.
        const dataToSet: Omit<TeamStanding, 'id'> = {
            teamName: standing.teamName,
            points: standing.points ?? 0, // Ensure points is a number
        };

        // Only include mascot if it's provided and non-empty
        if (typeof standing.mascot === 'string' && standing.mascot.trim() !== '') {
            dataToSet.mascot = standing.mascot;
        }

        console.log("Data being sent to Firestore setDoc for leaderboard:", dataToSet);

        // Use setDoc with merge: true to create or update the team's standing
        await setDoc(standingRef, dataToSet, { merge: true });

        console.log("Updated/Created standing for team:", standing.teamName);

    } catch (error: unknown) { // Use 'unknown' for better type safety
        console.error(`Error updating team standing for ${standing.teamName}:`, error);
        let errorMessage = `Could not update standing for team ${standing.teamName}.`;

        if (error instanceof FirestoreError || (error && typeof (error as any).code === 'string')) {
            const errorCode = (error as any).code;
             if (errorCode === 'permission-denied') {
                 errorMessage = `Permission denied updating standing for ${standing.teamName}. Check Firestore security rules for 'leaderboard'.`;
                 console.error("PERMISSION ERROR:", errorMessage);
             } else if (errorCode === 'invalid-argument') {
                errorMessage = `Invalid data provided for team standing ${standing.teamName}. Check field values. Error: ${error.message}`;
                console.error("INVALID DATA ERROR:", errorMessage, "Data Sent:", standing);
             } else {
                errorMessage = `Firestore error updating standing for ${standing.teamName} (${errorCode}): ${error.message}`;
             }
        } else if (error instanceof Error) {
            errorMessage = `Error updating standing for ${standing.teamName}: ${error.message}`;
        }

        console.error(`Detailed Error updating team standing for ${standing.teamName}:`, {
            code: (error as any)?.code,
            message: (error as Error)?.message,
            stack: (error as Error)?.stack,
            originalError: error
        });
         // Re-throw permission or validation errors
         if ((error as FirestoreError)?.code === 'permission-denied' || (error as FirestoreError)?.code === 'invalid-argument') {
            throw new Error(errorMessage);
         }
        // For other errors, throw a generic error or handle differently
        throw new Error(errorMessage);
    }
}

