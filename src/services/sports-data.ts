
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
  Timestamp // Import Timestamp if storing dates as Firebase Timestamps
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
   */
  date: string;
   /**
    * @deprecated Use dateTime instead for consistency and proper sorting.
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
   * Optional URL of the winning team's photo.
   */
  winningTeamPhotoUrl?: string;
}


// Helper function to ensure db is initialized
const getDbInstance = () => {
    if (!isFirebaseInitialized() || !db) {
      console.error("Firestore (db) is not initialized. Ensure Firebase client is configured correctly.");
      throw new Error("Firestore is not initialized.");
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
        const dateTime = data.dateTime instanceof Timestamp ? data.dateTime : Timestamp.now(); // Provide fallback
        const jsDate = dateTime.toDate();
        return {
           id: doc.id,
           matchTitle: data.matchTitle ?? 'Unknown Match',
           sport: data.sport ?? 'Other', // Default to 'Other' if missing
           gender: data.gender ?? 'Mixed', // Default to 'Mixed' if missing
           matchType: data.matchType ?? 'Normal',
           dateTime: dateTime,
           teams: Array.isArray(data.teams) ? data.teams : ['Team A', 'Team B'],
           // Deprecated fields (derived for potential backward compatibility)
           date: jsDate.toISOString().split('T')[0],
           time: jsDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        } as SportsEvent; // Type assertion - careful with this
    });
    console.log("Fetched events:", events.length);
    return events;
  } catch (error) {
     console.error("Error fetching sports events: ", error);
     throw new Error("Could not fetch sports events."); // Re-throw or handle error appropriately
  }
}

/**
 * Asynchronously creates a new sports event in Firestore.
 * @param eventData The data for the sports event to create (without ID).
 * @returns A promise that resolves to the created SportsEvent object (with ID).
 */
export async function createSportsEvent(eventData: Omit<SportsEvent, 'id' | 'dateTime'>): Promise<SportsEvent> {
   console.log("Creating sports event in Firestore:", eventData);
   try {
     const firestoreDb = getDbInstance();
     const eventsCollection = collection(firestoreDb, 'sportsEvents');
     // Combine date and time into a JavaScript Date object, then convert to Firestore Timestamp
     const jsDate = new Date(`${eventData.date}T${eventData.time}:00`); // Ensure seconds are included
     if (isNaN(jsDate.getTime())) {
         throw new Error("Invalid date/time format for creating Timestamp.");
     }
     const dateTimeStamp = Timestamp.fromDate(jsDate);

     const docRef = await addDoc(eventsCollection, {
       matchTitle: eventData.matchTitle,
       sport: eventData.sport, // Add sport
       gender: eventData.gender, // Add gender
       matchType: eventData.matchType,
       teams: eventData.teams,
       dateTime: dateTimeStamp, // Store the Timestamp
     });

     // Construct the full event object to return, including the generated ID and the timestamp
     const newEvent: SportsEvent = {
       id: docRef.id,
       matchTitle: eventData.matchTitle,
       sport: eventData.sport,
       gender: eventData.gender,
       matchType: eventData.matchType,
       date: eventData.date, // Keep for potential compatibility if needed elsewhere short-term
       time: eventData.time, // Keep for potential compatibility
       dateTime: dateTimeStamp,
       teams: eventData.teams,
     };
     console.log("Created event:", newEvent);
     return newEvent;
   } catch (error) {
     console.error("Error creating sports event: ", error);
     throw new Error("Could not create sports event.");
   }
}


/**
 * Asynchronously updates a sports event in Firestore.
 * @param event The sports event to update.
 * @returns A promise that resolves to the updated SportsEvent object.
 */
export async function updateSportsEvent(event: SportsEvent): Promise<SportsEvent> {
   console.log("Updating sports event in Firestore:", event);
   try {
     const firestoreDb = getDbInstance();
     const eventRef = doc(firestoreDb, 'sportsEvents', event.id);
      // Ensure dateTime is updated if date or time changes
      const jsDate = new Date(`${event.date}T${event.time}:00`);
      if (isNaN(jsDate.getTime())) {
           throw new Error("Invalid date/time format for creating Timestamp.");
      }
      const dateTimeStamp = Timestamp.fromDate(jsDate);

      // Prepare data, excluding the ID field which shouldn't be in the update data
      const updateData: Partial<Omit<SportsEvent, 'id'>> = {
          matchTitle: event.matchTitle,
          sport: event.sport, // Include sport
          gender: event.gender, // Include gender
          matchType: event.matchType,
          teams: event.teams,
          dateTime: dateTimeStamp,
          // Explicitly remove date and time if they are truly deprecated
          // date: undefined,
          // time: undefined,
      };


     await updateDoc(eventRef, updateData);
     console.log("Updated event with ID:", event.id);
     // Return the event object with the potentially updated dateTime
     return { ...event, dateTime: dateTimeStamp };
   } catch (error) {
     console.error("Error updating sports event: ", error);
     throw new Error(`Could not update event with ID ${event.id}.`);
   }
}


/**
 * Asynchronously retrieves the result of a match from Firestore.
 * The result document ID should be the same as the match event ID.
 * @param matchId The ID of the match to retrieve the result for.
 * @returns A promise that resolves to a MatchResult object or null if no result exists.
 */
export async function getMatchResult(matchId: string): Promise<MatchResult | null> {
  console.log(`Fetching result for match ID: ${matchId} from Firestore...`);
  try {
    const firestoreDb = getDbInstance();
    const resultRef = doc(firestoreDb, 'matchResults', matchId); // Use matchId as document ID
    const docSnap = await getDoc(resultRef);

    if (docSnap.exists()) {
      const result = { matchId: docSnap.id, ...docSnap.data() } as MatchResult;
      console.log(`Found result for match ${matchId}:`, result);
      return result;
    } else {
      console.log(`No result found for match ${matchId}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching match result: ", error);
    throw new Error(`Could not fetch result for match ID ${matchId}.`);
  }
}


/**
 * Asynchronously updates or creates the result of a match in Firestore.
 * Uses the matchId as the document ID in the 'matchResults' collection.
 * @param result The match result to update/create.
 * @returns A promise that resolves to the updated/created MatchResult object.
 */
export async function updateMatchResult(result: MatchResult): Promise<MatchResult> {
  console.log("Updating/Creating match result in Firestore:", result);
  try {
     const firestoreDb = getDbInstance();
    // Check if the corresponding event exists first (optional but good practice)
    const eventRef = doc(firestoreDb, 'sportsEvents', result.matchId);
    const eventSnap = await getDoc(eventRef);
    if (!eventSnap.exists()) {
      console.error("Cannot update result for non-existent event:", result.matchId);
      throw new Error(`Match event with ID ${result.matchId} not found.`);
    }

    const resultRef = doc(firestoreDb, 'matchResults', result.matchId); // Use matchId as document ID
    // Use setDoc with merge: true to create or update the document
    await setDoc(resultRef, result, { merge: true });

    console.log("Updated/Created result:", result);
    return result; // Return the input result object
  } catch (error) {
    console.error("Error updating match result: ", error);
    throw new Error(`Could not update result for match ID ${result.matchId}.`);
  }
}
