import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: 3,
            backgroundColor: 'background.default',
          }}
        >
          <Paper
            sx={{
              padding: 4,
              textAlign: 'center',
              maxWidth: 500,
            }}
          >
            <ErrorOutlineIcon
              sx={{
                fontSize: 64,
                color: 'error.main',
                marginBottom: 2,
              }}
            />
            
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              申し訳ございません
            </Typography>
            
            <Typography
              variant="body1"
              color="text.secondary"
              paragraph
            >
              アプリでエラーが発生しました。ページを再読み込みするか、しばらく時間をおいてから再度お試しください。
            </Typography>

            {process.env.NODE_ENV === 'development' && (
              <Box
                sx={{
                  textAlign: 'left',
                  backgroundColor: 'grey.100',
                  padding: 2,
                  borderRadius: 1,
                  marginBottom: 2,
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  overflow: 'auto',
                  maxHeight: 200,
                }}
              >
                <Typography variant="body2" component="div">
                  <strong>Error:</strong> {this.state.error?.message}
                </Typography>
                <Typography variant="body2" component="div" sx={{ marginTop: 1 }}>
                  <strong>Stack:</strong>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {this.state.error?.stack}
                  </pre>
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleReload}
              >
                ページを再読み込み
              </Button>
              
              <Button
                variant="outlined"
                onClick={this.handleReset}
              >
                再試行
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;