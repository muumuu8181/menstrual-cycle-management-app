import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { CalendarDay } from '../../types/models';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

interface CalendarDayCellProps {
  day: CalendarDay;
  onClick?: () => void;
}

const CalendarDayCell: React.FC<CalendarDayCellProps> = ({ day, onClick }) => {
  const theme = useTheme();

  const getCellBackground = () => {
    if (day.isPeriod) {
      if (day.isPredicted) {
        return 'transparent'; // Will be handled by border
      }
      switch (day.flowLevel) {
        case 'heavy':
          return theme.palette.error.dark;
        case 'medium':
          return theme.palette.error.main;
        case 'light':
          return theme.palette.error.light;
        case 'spotting':
          return '#ffcccb';
        default:
          return theme.palette.error.main;
      }
    }
    
    if (day.isFertile) {
      return day.isOvulation 
        ? theme.palette.warning.main 
        : theme.palette.warning.light;
    }
    
    if (day.isOvulation) {
      return day.isPredicted 
        ? 'transparent'
        : theme.palette.info.main;
    }
    
    if (day.isToday) {
      return theme.palette.primary.light;
    }
    
    return 'transparent';
  };

  const getCellBorder = () => {
    if (day.isPredicted) {
      if (day.isPeriod) {
        return `2px dashed ${theme.palette.error.main}`;
      }
      if (day.isOvulation) {
        return `2px dashed ${theme.palette.info.main}`;
      }
    }
    
    if (day.isToday && !day.isPeriod && !day.isFertile && !day.isOvulation) {
      return `2px solid ${theme.palette.primary.main}`;
    }
    
    return 'none';
  };

  const getTextColor = () => {
    if (!day.isCurrentMonth) {
      return theme.palette.text.disabled;
    }
    
    if (day.isPeriod || day.isFertile || day.isOvulation) {
      return 'white';
    }
    
    if (day.isToday) {
      return 'white';
    }
    
    return theme.palette.text.primary;
  };

  const renderIndicators = () => {
    const indicators = [];
    
    if (day.hasSymptoms) {
      indicators.push(
        <FiberManualRecordIcon 
          key="symptoms"
          sx={{ 
            fontSize: 6,
            color: day.isPeriod || day.isFertile || day.isOvulation 
              ? 'white' 
              : theme.palette.grey[600]
          }}
        />
      );
    }
    
    return indicators;
  };

  return (
    <Box
      onClick={onClick}
      sx={{
        aspect: '1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: getCellBackground(),
        border: getCellBorder(),
        borderRadius: 1,
        margin: 0.5,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        minHeight: 40,
        '&:hover': onClick ? {
          transform: 'scale(1.05)',
          boxShadow: theme.shadows[2],
        } : {},
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: getTextColor(),
          fontWeight: day.isToday ? 600 : 400,
          fontSize: '0.875rem',
        }}
      >
        {day.date.getDate()}
      </Typography>
      
      {/* Indicators for symptoms, etc. */}
      {day.hasSymptoms && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 2,
            display: 'flex',
            gap: 0.5,
          }}
        >
          {renderIndicators()}
        </Box>
      )}

      {/* Flow level indicator */}
      {day.isPeriod && day.flowLevel && !day.isPredicted && (
        <Box
          sx={{
            position: 'absolute',
            top: 2,
            right: 2,
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: 'white',
            opacity: 0.8,
          }}
        />
      )}
    </Box>
  );
};

export default CalendarDayCell;