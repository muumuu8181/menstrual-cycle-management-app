import React, { useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  LinearProgress,
  Chip,
  useTheme,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NotificationsIcon from '@mui/icons-material/Notifications';

import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchCycles } from '../../store/slices/cyclesSlice';
import { fetchPredictions } from '../../store/slices/predictionsSlice';
import { format, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  const { currentUser } = useAppSelector(state => state.user);
  const { cycles, currentCycle } = useAppSelector(state => state.cycles);
  const { predictions } = useAppSelector(state => state.predictions);

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchCycles({ userId: currentUser.id, limit: 12 }));
      dispatch(fetchPredictions(currentUser.id));
    }
  }, [dispatch, currentUser?.id]);

  const getDaysUntilPeriod = () => {
    if (!predictions?.nextPeriodDate) return null;
    const today = new Date();
    const nextPeriod = new Date(predictions.nextPeriodDate);
    return differenceInDays(nextPeriod, today);
  };

  const getCurrentCycleDay = () => {
    if (!currentCycle?.startDate) return null;
    const today = new Date();
    const cycleStart = new Date(currentCycle.startDate);
    return differenceInDays(today, cycleStart) + 1;
  };

  const getPeriodStatus = () => {
    if (!currentCycle) return 'no-data';
    
    const today = new Date();
    const cycleStart = new Date(currentCycle.startDate);
    const daysSinceStart = differenceInDays(today, cycleStart);
    
    if (daysSinceStart <= (currentUser?.settings.periodLength || 5)) {
      return 'period';
    }
    
    // Check if in fertile window
    if (predictions) {
      const fertileStart = new Date(predictions.fertileWindowStart);
      const fertileEnd = new Date(predictions.fertileWindowEnd);
      if (today >= fertileStart && today <= fertileEnd) {
        return 'fertile';
      }
    }
    
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'period': return theme.palette.error.main;
      case 'fertile': return theme.palette.warning.main;
      case 'normal': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'period': return '生理中';
      case 'fertile': return '妊娠可能期';
      case 'normal': return '通常期';
      default: return 'データなし';
    }
  };

  const daysUntilPeriod = getDaysUntilPeriod();
  const currentCycleDay = getCurrentCycleDay();
  const periodStatus = getPeriodStatus();

  return (
    <Box sx={{ 
      paddingBottom: '80px', // Account for bottom navigation
      minHeight: '100vh',
      backgroundColor: 'background.default',
    }}>
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          paddingY: 6,
          paddingTop: 8,
        }}
      >
        <Container>
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
            <FavoriteIcon sx={{ fontSize: 32, marginRight: 1 }} />
            <Typography variant="h4" component="h1" fontWeight={600}>
              FemCare Pro
            </Typography>
          </Box>
          
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            こんにちは！今日も健康管理をサポートします
          </Typography>
        </Container>
      </Box>

      <Container sx={{ paddingY: 3 }}>
        {/* Status Cards */}
        <Grid container spacing={2} sx={{ marginBottom: 3 }}>
          {/* Current Status */}
          <Grid item xs={12} sm={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                  <FavoriteIcon sx={{ color: getStatusColor(periodStatus), marginRight: 1 }} />
                  <Typography variant="h6" component="h2">
                    現在の状態
                  </Typography>
                </Box>
                
                <Chip
                  label={getStatusText(periodStatus)}
                  sx={{
                    backgroundColor: getStatusColor(periodStatus),
                    color: 'white',
                    fontWeight: 600,
                    marginBottom: 2,
                  }}
                />
                
                {currentCycleDay && (
                  <Typography variant="body2" color="text.secondary">
                    周期 {currentCycleDay} 日目
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Next Period Prediction */}
          <Grid item xs={12} sm={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                  <CalendarTodayIcon sx={{ color: theme.palette.primary.main, marginRight: 1 }} />
                  <Typography variant="h6" component="h2">
                    次回の生理予測
                  </Typography>
                </Box>
                
                {daysUntilPeriod !== null ? (
                  <>
                    <Typography variant="h4" color="primary" fontWeight={600}>
                      {daysUntilPeriod > 0 ? `${daysUntilPeriod}日後` : '今日'}
                    </Typography>
                    
                    {predictions?.nextPeriodDate && (
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(predictions.nextPeriodDate), 'M月d日(E)', { locale: ja })}
                      </Typography>
                    )}
                    
                    {predictions?.nextPeriodConfidence && (
                      <LinearProgress
                        variant="determinate"
                        value={predictions.nextPeriodConfidence * 100}
                        sx={{ marginTop: 1 }}
                      />
                    )}
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    予測するにはもう少しデータが必要です
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Stats */}
        <Card sx={{ marginBottom: 3 }}>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              今月の概要
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" fontWeight={600}>
                    {cycles.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    記録した周期
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" fontWeight={600}>
                    {predictions?.averageCycleLength || '-'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    平均周期長
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" fontWeight={600}>
                    {predictions?.cycleVariability ? Math.round(predictions.cycleVariability * 100) : '-'}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    周期の安定性
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <TrendingUpIcon sx={{ color: theme.palette.info.main, marginRight: 1 }} />
              <Typography variant="h6" component="h2">
                今日のアクション
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              健康管理を続けるための推奨アクション
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {periodStatus === 'period' && (
                <Chip
                  icon={<FavoriteIcon />}
                  label="生理の記録を更新する"
                  clickable
                  variant="outlined"
                />
              )}
              
              <Chip
                icon={<CalendarTodayIcon />}
                label="今日の症状を記録する"
                clickable
                variant="outlined"
              />
              
              {predictions && daysUntilPeriod && daysUntilPeriod <= 3 && (
                <Chip
                  icon={<NotificationsIcon />}
                  label="生理用品の準備をする"
                  clickable
                  variant="outlined"
                  color="warning"
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default HomePage;