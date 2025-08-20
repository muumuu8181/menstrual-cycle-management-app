import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'FemCare Pro を読み込んでいます...' 
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        padding: 3,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 3,
        }}
      >
        <FavoriteIcon 
          sx={{ 
            fontSize: 32, 
            color: theme.palette.primary.main,
            marginRight: 1,
          }} 
        />
        <Typography
          variant="h4"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 600,
          }}
        >
          FemCare Pro
        </Typography>
      </Box>

      <CircularProgress
        size={60}
        thickness={4}
        sx={{
          color: theme.palette.primary.main,
          marginBottom: 2,
        }}
      />

      <Typography
        variant="body1"
        sx={{
          color: theme.palette.text.secondary,
          textAlign: 'center',
          maxWidth: 300,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingScreen;