import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { UsernameService } from './UsernameService';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// Main service for handling all authentication
// Singleton pattern so we can access it from anywhere
export class AuthService {
  private static instance: AuthService;
  private currentUser: AuthUser | null = null;
  private readonly authStateListeners: ((user: AuthUser | null) => void)[] = [];
  private readonly usernameService: UsernameService = UsernameService.getInstance();

  private constructor() {
    // Hook into Firebase's auth state listener
    // This fires whenever login/logout happens
    onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        this.currentUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        };
      } else {
        this.currentUser = null;
      }
      
      // Tell everyone who's listening that auth state changed
      this.authStateListeners.forEach(listener => listener(this.currentUser));
    });
  }

  // Get the singleton instance
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Login with email and password
  public async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  // Create new account with email and password
  public async signUp(email: string, password: string, displayName?: string): Promise<AuthUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName
      };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  // Login using username instead of email
  public async signInWithUsername(username: string, password: string): Promise<AuthUser> {
    try {
      // Firebase only supports email login, so we need to look up the email first
      const email = await this.usernameService.getEmailByUsername(username);
      
      if (!email) {
        throw new Error('Username not found');
      }
      
      // Now login with the email
      return await this.signIn(email, password);
    } catch (error) {
      console.error('Username sign in error:', error);
      throw error;
    }
  }

  // Create account with username, stores username->email mapping
  public async signUpWithUsername(username: string, password: string, email: string): Promise<AuthUser> {
    try {
      // Make sure username isn't taken before creating account
      const isTaken = await this.usernameService.isUsernameTaken(username);
      if (isTaken) {
        throw new Error('Username is already taken');
      }
      
      // Create the Firebase account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Set their display name to the username
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: username });
      }
      
      // Store the username->email mapping in Firestore so we can look it up later
      await this.usernameService.createUsernameMapping(username, email, userCredential.user.uid);
      
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName
      };
    } catch (error) {
      console.error('Username sign up error:', error);
      throw error;
    }
  }

  // Logout current user
  public async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Get the current logged-in user
  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  // Check if someone is logged in
  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Subscribe to auth state changes
  public onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Return a function to unsubscribe later if needed
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }
}