import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Minimal auth + username mapping tests.
 * We mock the firebase modules used by the services so we can exercise the
 * real AuthService / UsernameService logic deterministically without
 * touching the network or requiring Firebase initialization.
 */

// In-memory stores for mock Firebase
interface MockUser {
  uid: string;
  email: string;
  password: string;
  displayName: string | null;
}

// Module-level (reset per test via resetModules) state containers
let users: Record<string, MockUser>; // keyed by email
let usernameMappings: Record<string, { username: string; email: string; userId: string; createdAt: Date }>; // keyed by username (lowercase)
let authStateCallback: ((user: MockUser | null) => void) | null;
let currentUser: MockUser | null; // tracks signed-in user in mock auth
let userCounter: number;

// Helper to (re)install mocks after vi.resetModules()
function installFirebaseMocks() {
  users = {};
  usernameMappings = {};
  authStateCallback = null;
  currentUser = null;
  userCounter = 0;

  // firebase/app mock just needs initializeApp + getters returning opaque objects
  vi.mock('firebase/app', () => ({
    initializeApp: vi.fn(() => ({})),
  }));

  // Mock auth API surface actually used
  vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(() => ({})),
    onAuthStateChanged: vi.fn((auth: any, cb: (user: any) => void) => {
      authStateCallback = cb;
      // Immediately emit current state (null initially)
      cb(currentUser);
      return () => { authStateCallback = null; };
    }),
    signInWithEmailAndPassword: vi.fn(async (_auth: any, email: string, password: string) => {
      const user = users[email];
      if (!user || user.password !== password) {
        throw new Error('auth/invalid-credentials');
      }
      currentUser = user;
      authStateCallback?.(currentUser);
      return { user };
    }),
    createUserWithEmailAndPassword: vi.fn(async (_auth: any, email: string, password: string) => {
      if (users[email]) {
        throw new Error('auth/email-already-in-use');
      }
      const user: MockUser = {
        uid: `uid-${++userCounter}`,
        email,
        password,
        displayName: null,
      };
      users[email] = user;
      currentUser = user;
      authStateCallback?.(currentUser);
      return { user };
    }),
    updateProfile: vi.fn(async (user: MockUser, data: { displayName?: string }) => {
      if (data.displayName !== undefined) {
        user.displayName = data.displayName;
      }
    }),
    signOut: vi.fn(async () => {
      currentUser = null;
      authStateCallback?.(null);
    }),
  }));

  // Mock firestore pieces used by UsernameService
  vi.mock('firebase/firestore', () => {
    const doc = (_db: any, collectionName: string, id: string) => ({ collectionName, id });
    const setDoc = async (docRef: any, data: any, options?: any) => {
      if (data && Object.keys(data).length === 0 && options && options.merge === false) {
        // Treat this as deletion
        delete usernameMappings[docRef.id];
        return;
      }
      usernameMappings[docRef.id] = data;
    };
    const getDoc = async (docRef: any) => {
      const data = usernameMappings[docRef.id];
      return {
        exists: () => !!data,
        data: () => data,
      };
    };
    const collection = (_db: any, collectionName: string) => ({ collectionName });
    // where just returns a predicate descriptor
    const where = (field: string, op: string, value: any) => ({ field, op, value });
    const query = (colRef: any, whereClause: any) => ({ collectionName: colRef.collectionName, where: whereClause });
    const getDocs = async (q: any) => {
      const docs = Object.values(usernameMappings)
        .filter(m => q.where.field === 'email' && m.email === q.where.value)
        .map(m => ({ data: () => m }));
      return {
        empty: docs.length === 0,
        docs,
      };
    };
    const getFirestore = vi.fn(() => ({}));
    return { doc, setDoc, getDoc, collection, where, query, getDocs, getFirestore };
  });

  // Analytics stub (exported in firebase config)
  vi.mock('firebase/analytics', () => ({
    getAnalytics: vi.fn(() => ({})),
  }));
}

// Utility that (re)imports the real services after mocks are in place
async function loadServices() {
  const { AuthService } = await import('../src/auth/AuthService');
  const { UsernameService } = await import('../src/auth/UsernameService');
  return { AuthService, UsernameService };
}

describe('Auth + Username integration (mocked Firebase)', () => {
  beforeEach(async () => {
    vi.resetModules(); // clear singleton static instances & previous mocks
    installFirebaseMocks();
  });

  it('signs up with username creating mapping and setting displayName', async () => {
    const { AuthService, UsernameService } = await loadServices();
    const authService = AuthService.getInstance();
    const usernameService = UsernameService.getInstance();

    const result = await authService.signUpWithUsername('PlayerOne', 'secretPW', 'player1@example.com');

    expect(result.displayName).toBe('PlayerOne');
    expect(result.email).toBe('player1@example.com');
    expect(result.uid).toBeTruthy();
    // mapping exists
    expect(await usernameService.isUsernameTaken('playerone')).toBe(true); // lowercased
    expect(await usernameService.getEmailByUsername('PlayerOne')).toBe('player1@example.com');
    // AuthService current user reflects state change
    expect(authService.getCurrentUser()?.uid).toBe(result.uid);
  });

  it('prevents duplicate username sign up', async () => {
    const { AuthService } = await loadServices();
    const service = AuthService.getInstance();
    await service.signUpWithUsername('DupName', 'pw1', 'dup1@example.com');

    await expect(service.signUpWithUsername('DupName', 'pw2', 'dup2@example.com'))
      .rejects.toThrow(/Username is already taken/);
  });

  it('signs out then signs in using username', async () => {
    const { AuthService } = await loadServices();
    const service = AuthService.getInstance();
    const first = await service.signUpWithUsername('LoginUser', 'pw-login', 'login@example.com');
    await service.signOut();
    expect(service.getCurrentUser()).toBeNull();

    const signedIn = await service.signInWithUsername('LoginUser', 'pw-login');
    expect(signedIn.uid).toBe(first.uid);
    expect(signedIn.displayName).toBe('LoginUser');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('deletes username mapping making it available again', async () => {
    const { AuthService, UsernameService } = await loadServices();
    const authService = AuthService.getInstance();
    const usernameService = UsernameService.getInstance();
    await authService.signUpWithUsername('TempUser', 'pw-temp', 'temp@example.com');
    expect(await usernameService.isUsernameTaken('TempUser')).toBe(true);

    await usernameService.deleteUsernameMapping('TempUser');
    expect(await usernameService.isUsernameTaken('TempUser')).toBe(false);
  });
});
