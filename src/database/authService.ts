import db, { User, UserRun } from './db';

export interface AuthUser {
  id: number;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];

  constructor() {
    // Check for stored session on initialization
    this.loadStoredSession();
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    this.listeners.push(callback);
    // Immediately call with current state
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  private loadStoredSession() {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
        // Convert date strings back to Date objects
        if (this.currentUser) {
          this.currentUser.createdAt = new Date(this.currentUser.createdAt);
          this.currentUser.updatedAt = new Date(this.currentUser.updatedAt);
        }
      }
    } catch (error) {
      console.error('Error loading stored session:', error);
      localStorage.removeItem('currentUser');
    }
  }

  private storeSession(user: AuthUser) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  private clearSession() {
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  async signUp(username: string, password: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
    try {
      // Check if username already exists
      const existingUser = await db.users.where('username').equals(username).first();
      if (existingUser) {
        return { success: false, error: 'Username already exists' };
      }

      // Validate input
      if (!username.trim() || !password.trim()) {
        return { success: false, error: 'Username and password are required' };
      }

      if (username.length < 3) {
        return { success: false, error: 'Username must be at least 3 characters long' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long' };
      }

      // Create new user
      const now = new Date();
      const userId = await db.users.add({
        username: username.trim(),
        password, // In a real app, this would be hashed
        createdAt: now,
        updatedAt: now
      });

      const user: AuthUser = {
        id: userId,
        username: username.trim(),
        createdAt: now,
        updatedAt: now
      };

      this.currentUser = user;
      this.storeSession(user);
      this.notifyListeners();

      return { success: true, user };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'Failed to create account' };
    }
  }

  async signIn(username: string, password: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
    try {
      // Find user by username
      const user = await db.users.where('username').equals(username.trim()).first();
      
      if (!user || user.password !== password) {
        return { success: false, error: 'Invalid username or password' };
      }

      const authUser: AuthUser = {
        id: user.id!,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      this.currentUser = authUser;
      this.storeSession(authUser);
      this.notifyListeners();

      return { success: true, user: authUser };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Failed to sign in' };
    }
  }

  signOut() {
    this.currentUser = null;
    this.clearSession();
    this.notifyListeners();
  }

  async updateUsername(newUsername: string): Promise<{ success: boolean; error?: string }> {
    if (!this.currentUser) {
      return { success: false, error: 'Not logged in' };
    }

    try {
      // Check if new username already exists
      const existingUser = await db.users.where('username').equals(newUsername.trim()).first();
      if (existingUser && existingUser.id !== this.currentUser.id) {
        return { success: false, error: 'Username already exists' };
      }

      if (!newUsername.trim() || newUsername.length < 3) {
        return { success: false, error: 'Username must be at least 3 characters long' };
      }

      // Update user in database
      await db.users.update(this.currentUser.id, {
        username: newUsername.trim(),
        updatedAt: new Date()
      });

      // Update current user
      this.currentUser.username = newUsername.trim();
      this.currentUser.updatedAt = new Date();
      this.storeSession(this.currentUser);
      this.notifyListeners();

      return { success: true };
    } catch (error) {
      console.error('Update username error:', error);
      return { success: false, error: 'Failed to update username' };
    }
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (!this.currentUser) {
      return { success: false, error: 'Not logged in' };
    }

    try {
      // Verify current password
      const user = await db.users.get(this.currentUser.id);
      if (!user || user.password !== currentPassword) {
        return { success: false, error: 'Current password is incorrect' };
      }

      if (!newPassword.trim() || newPassword.length < 6) {
        return { success: false, error: 'New password must be at least 6 characters long' };
      }

      // Update password in database
      await db.users.update(this.currentUser.id, {
        password: newPassword,
        updatedAt: new Date()
      });

      // Update current user timestamp
      this.currentUser.updatedAt = new Date();
      this.storeSession(this.currentUser);
      this.notifyListeners();

      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      return { success: false, error: 'Failed to update password' };
    }
  }

  async linkUserToRun(runId: number, userId?: number): Promise<void> {
    const targetUserId = userId || this.currentUser?.id;
    if (!targetUserId) return;

    try {
      // Check if link already exists
      const existingLink = await db.userRuns
        .where('[userId+runId]')
        .equals([targetUserId, runId])
        .first();

      if (!existingLink) {
        await db.userRuns.add({
          userId: targetUserId,
          runId,
          createdAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error linking user to run:', error);
    }
  }

  async getUserRuns(userId?: number): Promise<number[]> {
    const targetUserId = userId || this.currentUser?.id;
    if (!targetUserId) return [];

    try {
      const userRuns = await db.userRuns.where('userId').equals(targetUserId).toArray();
      return userRuns.map(ur => ur.runId);
    } catch (error) {
      console.error('Error getting user runs:', error);
      return [];
    }
  }

  async findUserByUsername(username: string): Promise<AuthUser | null> {
    try {
      const user = await db.users.where('username').equals(username.trim()).first();
      if (!user) return null;

      return {
        id: user.id!,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      console.error('Error finding user by username:', error);
      return null;
    }
  }
}

// Create singleton instance
const authService = new AuthService();
export default authService;