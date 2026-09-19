import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocFromServer,
  type Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Test connection on boot as mandated by Firebase Skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection check: Client is offline or database initializing.');
    }
    return false;
  }
}

// Auth methods
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (user) {
      // Upsert user profile record
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Meeting Attendee',
          photoURL: user.photoURL || '',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
    return user;
  } catch (err: any) {
    console.error('Failed to sign in with Google:', err);
    throw err;
  }
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

export interface StoredMeetingSession {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'ended';
  executiveSummary?: string;
  keyPoints?: string[];
  decisions?: string[];
  actionItems?: Array<{
    id: string;
    title: string;
    priority: 'High' | 'Medium' | 'Low';
    assignee?: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    deadline?: string;
  }>;
  sentiment?: string;
  transcriptCount?: number;
}

export interface StoredTranscriptEntry {
  id: string;
  meetingId: string;
  userId: string;
  speaker: string;
  text: string;
  type: 'speech' | 'gesture' | 'macro';
  timestamp: string;
  sentiment?: string;
}

// Firestore persistence helpers
export async function saveMeetingSession(
  userId: string,
  session: StoredMeetingSession
): Promise<void> {
  if (!userId || !session.id) return;
  try {
    const sessionRef = doc(db, 'users', userId, 'meetings', session.id);
    await setDoc(sessionRef, {
      ...session,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Could not save meeting session to Firestore:', err);
  }
}

export async function saveTranscriptEntry(
  userId: string,
  meetingId: string,
  entry: StoredTranscriptEntry
): Promise<void> {
  if (!userId || !meetingId || !entry.id) return;
  try {
    const transcriptRef = doc(db, 'users', userId, 'meetings', meetingId, 'transcripts', entry.id);
    await setDoc(transcriptRef, entry, { merge: true });
  } catch (err) {
    console.warn('Could not save transcript entry to Firestore:', err);
  }
}

export async function loadUserMeetings(userId: string): Promise<StoredMeetingSession[]> {
  if (!userId) return [];
  try {
    const meetingsRef = collection(db, 'users', userId, 'meetings');
    const q = query(meetingsRef, limit(20));
    const snap = await getDocs(q);
    const results: StoredMeetingSession[] = [];
    snap.forEach((d) => {
      results.push(d.data() as StoredMeetingSession);
    });
    return results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (err) {
    console.warn('Failed to load user meetings from Firestore:', err);
    return [];
  }
}

export { onAuthStateChanged, type User };
