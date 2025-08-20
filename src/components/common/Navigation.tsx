import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  BottomNavigation, 
  BottomNavigationAction, 
  Paper,
  useTheme,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';

import { useAppDispatch } from '../../hooks/useRedux';
import { setCurrentPage } from '../../store/slices/uiSlice';

interface NavigationItem {
  value: string;
  label: string;
  icon: React.ReactElement;
  path: string;
}

const navigationItems: NavigationItem[] = [
  {
    value: 'home',
    label: 'ホーム',
    icon: <HomeIcon />,
    path: '/',
  },
  {
    value: 'calendar',
    label: 'カレンダー',
    icon: <CalendarTodayIcon />,
    path: '/calendar',
  },
  {
    value: 'records',
    label: '記録',
    icon: <FavoriteIcon />,
    path: '/records',
  },
  {
    value: 'analytics',
    label: '分析',
    icon: <BarChartIcon />,
    path: '/analytics',
  },
  {
    value: 'settings',
    label: '設定',
    icon: <SettingsIcon />,
    path: '/settings',
  },
];

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  // Get current value based on pathname
  const getCurrentValue = () => {
    const currentPath = location.pathname;
    const currentItem = navigationItems.find(item => item.path === currentPath);
    return currentItem?.value || 'home';
  };

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    const selectedItem = navigationItems.find(item => item.value === newValue);
    if (selectedItem) {
      navigate(selectedItem.path);
      dispatch(setCurrentPage(newValue));
    }
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
      elevation={3}
    >
      <BottomNavigation
        value={getCurrentValue()}
        onChange={handleChange}
        showLabels
        sx={{
          height: 70,
          paddingBottom: 'env(safe-area-inset-bottom)',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 0 8px',
            '&.Mui-selected': {
              color: theme.palette.primary.main,
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
            fontWeight: 500,
            '&.Mui-selected': {
              fontSize: '0.75rem',
            },
          },
        }}
      >
        {navigationItems.map((item) => (
          <BottomNavigationAction
            key={item.value}
            value={item.value}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default Navigation;