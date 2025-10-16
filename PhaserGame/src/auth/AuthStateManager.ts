import { AuthService, AuthUser } from './AuthService';

// Wrapper around AuthService for easier access to user state
// Use this when we just need to check if someone's logged in
export class AuthStateManager {
    private static instance: AuthStateManager;
    private authService: AuthService;
    private currentUser: AuthUser | null = null;
    private isInitialized: boolean = false;

    private constructor() {
        this.authService = AuthService.getInstance();
    }

    // Get the singleton instance
    public static getInstance(): AuthStateManager {
        if (!AuthStateManager.instance) {
            AuthStateManager.instance = new AuthStateManager();
        }
        return AuthStateManager.instance;
    }

    // Set up auth state listeners
    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        // Keep our local copy of user in sync with auth changes
        this.authService.onAuthStateChange((user: AuthUser | null) => {
            this.currentUser = user;
        });

        // Grab the current user on startup
        this.currentUser = this.authService.getCurrentUser();
        this.isInitialized = true;
    }

    // Get the current logged-in user
    public getCurrentUser(): AuthUser | null {
        return this.currentUser;
    }

    // Check if someone is logged in
    public isAuthenticated(): boolean {
        return this.currentUser !== null;
    }

    // Throw error if not authenticated, otherwise return user
    public async requireAuthentication(): Promise<AuthUser> {
        // Throw an error if user isn't logged in - useful for protected features
        if (!this.isAuthenticated()) {
            throw new Error('User must be authenticated to access this feature');
        }
        return this.currentUser!;
    }

    // Get the user ID
    public getUserId(): string | null {
        return this.currentUser?.uid || null;
    }

    // Get the user's email
    public getUserEmail(): string | null {
        return this.currentUser?.email || null;
    }

    // Get the user's display name
    public getUserDisplayName(): string | null {
        return this.currentUser?.displayName || null;
    }
}
