// Theme configuration based on the UI/UX design guide
import { createTheme } from '@mui/material/styles';

// Color palette based on requirements
const colors = {
  primary: {
    50: '#fef2f7',
    100: '#fce8f3',
    200: '#fad1e8',
    300: '#f8aad5',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },
  secondary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },
  // Menstrual cycle colors
  period: {
    heavy: '#7f1d1d',
    medium: '#dc2626',
    light: '#f87171',
    spotting: '#fca5a5',
  },
  fertile: {
    high: '#f59e0b',
    medium: '#fbbf24',
    low: '#fde68a',
  },
  symptom: {
    severe: '#dc2626',
    moderate: '#f59e0b',
    mild: '#10b981',
  },
  prediction: {
    main: '#6b7280',
    light: '#d1d5db',
  },
};

const baseTheme = {
  palette: {
    primary: {
      main: colors.primary[500],
      light: colors.primary[300],
      dark: colors.primary[700],
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondary[500],
      light: colors.secondary[300],
      dark: colors.secondary[700],
      contrastText: '#ffffff',
    },
    error: {
      main: '#dc2626',
      light: '#f87171',
      dark: '#b91c1c',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#0ea5e9',
      light: '#38bdf8',
      dark: '#0284c7',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.4,
    },
  },
  spacing: 4, // 4px base spacing
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
          minHeight: 44, // Touch target
          padding: '12px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
          },
        },
        contained: {
          '&:active': {
            boxShadow: '0 2px 4px rgba(236, 72, 153, 0.3)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            minHeight: 44,
            '&:hover fieldset': {
              borderColor: colors.primary[400],
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary[500],
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: 500,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(236, 72, 153, 0.4)',
          },
        },
      },
    },
  },
};

// Light theme (default)
export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    ...baseTheme.palette,
    mode: 'light',
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
    },
  },
});

// Dark theme
export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    ...baseTheme.palette,
    mode: 'dark',
    background: {
      default: '#1a1a1a',
      paper: '#2a2a2a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#d1d5db',
    },
  },
  components: {
    ...baseTheme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          ...baseTheme.components?.MuiCard?.styleOverrides?.root,
          backgroundColor: '#2a2a2a',
          border: '1px solid #374151',
        },
      },
    },
  },
});

// Custom color utilities
export const getCycleColor = (type: 'period' | 'fertile' | 'symptom' | 'prediction', level?: string) => {
  switch (type) {
    case 'period':
      switch (level) {
        case 'heavy': return colors.period.heavy;
        case 'medium': return colors.period.medium;
        case 'light': return colors.period.light;
        case 'spotting': return colors.period.spotting;
        default: return colors.period.medium;
      }
    case 'fertile':
      switch (level) {
        case 'high': return colors.fertile.high;
        case 'medium': return colors.fertile.medium;
        case 'low': return colors.fertile.low;
        default: return colors.fertile.medium;
      }
    case 'symptom':
      switch (level) {
        case 'severe': return colors.symptom.severe;
        case 'moderate': return colors.symptom.moderate;
        case 'mild': return colors.symptom.mild;
        default: return colors.symptom.moderate;
      }
    case 'prediction':
      return level === 'light' ? colors.prediction.light : colors.prediction.main;
    default:
      return colors.primary[500];
  }
};

export { colors };