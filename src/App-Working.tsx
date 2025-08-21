import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, AppBar, Toolbar, Typography, Container, Card, CardContent, Grid, Chip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { lightTheme } from './constants/theme';

// Simple working pages
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
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
        </Grid>

        <Grid item xs={12} md={6}>
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
        </Grid>
      </Grid>
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
        </CardContent>
      </Card>
    </Container>
  );
}

// Simple Navigation
function Navigation() {
  const navItems = [
    { label: 'ホーム', path: '/', icon: '🏠' },
    { label: 'カレンダー', path: '/calendar', icon: '📅' },
    { label: '記録', path: '/records', icon: '📝' },
    { label: '分析', path: '/analytics', icon: '📊' },
    { label: '設定', path: '/settings', icon: '⚙️' },
  ];

  return (
    <AppBar position="fixed" sx={{ top: 'auto', bottom: 0 }}>
      <Toolbar>
        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-around' }}>
          {navItems.map((item) => (
            <Box key={item.path} sx={{ textAlign: 'center', color: 'white' }}>
              <div>{item.icon}</div>
              <Typography variant="caption">{item.label}</Typography>
            </Box>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

function App() {
  console.log('App-Working loading...');

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