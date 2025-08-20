import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Grid,
  useTheme,
  Tab,
  Tabs,
  LinearProgress,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';

import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { fetchCycles } from '../../store/slices/cyclesSlice';
import { calculatePredictions } from '../../store/slices/predictionsSlice';
import { differenceInDays } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ paddingTop: 3 }}>{children}</Box>}
    </div>
  );
}

const AnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [currentTab, setCurrentTab] = useState(0);
  
  const { currentUser } = useAppSelector(state => state.user);
  const { cycles, isLoading } = useAppSelector(state => state.cycles);
  const { predictions } = useAppSelector(state => state.predictions);

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchCycles({ userId: currentUser.id, limit: 12 }));
      dispatch(calculatePredictions({ 
        userId: currentUser.id,
        lutealPhaseLength: currentUser.settings.lutealPhaseLength 
      }));
    }
  }, [dispatch, currentUser?.id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Calculate cycle statistics
  const getCycleStats = () => {
    if (cycles.length < 2) return null;

    const cycleLengths = cycles
      .filter(c => c.actualLength && c.actualLength > 0)
      .map(c => c.actualLength!);

    if (cycleLengths.length === 0) return null;

    const average = cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;
    const shortest = Math.min(...cycleLengths);
    const longest = Math.max(...cycleLengths);
    
    const variance = cycleLengths.reduce((sum, length) => {
      return sum + Math.pow(length - average, 2);
    }, 0) / cycleLengths.length;
    
    const standardDeviation = Math.sqrt(variance);
    const consistency = Math.max(0, 100 - (standardDeviation / average * 100));

    return {
      average: Math.round(average),
      shortest,
      longest,
      consistency: Math.round(consistency),
      totalCycles: cycleLengths.length,
    };
  };

  // Generate chart data for cycle lengths
  const getCycleLengthData = () => {
    return cycles
      .filter(c => c.actualLength && c.actualLength > 0)
      .slice(0, 6)
      .reverse()
      .map((cycle, index) => ({
        cycle: `${index + 1}`,
        length: cycle.actualLength || 0,
        date: new Date(cycle.startDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
      }));
  };

  // Get flow pattern data
  const getFlowPatternData = () => {
    const flowCounts = {
      heavy: 0,
      medium: 0,
      light: 0,
      spotting: 0,
    };

    cycles.forEach(cycle => {
      cycle.flowRecords.forEach(flow => {
        flowCounts[flow.flowLevel]++;
      });
    });

    return [
      { level: '多い', count: flowCounts.heavy, color: theme.palette.error.dark },
      { level: '普通', count: flowCounts.medium, color: theme.palette.error.main },
      { level: '少ない', count: flowCounts.light, color: theme.palette.error.light },
      { level: '少量', count: flowCounts.spotting, color: '#ffcccb' },
    ];
  };

  // Get mood and energy trends
  const getMoodEnergyData = () => {
    const last7Cycles = cycles.slice(0, 7);
    
    return last7Cycles.reverse().map((cycle, index) => {
      const avgMood = cycle.symptoms.length > 0
        ? cycle.symptoms.reduce((sum, s) => sum + s.mood.overall, 0) / cycle.symptoms.length
        : 0;
      
      const avgEnergy = cycle.symptoms.length > 0
        ? cycle.symptoms.reduce((sum, s) => sum + s.energy.overall, 0) / cycle.symptoms.length
        : 0;

      return {
        cycle: `${index + 1}`,
        mood: Math.round(avgMood * 10) / 10,
        energy: Math.round(avgEnergy * 10) / 10,
      };
    });
  };

  const cycleStats = getCycleStats();
  const cycleLengthData = getCycleLengthData();
  const flowPatternData = getFlowPatternData();
  const moodEnergyData = getMoodEnergyData();

  return (
    <Box sx={{ 
      paddingBottom: '80px',
      minHeight: '100vh',
      backgroundColor: 'background.default',
    }}>
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          paddingY: 4,
          paddingTop: 6,
        }}
      >
        <Container>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BarChartIcon sx={{ fontSize: 28, marginRight: 1 }} />
            <Typography variant="h5" component="h1" fontWeight={600}>
              健康分析
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9, marginTop: 1 }}>
            あなたの健康データの傾向と分析
          </Typography>
        </Container>
      </Box>

      <Container sx={{ paddingY: 3 }}>
        {cycles.length < 2 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', paddingY: 4 }}>
              <TrendingUpIcon sx={{ fontSize: 48, color: theme.palette.grey[300], marginBottom: 2 }} />
              <Typography variant="h6" gutterBottom>
                分析にはもう少しデータが必要です
              </Typography>
              <Typography variant="body2" color="text.secondary">
                2周期以上の記録があると、詳細な分析を表示できます
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Stats */}
            {cycleStats && (
              <Grid container spacing={2} sx={{ marginBottom: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary" fontWeight={600}>
                        {cycleStats.average}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        平均周期(日)
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary" fontWeight={600}>
                        {cycleStats.consistency}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        周期の安定性
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary" fontWeight={600}>
                        {cycleStats.shortest}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        最短周期(日)
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary" fontWeight={600}>
                        {cycleStats.longest}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        最長周期(日)
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Tabs for different analytics */}
            <Card>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={currentTab} onChange={handleTabChange} aria-label="analytics tabs">
                  <Tab label="周期分析" />
                  <Tab label="経血量" />
                  <Tab label="気分・エネルギー" />
                </Tabs>
              </Box>

              <TabPanel value={currentTab} index={0}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    周期の長さの推移
                  </Typography>
                  
                  {cycleLengthData.length > 0 ? (
                    <Box sx={{ height: 300, marginTop: 2 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={cycleLengthData}>
                          <XAxis dataKey="date" />
                          <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                          <Line 
                            type="monotone" 
                            dataKey="length" 
                            stroke={theme.palette.primary.main}
                            strokeWidth={2}
                            dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      データがありません
                    </Typography>
                  )}
                </CardContent>
              </TabPanel>

              <TabPanel value={currentTab} index={1}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    経血量の分布
                  </Typography>
                  
                  <Box sx={{ marginTop: 2 }}>
                    {flowPatternData.map((item, index) => (
                      <Box key={index} sx={{ marginBottom: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 0.5 }}>
                          <Typography variant="body2">{item.level}</Typography>
                          <Typography variant="body2">{item.count}日</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(item.count / Math.max(...flowPatternData.map(f => f.count))) * 100}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: theme.palette.grey[200],
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: item.color,
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </TabPanel>

              <TabPanel value={currentTab} index={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    気分とエネルギーの推移
                  </Typography>
                  
                  {moodEnergyData.length > 0 ? (
                    <Box sx={{ height: 300, marginTop: 2 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={moodEnergyData}>
                          <XAxis dataKey="cycle" />
                          <YAxis domain={[1, 10]} />
                          <Line 
                            type="monotone" 
                            dataKey="mood" 
                            stroke={theme.palette.secondary.main}
                            strokeWidth={2}
                            name="気分"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="energy" 
                            stroke={theme.palette.info.main}
                            strokeWidth={2}
                            name="エネルギー"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      症状データがありません
                    </Typography>
                  )}
                </CardContent>
              </TabPanel>
            </Card>
          </>
        )}
      </Container>
    </Box>
  );
};

export default AnalyticsPage;