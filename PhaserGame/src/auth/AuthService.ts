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

export class AuthService {
  private static instance: AuthService;
  private currentUser: AuthUser | null = null;
  private readonly authStateListeners: ((user: AuthUser | null) => void)[] = [];
  private readonly usernameService: UsernameService = UsernameService.getInstance();

  private constructor() {
    // Listen for authentication state changes
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
      
      // Notify all listeners
      this.authStateListeners.forEach(listener => listener(this.currentUser));
    });
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

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

  public async signInWithUsername(username: string, password: string): Promise<AuthUser> {
    try {
      // Get email associated with username
      const email = await this.usernameService.getEmailByUsername(username);
      
      if (!email) {
        throw new Error('Username not found');
      }
      
      // Sign in with the associated email
      return await this.signIn(email, password);
    } catch (error) {
      console.error('Username sign in error:', error);
      throw error;
    }
  }

  public async signUpWithUsername(username: string, password: string, email: string): Promise<AuthUser> {
    try {
      // Check if username is already taken
      const isTaken = await this.usernameService.isUsernameTaken(username);
      if (isTaken) {
        throw new Error('Username is already taken');
      }
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: username });
      }
      
      // Create username mapping
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

  public async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }
}