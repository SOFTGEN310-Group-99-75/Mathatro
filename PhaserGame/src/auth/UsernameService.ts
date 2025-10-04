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

export class UsernameService {
  private static instance: UsernameService;
  private readonly COLLECTION_NAME = 'usernameMappings';

  private constructor() {}

  public static getInstance(): UsernameService {
    if (!UsernameService.instance) {
      UsernameService.instance = new UsernameService();
    }
    return UsernameService.instance;
  }

  /**
   * Create a mapping between username and email
   */
  public async createUsernameMapping(username: string, email: string, userId: string): Promise<void> {
    try {
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

  /**
   * Get email associated with a username
   */
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

  /**
   * Check if username is already taken
   */
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

  /**
   * Get username by email (reverse lookup)
   */
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

  /**
   * Delete username mapping (for account deletion)
   */
  public async deleteUsernameMapping(username: string): Promise<void> {
    try {
      const usernameDoc = doc(db, this.COLLECTION_NAME, username.toLowerCase());
      await setDoc(usernameDoc, {}, { merge: false }); // This will delete the document
    } catch (error) {
      console.error('Error deleting username mapping:', error);
      throw error;
    }
  }
}
