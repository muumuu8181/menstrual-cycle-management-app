import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography, Button } from '@mui/material';

import { store, persistor } from './store/store';
import { useAppDispatch, useAppSelector } from './hooks/useRedux';
import { initializeUser } from './store/slices/userSlice';
import { lightTheme, darkTheme } from './constants/theme';

// Components
import Navigation from './components/common/Navigation';
import LoadingScreen from './components/common/LoadingScreen';
import ErrorBoundary from './components/common/ErrorBoundary';
import NotificationStack from './components/common/NotificationStack';

// Pages
import HomePage from './pages/Home/HomePage';
import CalendarPage from './pages/Calendar/CalendarPage';
import RecordsPage from './pages/Records/RecordsPage';
import AnalyticsPage from './pages/Analytics/AnalyticsPage';
import SettingsPage from './pages/Settings/SettingsPage';

// PWA components
import PWAInstallPrompt from './components/common/PWAInstallPrompt';

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: 3,
      backgroundColor: '#f5f5f5'
    }}>
      <Typography variant="h4" color="error" gutterBottom>
        アプリの初期化に失敗しました
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        {error}
      </Typography>
      <Button variant="contained" onClick={onRetry} sx={{ mb: 2 }}>
        再試行
      </Button>
      <Typography variant="caption" color="text.secondary">
        問題が解決しない場合は、ブラウザを再起動してください
      </Typography>
    </Box>
  );
}

function AppContent() {
  const dispatch = useAppDispatch();
  const { currentUser, isLoading, error, isInitialized } = useAppSelector(state => state.user);
  const { theme } = useAppSelector(state => state.ui);
  
  const [initError, setInitError] = useState<string | null>(null);
  const [initTimeout, setInitTimeout] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Initialize user with proper error handling and timeout
  const initializeUserWithTimeout = async () => {
    console.log(`Attempting user initialization (attempt ${retryCount + 1})...`);
    
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Initialization timeout after 15 seconds')), 15000)
      );
      
      const initPromise = dispatch(initializeUser()).unwrap();
      
      await Promise.race([initPromise, timeoutPromise]);
      console.log('User initialization successful');
      setInitError(null);
      setInitTimeout(false);
    } catch (err) {
      console.error('User initialization failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown initialization error';
      setInitError(errorMessage);
      if (errorMessage.includes('timeout')) {
        setInitTimeout(true);
      }
    }
  };

  useEffect(() => {
    console.log('AppContent mounted. isInitialized:', isInitialized, 'isLoading:', isLoading);
    
    if (!isInitialized && !isLoading && !initError && !initTimeout) {
      initializeUserWithTimeout();
    }
  }, [dispatch, isInitialized, isLoading, retryCount]);

  // Determine theme based on user settings and system preference
  const getTheme = () => {
    if (theme === 'dark') return darkTheme;
    if (theme === 'light') return lightTheme;
    
    // Auto theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? darkTheme : lightTheme;
  };

  // Handle retry
  const handleRetry = () => {
    setInitError(null);
    setInitTimeout(false);
    setRetryCount(prev => prev + 1);
    console.log('Retrying initialization...');
  };

  // Show error display if there's an initialization error or timeout
  if (initError || initTimeout || error) {
    const errorMessage = initError || error || 'Unknown error occurred during initialization';
    return <ErrorDisplay error={errorMessage} onRetry={handleRetry} />;
  }

  // Show loading screen while initializing
  if (isLoading || !isInitialized) {
    console.log('Showing loading screen...');
    return <LoadingScreen message="アプリを初期化しています..." />;
  }

  console.log('Rendering main app interface...');

  return (
    <ThemeProvider theme={getTheme()}>
      <CssBaseline />
      <Router>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          backgroundColor: 'background.default'
        }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/records" element={<RecordsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
          
          <Navigation />
          <NotificationStack />
          <PWAInstallPrompt />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

function App() {
  console.log('App component mounting...');
  
  return (
    <Provider store={store}>
      <PersistGate 
        loading={<LoadingScreen message="データを復元しています..." />} 
        persistor={persistor}
        onBeforeLift={() => {
          console.log('Redux persist rehydration complete');
        }}
      >
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </PersistGate>
    </Provider>
  );
}

export default App;
