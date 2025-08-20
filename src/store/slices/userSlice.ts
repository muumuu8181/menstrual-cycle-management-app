import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { UserProfile, UserSettings } from '../../types/models';
import { db } from '../../services/database/database';

interface UserState {
  currentUser: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: UserState = {
  currentUser: null,
  isLoading: false,
  error: null,
  isInitialized: false,
};

// Default user settings
const defaultUserSettings: UserSettings = {
  cycleLength: 28,
  periodLength: 5,
  lutealPhaseLength: 14,
  notifications: {
    periodReminder: true,
    periodReminderDays: 2,
    ovulationReminder: true,
    pmsReminder: true,
    recordReminder: true,
    recordReminderTime: '20:00',
  },
  display: {
    theme: 'light',
    colorScheme: 'default',
    fontSize: 'medium',
    showPredictions: true,
    showSymptoms: true,
    calendarView: 'month',
  },
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  language: 'ja',
};

// Async thunks
export const initializeUser = createAsyncThunk(
  'user/initialize',
  async () => {
    try {
      console.log('Starting user initialization...');
      
      // Test database availability first
      console.log('Testing database connection...');
      // Note: Dexie automatically opens the database on first use, but we'll test it
      await db.users.count(); // This will open the database and test connectivity
      console.log('✓ Database connection successful');
      
      // Check if user exists in database
      console.log('Checking for existing users...');
      const users = await db.users.toArray();
      console.log(`Found ${users.length} existing users`);
      
      if (users.length > 0) {
        console.log('✓ Returning existing user:', users[0].id);
        return users[0]; // Return first user (single user app)
      }
      
      // Create new user if none exists
      console.log('Creating new user...');
      const newUser: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> = {
        settings: defaultUserSettings,
        privacy: {
          shareData: false,
          analytics: true,
          crashReporting: true,
          backupEnabled: true,
        },
        version: '1.0.0',
      };
      
      console.log('Saving new user to database...');
      const userId = await db.createUser(newUser);
      console.log('✓ User created with ID:', userId);
      
      const user = await db.getUser(userId);
      if (!user) {
        throw new Error('Failed to retrieve created user');
      }
      
      console.log('✓ User initialization complete');
      return user;
    } catch (error) {
      console.error('User initialization failed:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('database')) {
          throw new Error('データベースの初期化に失敗しました。ブラウザの設定でIndexedDBが有効になっているか確認してください。');
        } else if (error.message.includes('quota')) {
          throw new Error('ストレージの容量が不足しています。ブラウザのデータを一部削除して再試行してください。');
        } else if (error.message.includes('crypto')) {
          throw new Error('ブラウザがセキュリティ機能をサポートしていません。最新のブラウザを使用してください。');
        }
      }
      
      throw new Error(`ユーザー初期化エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

export const updateUserSettings = createAsyncThunk(
  'user/updateSettings',
  async (settings: Partial<UserSettings>, { getState }) => {
    const state = getState() as { user: UserState };
    const currentUser = state.user.currentUser;
    
    if (!currentUser) throw new Error('No current user');

    const updatedSettings = { ...currentUser.settings, ...settings };
    await db.updateUser(currentUser.id, { settings: updatedSettings });
    
    const updatedUser = await db.getUser(currentUser.id);
    return updatedUser!;
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (updates: Partial<UserProfile>, { getState }) => {
    const state = getState() as { user: UserState };
    const currentUser = state.user.currentUser;
    
    if (!currentUser) throw new Error('No current user');

    await db.updateUser(currentUser.id, updates);
    const updatedUser = await db.getUser(currentUser.id);
    return updatedUser!;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetUser: (state) => {
      state.currentUser = null;
      state.isLoading = false;
      state.error = null;
      state.isInitialized = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize user
      .addCase(initializeUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.isInitialized = true;
      })
      .addCase(initializeUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to initialize user';
      })
      
      // Update user settings
      .addCase(updateUserSettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(updateUserSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update settings';
      })
      
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update profile';
      });
  },
});

export const { clearError, resetUser } = userSlice.actions;
export default userSlice;