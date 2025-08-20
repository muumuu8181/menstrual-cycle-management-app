import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  IconButton,
  Grid,
  useTheme,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { ja } from 'date-fns/locale';

import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { fetchCyclesByDateRange } from '../../store/slices/cyclesSlice';
import { CalendarDay } from '../../types/models';
import CalendarDayCell from '../../components/calendar/CalendarDayCell';

const CalendarPage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  const { currentUser } = useAppSelector(state => state.user);
  const { cycles } = useAppSelector(state => state.cycles);
  const { predictions } = useAppSelector(state => state.predictions);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (currentUser?.id) {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const rangeStart = startOfWeek(monthStart);
      const rangeEnd = endOfWeek(monthEnd);
      
      dispatch(fetchCyclesByDateRange({
        userId: currentUser.id,
        startDate: rangeStart,
        endDate: rangeEnd,
      }));
    }
  }, [dispatch, currentUser?.id, currentMonth]);

  const generateCalendarData = (): CalendarDay[] => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const rangeStart = startOfWeek(monthStart);
    const rangeEnd = endOfWeek(monthEnd);
    
    const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
    
    return days.map(date => {
      const calendarDay: CalendarDay = {
        date,
        isPeriod: false,
        isOvulation: false,
        isFertile: false,
        isPredicted: false,
        hasSymptoms: false,
        isToday: isSameDay(date, new Date()),
        isCurrentMonth: isSameMonth(date, currentMonth),
      };

      // Check if date is in any cycle's flow records
      cycles.forEach(cycle => {
        cycle.flowRecords.forEach(flow => {
          if (isSameDay(new Date(flow.date), date)) {
            calendarDay.isPeriod = true;
            calendarDay.flowLevel = flow.flowLevel;
          }
        });

        // Check for symptoms
        cycle.symptoms.forEach(symptom => {
          if (isSameDay(new Date(symptom.date), date)) {
            calendarDay.hasSymptoms = true;
            calendarDay.mood = symptom.mood.overall;
            calendarDay.energy = symptom.energy.overall;
          }
        });

        // Check for ovulation
        if (cycle.ovulation && isSameDay(new Date(cycle.ovulation.date), date)) {
          calendarDay.isOvulation = true;
        }
      });

      // Check predictions
      if (predictions) {
        // Future period prediction
        if (isSameDay(new Date(predictions.nextPeriodDate), date)) {
          calendarDay.isPredicted = true;
          if (!calendarDay.isPeriod) {
            calendarDay.isPeriod = true; // Show as predicted period
          }
        }

        // Fertile window
        const fertileStart = new Date(predictions.fertileWindowStart);
        const fertileEnd = new Date(predictions.fertileWindowEnd);
        if (date >= fertileStart && date <= fertileEnd) {
          calendarDay.isFertile = true;
        }

        // Ovulation prediction
        if (isSameDay(new Date(predictions.nextOvulationDate), date)) {
          calendarDay.isOvulation = true;
          if (!cycles.some(c => c.ovulation && isSameDay(new Date(c.ovulation.date), date))) {
            calendarDay.isPredicted = true;
          }
        }
      }

      return calendarDay;
    });
  };

  const calendarDays = generateCalendarData();

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

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
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
          }}>
            <IconButton onClick={handlePrevMonth} sx={{ color: 'white' }}>
              <ChevronLeftIcon />
            </IconButton>
            
            <Typography variant="h5" component="h1" fontWeight={600}>
              {format(currentMonth, 'yyyy年M月', { locale: ja })}
            </Typography>
            
            <IconButton onClick={handleNextMonth} sx={{ color: 'white' }}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Container>
      </Box>

      <Container sx={{ paddingY: 2 }}>
        <Card>
          <CardContent sx={{ padding: '16px !important' }}>
            {/* Week day headers */}
            <Grid container spacing={0} sx={{ marginBottom: 1 }}>
              {weekDays.map((day, index) => (
                <Grid item xs key={day} sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  paddingY: 1,
                }}>
                  <Typography 
                    variant="body2" 
                    fontWeight={600}
                    color={index === 0 ? 'error.main' : index === 6 ? 'primary.main' : 'text.secondary'}
                  >
                    {day}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* Calendar grid */}
            <Grid container spacing={0}>
              {calendarDays.map((day, index) => (
                <Grid item xs key={index}>
                  <CalendarDayCell day={day} />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card sx={{ marginTop: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              凡例
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                  <Box sx={{ 
                    width: 16, 
                    height: 16, 
                    backgroundColor: theme.palette.error.main,
                    borderRadius: '50%',
                    marginRight: 1,
                  }} />
                  <Typography variant="body2">生理</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                  <Box sx={{ 
                    width: 16, 
                    height: 16, 
                    backgroundColor: theme.palette.warning.main,
                    borderRadius: '50%',
                    marginRight: 1,
                  }} />
                  <Typography variant="body2">妊娠可能期</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                  <Box sx={{ 
                    width: 16, 
                    height: 16, 
                    backgroundColor: theme.palette.info.main,
                    borderRadius: '50%',
                    marginRight: 1,
                  }} />
                  <Typography variant="body2">排卵日</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                  <Box sx={{ 
                    width: 16, 
                    height: 16, 
                    backgroundColor: 'transparent',
                    border: `2px dashed ${theme.palette.grey[400]}`,
                    borderRadius: '50%',
                    marginRight: 1,
                  }} />
                  <Typography variant="body2">予測</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default CalendarPage;