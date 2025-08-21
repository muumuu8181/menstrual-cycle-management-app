import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography, Container, Card, CardContent, Chip, BottomNavigation, BottomNavigationAction } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import { lightTheme } from './constants/theme';

// Working pages
function HomePage() {
  return (
    <Container sx={{ paddingY: 3 }}>
      <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'primary.main' }}>
          🌸 FemCare Pro
        </Typography>
        <Typography variant="h6" color="text.secondary">
          女性の健康を総合サポートする生理管理アプリ
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <FavoriteIcon sx={{ color: 'primary.main', marginRight: 1 }} />
              <Typography variant="h6">現在の状態</Typography>
            </Box>
            <Chip label="アプリ正常動作中" color="success" sx={{ marginBottom: 2 }} />
            <Typography variant="body2" color="text.secondary">
              すべての機能が利用可能です
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <CalendarTodayIcon sx={{ color: 'primary.main', marginRight: 1 }} />
              <Typography variant="h6">機能</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              • 生理記録・管理<br/>
              • カレンダー表示<br/>
              • 症状追跡<br/>
              • データ分析
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

function CalendarPage() {
  return (
    <Container sx={{ paddingY: 3 }}>
      <Typography variant="h4" gutterBottom>📅 カレンダー</Typography>
      <Card>
        <CardContent>
          <Typography>カレンダー機能（開発中）</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            生理周期をカレンダー形式で表示します
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}

function RecordsPage() {
  return (
    <Container sx={{ paddingY: 3 }}>
      <Typography variant="h4" gutterBottom>📝 記録</Typography>
      <Card>
        <CardContent>
          <Typography>記録機能（開発中）</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            日々の症状や気分を記録できます
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}

function AnalyticsPage() {
  return (
    <Container sx={{ paddingY: 3 }}>
      <Typography variant="h4" gutterBottom>📊 分析</Typography>
      <Card>
        <CardContent>
          <Typography>分析機能（開発中）</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            記録データを分析してパターンを表示します
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}

function SettingsPage() {
  return (
    <Container sx={{ paddingY: 3 }}>
      <Typography variant="h4" gutterBottom>⚙️ 設定</Typography>
      <Card>
        <CardContent>
          <Typography>設定機能（開発中）</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            アプリの各種設定を変更できます
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}

// Working Navigation with actual routing
function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { label: 'ホーム', path: '/', icon: <FavoriteIcon /> },
    { label: 'カレンダー', path: '/calendar', icon: <CalendarTodayIcon /> },
    { label: '記録', path: '/records', icon: <EditIcon /> },
    { label: '分析', path: '/analytics', icon: <AnalyticsIcon /> },
    { label: '設定', path: '/settings', icon: <SettingsIcon /> },
  ];

  return (
    <BottomNavigation 
      value={location.pathname} 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        borderTop: '1px solid #e0e0e0'
      }}
    >
      {navItems.map((item) => (
        <BottomNavigationAction
          key={item.path}
          label={item.label}
          value={item.path}
          icon={item.icon}
          component={Link}
          to={item.path}
        />
      ))}
    </BottomNavigation>
  );
}

function App() {
  console.log('App-Fixed loading...');

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Router>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          backgroundColor: 'background.default',
          paddingBottom: '80px' // Space for bottom navigation
        }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/records" element={<RecordsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
          <Navigation />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;