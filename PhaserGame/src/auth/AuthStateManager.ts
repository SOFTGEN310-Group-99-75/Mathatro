import { AuthService, AuthUser } from './AuthService';

export class AuthStateManager {
    private static instance: AuthStateManager;
    private authService: AuthService;
    private currentUser: AuthUser | null = null;
    private isInitialized: boolean = false;

    private constructor() {
        this.authService = AuthService.getInstance();
    }

    public static getInstance(): AuthStateManager {
        if (!AuthStateManager.instance) {
            AuthStateManager.instance = new AuthStateManager();
        }
        return AuthStateManager.instance;
    }

    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        // Listen for authentication state changes
        this.authService.onAuthStateChange((user: AuthUser | null) => {
            this.currentUser = user;
        });

        // Get initial user state
        this.currentUser = this.authService.getCurrentUser();
        this.isInitialized = true;
    }

    public getCurrentUser(): AuthUser | null {
        return this.currentUser;
    }

    public isAuthenticated(): boolean {
        return this.currentUser !== null;
    }

    public async requireAuthentication(): Promise<AuthUser> {
        if (!this.isAuthenticated()) {
            throw new Error('User must be authenticated to access this feature');
        }
        return this.currentUser!;
    }

    public getUserId(): string | null {
        return this.currentUser?.uid || null;
    }

    public getUserEmail(): string | null {
        return this.currentUser?.email || null;
    }

    public getUserDisplayName(): string | null {
        return this.currentUser?.displayName || null;
    }
}
