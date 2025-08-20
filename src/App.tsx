import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';

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

function AppContent() {
  const dispatch = useAppDispatch();
  const { currentUser, isLoading, isInitialized } = useAppSelector(state => state.user);
  const { theme } = useAppSelector(state => state.ui);

  useEffect(() => {
    if (!isInitialized) {
      dispatch(initializeUser());
    }
  }, [dispatch, isInitialized]);

  // Determine theme based on user settings and system preference
  const getTheme = () => {
    if (theme === 'dark') return darkTheme;
    if (theme === 'light') return lightTheme;
    
    // Auto theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? darkTheme : lightTheme;
  };

  if (isLoading || !isInitialized) {
    return <LoadingScreen />;
  }

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
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </PersistGate>
    </Provider>
  );
}

export default App;
