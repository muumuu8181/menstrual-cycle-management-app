import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Fab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MoodIcon from '@mui/icons-material/Mood';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { fetchCycles } from '../../store/slices/cyclesSlice';
import { MenstrualCycle, FlowRecord } from '../../types/models';

const RecordsPage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  const { currentUser } = useAppSelector(state => state.user);
  const { cycles, isLoading } = useAppSelector(state => state.cycles);

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchCycles({ userId: currentUser.id, limit: 20 }));
    }
  }, [dispatch, currentUser?.id]);

  const getFlowLevelText = (level: string) => {
    switch (level) {
      case 'heavy': return '多い';
      case 'medium': return '普通';
      case 'light': return '少ない';
      case 'spotting': return '少量';
      default: return level;
    }
  };

  const getFlowLevelColor = (level: string) => {
    switch (level) {
      case 'heavy': return theme.palette.error.dark;
      case 'medium': return theme.palette.error.main;
      case 'light': return theme.palette.error.light;
      case 'spotting': return '#ffcccb';
      default: return theme.palette.grey[500];
    }
  };

  const getPainLevelText = (level: number) => {
    if (level === 0) return 'なし';
    if (level <= 3) return '軽度';
    if (level <= 6) return '中程度';
    return '重度';
  };

  const handleAddRecord = () => {
    // TODO: Open add record modal/dialog
    console.log('Add new record');
  };

  const handleEditRecord = (cycleId: string, recordId?: string) => {
    // TODO: Open edit record modal/dialog
    console.log('Edit record', { cycleId, recordId });
  };

  const renderCycleCard = (cycle: MenstrualCycle) => {
    const latestFlow = cycle.flowRecords[cycle.flowRecords.length - 1];
    const latestSymptom = cycle.symptoms[cycle.symptoms.length - 1];
    
    return (
      <Card key={cycle.id} sx={{ marginBottom: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                {format(new Date(cycle.startDate), 'M月d日', { locale: ja })}
                {cycle.endDate && ` - ${format(new Date(cycle.endDate), 'M月d日', { locale: ja })}`}
              </Typography>
              
              {cycle.actualLength && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  周期: {cycle.actualLength}日
                </Typography>
              )}

              {/* Flow records summary */}
              {cycle.flowRecords.length > 0 && (
                <Box sx={{ marginY: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    生理記録:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {cycle.flowRecords.slice(-3).map((flow, index) => (
                      <Chip
                        key={index}
                        label={`${format(new Date(flow.date), 'M/d', { locale: ja })} ${getFlowLevelText(flow.flowLevel)}`}
                        size="small"
                        sx={{
                          backgroundColor: getFlowLevelColor(flow.flowLevel),
                          color: 'white',
                        }}
                      />
                    ))}
                    {cycle.flowRecords.length > 3 && (
                      <Typography variant="body2" color="text.secondary">
                        +{cycle.flowRecords.length - 3}件
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}

              {/* Latest pain info */}
              {latestFlow?.pain.severity > 0 && (
                <Box sx={{ marginY: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    痛み: {getPainLevelText(latestFlow.pain.severity)} (レベル{latestFlow.pain.severity})
                  </Typography>
                </Box>
              )}

              {/* Symptoms info */}
              {latestSymptom && (
                <Box sx={{ marginY: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    症状:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      icon={<MoodIcon />}
                      label={`気分 ${latestSymptom.mood.overall}/10`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`エネルギー ${latestSymptom.energy.overall}/10`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              )}

              {cycle.notes && (
                <Typography variant="body2" color="text.secondary" sx={{ marginTop: 1 }}>
                  メモ: {cycle.notes}
                </Typography>
              )}
            </Box>

            <IconButton 
              onClick={() => handleEditRecord(cycle.id)}
              size="small"
              sx={{ color: theme.palette.primary.main }}
            >
              <EditIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  };

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
            <FavoriteIcon sx={{ fontSize: 28, marginRight: 1 }} />
            <Typography variant="h5" component="h1" fontWeight={600}>
              記録一覧
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9, marginTop: 1 }}>
            生理周期と症状の記録を確認できます
          </Typography>
        </Container>
      </Box>

      <Container sx={{ paddingY: 3 }}>
        {cycles.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', paddingY: 4 }}>
              <FavoriteIcon sx={{ fontSize: 48, color: theme.palette.grey[300], marginBottom: 2 }} />
              <Typography variant="h6" gutterBottom>
                まだ記録がありません
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                最初の記録を追加して、健康管理を始めましょう
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              記録履歴 ({cycles.length}件)
            </Typography>
            
            {cycles.map(cycle => renderCycleCard(cycle))}
          </Box>
        )}

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="記録を追加"
          onClick={handleAddRecord}
          sx={{
            position: 'fixed',
            bottom: 90, // Above bottom navigation
            right: 16,
            boxShadow: theme.shadows[6],
          }}
        >
          <AddIcon />
        </Fab>
      </Container>
    </Box>
  );
};

export default RecordsPage;