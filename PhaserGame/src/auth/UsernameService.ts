import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UsernameMapping {
  username: string;
  email: string;
  userId: string;
  createdAt: Date;
}

// Handles username -> email mapping since Firebase Auth only supports email login
// We store usernames in Firestore and look them up when users try to login
export class UsernameService {
  private static instance: UsernameService;
  private readonly COLLECTION_NAME = 'usernameMappings';

  private constructor() {}

  // Get the singleton instance
  public static getInstance(): UsernameService {
    if (!UsernameService.instance) {
      UsernameService.instance = new UsernameService();
    }
    return UsernameService.instance;
  }

  // Store a username -> email mapping when someone signs up
  public async createUsernameMapping(username: string, email: string, userId: string): Promise<void> {
    try {
      // Use lowercase for case-insensitive lookups
      const usernameDoc = doc(db, this.COLLECTION_NAME, username.toLowerCase());
      const mapping: UsernameMapping = {
        username: username.toLowerCase(),
        email,
        userId,
        createdAt: new Date()
      };
      
      await setDoc(usernameDoc, mapping);
    } catch (error) {
      console.error('Error creating username mapping:', error);
      throw error;
    }
  }

  // Look up what email goes with a username (for login)
  public async getEmailByUsername(username: string): Promise<string | null> {
    try {
      const usernameDoc = doc(db, this.COLLECTION_NAME, username.toLowerCase());
      const docSnap = await getDoc(usernameDoc);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as UsernameMapping;
        return data.email;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting email by username:', error);
      throw error;
    }
  }

  // Check if someone already grabbed this username
  public async isUsernameTaken(username: string): Promise<boolean> {
    try {
      const usernameDoc = doc(db, this.COLLECTION_NAME, username.toLowerCase());
      const docSnap = await getDoc(usernameDoc);
      return docSnap.exists();
    } catch (error) {
      console.error('Error checking if username is taken:', error);
      throw error;
    }
  }

  // Reverse lookup - get username from email
  public async getUsernameByEmail(email: string): Promise<string | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('email', '==', email)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data() as UsernameMapping;
        return data.username;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting username by email:', error);
      throw error;
    }
  }

  // Clean up username mapping when deleting an account
  public async deleteUsernameMapping(username: string): Promise<void> {
    try {
      const usernameDoc = doc(db, this.COLLECTION_NAME, username.toLowerCase());
      await setDoc(usernameDoc, {}, { merge: false });
    } catch (error) {
      console.error('Error deleting username mapping:', error);
      throw error;
    }
  }
}
