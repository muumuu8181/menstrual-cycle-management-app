import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

// Mock IndexedDB
const mockIndexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
  cmp: vi.fn()
};

Object.defineProperty(window, 'indexedDB', {
  value: mockIndexedDB,
  writable: true
});

// Mock crypto
Object.defineProperty(window, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2)
  },
  writable: true
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Current Menstrual Cycle Management App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without white screen and shows app content', async () => {
    render(<App />);
    
    // Wait for either loading screen or main content to appear
    await waitFor(() => {
      const loadingText = screen.queryByText(/データを復元しています/);
      const appTitle = screen.queryByText(/FemCare Pro/);
      
      // Should show either loading or the app, not white screen
      expect(loadingText || appTitle).toBeTruthy();
    }, { timeout: 10000 });
  });

  it('shows FemCare Pro title eventually', async () => {
    render(<App />);
    
    // Wait for the app to fully load and show the title
    await waitFor(() => {
      expect(screen.getByText(/FemCare Pro/)).toBeInTheDocument();
    }, { timeout: 15000 });
  });

  it('renders main navigation or content areas', async () => {
    render(<App />);
    
    // Wait for app to load and check for navigation or main content
    await waitFor(() => {
      // Look for navigation elements or main content
      const hasNavigation = document.querySelector('[role="navigation"]') || 
                           document.querySelector('nav') ||
                           document.querySelector('.MuiBottomNavigation-root');
      
      const hasMainContent = document.querySelector('main') || 
                            document.querySelector('[role="main"]') ||
                            document.querySelector('.MuiContainer-root');
      
      // Should have either navigation or main content
      expect(hasNavigation || hasMainContent).toBeTruthy();
    }, { timeout: 15000 });
  });

  it('does not remain stuck on loading screen forever', async () => {
    render(<App />);
    
    // Wait and ensure we either get content or an error, not stuck loading
    await waitFor(() => {
      const persistentLoading = screen.queryByText(/データを復元しています/);
      const hasContent = screen.queryByText(/FemCare Pro/) || 
                        screen.queryByText(/エラー/) ||
                        screen.queryByText(/失敗/);
      
      // After sufficient time, should not be stuck on loading
      if (persistentLoading) {
        expect(hasContent).toBeTruthy();
      }
    }, { timeout: 20000 });
  });

  it('has proper error handling if initialization fails', async () => {
    // Mock a database failure
    mockIndexedDB.open.mockImplementation(() => {
      throw new Error('Database unavailable');
    });

    render(<App />);
    
    // Should handle the error gracefully and show either error message or fallback content
    await waitFor(() => {
      const errorMessage = screen.queryByText(/失敗/) || 
                          screen.queryByText(/エラー/) ||
                          screen.queryByText(/FemCare Pro/); // Or show app with mock data
      
      expect(errorMessage).toBeTruthy();
    }, { timeout: 15000 });
  });
});