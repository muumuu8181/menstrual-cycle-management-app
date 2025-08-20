import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  useTheme,
  Divider,
  Button,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaletteIcon from '@mui/icons-material/Palette';
import SecurityIcon from '@mui/icons-material/Security';
import BackupIcon from '@mui/icons-material/Backup';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';

import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { updateUserSettings, updateUserProfile } from '../../store/slices/userSlice';
import { setTheme, addNotification } from '../../store/slices/uiSlice';
import { db } from '../../services/database/database';

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  const { currentUser } = useAppSelector(state => state.user);
  const { theme: currentTheme } = useAppSelector(state => state.ui);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleNotificationToggle = (key: keyof typeof currentUser.settings.notifications) => {
    if (!currentUser) return;
    
    dispatch(updateUserSettings({
      notifications: {
        ...currentUser.settings.notifications,
        [key]: !currentUser.settings.notifications[key],
      },
    }));
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    dispatch(setTheme(newTheme));
    if (currentUser) {
      dispatch(updateUserSettings({
        display: {
          ...currentUser.settings.display,
          theme: newTheme,
        },
      }));
    }
  };

  const handlePrivacyToggle = (key: keyof typeof currentUser.privacy) => {
    if (!currentUser) return;
    
    const updatedPrivacy = {
      ...currentUser.privacy,
      [key]: !currentUser.privacy[key],
    };
    
    dispatch(updateUserProfile({
      privacy: updatedPrivacy,
    }));
    
    dispatch(addNotification({
      type: 'success',
      message: 'プライバシー設定を更新しました',
    }));
  };

  const handleDataExport = async () => {
    if (!currentUser) return;
    
    try {
      // Get all user data
      const cycles = await db.getCycles(currentUser.id);
      const predictions = await db.getPrediction(currentUser.id);
      const analytics = await db.getAnalytics(currentUser.id);
      
      // Create export data
      const exportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        userProfile: currentUser,
        cycles,
        predictions,
        analytics,
      };
      
      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `femcare-pro-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      dispatch(addNotification({
        type: 'success',
        message: 'データをエクスポートしました',
      }));
    } catch (error) {
      console.error('Export failed:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'エクスポートに失敗しました',
      }));
    }
  };

  const handleDataDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!currentUser || deleteConfirmText !== '削除') {
      return;
    }

    try {
      await db.deleteAllUserData(currentUser.id);
      
      dispatch(addNotification({
        type: 'success',
        message: 'すべてのデータを削除しました',
      }));
      
      // Reset form and close dialog
      setDeleteConfirmText('');
      setDeleteDialogOpen(false);
      
      // Optionally redirect to home or reload the app
      window.location.reload();
    } catch (error) {
      console.error('Delete failed:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'データの削除に失敗しました',
      }));
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmText('');
    setDeleteDialogOpen(false);
  };

  if (!currentUser) return null;

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
            <SettingsIcon sx={{ fontSize: 28, marginRight: 1 }} />
            <Typography variant="h5" component="h1" fontWeight={600}>
              設定
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9, marginTop: 1 }}>
            アプリの設定をカスタマイズ
          </Typography>
        </Container>
      </Box>

      <Container sx={{ paddingY: 3 }}>
        {/* Notifications Settings */}
        <Card sx={{ marginBottom: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <NotificationsIcon sx={{ color: theme.palette.primary.main, marginRight: 1 }} />
              <Typography variant="h6">通知設定</Typography>
            </Box>
            
            <List disablePadding>
              <ListItem>
                <ListItemText 
                  primary="生理予定通知"
                  secondary="生理予定日の数日前に通知"
                />
                <Switch
                  checked={currentUser.settings.notifications.periodReminder}
                  onChange={() => handleNotificationToggle('periodReminder')}
                  color="primary"
                />
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="排卵日通知"
                  secondary="排卵予定日の通知"
                />
                <Switch
                  checked={currentUser.settings.notifications.ovulationReminder}
                  onChange={() => handleNotificationToggle('ovulationReminder')}
                  color="primary"
                />
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="PMS通知"
                  secondary="PMS症状が現れやすい時期の通知"
                />
                <Switch
                  checked={currentUser.settings.notifications.pmsReminder}
                  onChange={() => handleNotificationToggle('pmsReminder')}
                  color="primary"
                />
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="記録リマインダー"
                  secondary="定期的に記録を促す通知"
                />
                <Switch
                  checked={currentUser.settings.notifications.recordReminder}
                  onChange={() => handleNotificationToggle('recordReminder')}
                  color="primary"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card sx={{ marginBottom: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <PaletteIcon sx={{ color: theme.palette.primary.main, marginRight: 1 }} />
              <Typography variant="h6">表示設定</Typography>
            </Box>
            
            <List disablePadding>
              <ListItemButton onClick={() => handleThemeChange('light')}>
                <ListItemText primary="ライトテーマ" />
                {currentTheme === 'light' && (
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    backgroundColor: theme.palette.primary.main 
                  }} />
                )}
              </ListItemButton>
              
              <ListItemButton onClick={() => handleThemeChange('dark')}>
                <ListItemText primary="ダークテーマ" />
                {currentTheme === 'dark' && (
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    backgroundColor: theme.palette.primary.main 
                  }} />
                )}
              </ListItemButton>
              
              <ListItemButton onClick={() => handleThemeChange('auto')}>
                <ListItemText 
                  primary="システム設定に従う"
                  secondary="デバイスの設定に合わせて自動切り替え"
                />
                {currentTheme === 'auto' && (
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    backgroundColor: theme.palette.primary.main 
                  }} />
                )}
              </ListItemButton>
            </List>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card sx={{ marginBottom: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <SecurityIcon sx={{ color: theme.palette.primary.main, marginRight: 1 }} />
              <Typography variant="h6">プライバシー設定</Typography>
            </Box>
            
            <List disablePadding>
              <ListItem>
                <ListItemText 
                  primary="使用状況分析"
                  secondary="アプリの改善のための匿名データ収集"
                />
                <Switch
                  checked={currentUser.privacy.analytics}
                  onChange={() => handlePrivacyToggle('analytics')}
                  color="primary"
                />
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="クラッシュレポート"
                  secondary="アプリのエラー改善のためのレポート送信"
                />
                <Switch
                  checked={currentUser.privacy.crashReporting}
                  onChange={() => handlePrivacyToggle('crashReporting')}
                  color="primary"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card sx={{ marginBottom: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <BackupIcon sx={{ color: theme.palette.primary.main, marginRight: 1 }} />
              <Typography variant="h6">データ管理</Typography>
            </Box>
            
            <List disablePadding>
              <ListItemButton onClick={handleDataExport}>
                <ListItemIcon>
                  <BackupIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="データのエクスポート"
                  secondary="記録データをファイルに出力"
                />
              </ListItemButton>
              
              <Divider sx={{ marginY: 1 }} />
              
              <ListItemButton onClick={handleDataDelete} sx={{ color: theme.palette.error.main }}>
                <ListItemIcon>
                  <DeleteIcon sx={{ color: theme.palette.error.main }} />
                </ListItemIcon>
                <ListItemText 
                  primary="すべてのデータを削除"
                  secondary="この操作は取り消せません"
                />
              </ListItemButton>
            </List>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <InfoIcon sx={{ color: theme.palette.primary.main, marginRight: 1 }} />
              <Typography variant="h6">アプリ情報</Typography>
            </Box>
            
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="body2" color="text.secondary">
                バージョン: 1.0.0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                最終更新: 2024年8月20日
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" paragraph>
              FemCare Pro は女性の健康管理をサポートするアプリです。
              すべてのデータはお使いのデバイスに安全に保存され、
              外部に送信されることはありません。
            </Typography>

            <Button variant="outlined" size="small">
              プライバシーポリシー
            </Button>
          </CardContent>
        </Card>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: theme.palette.error.main }}>
          データ削除の確認
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            <strong>警告:</strong> この操作により、すべての記録データが完全に削除されます。
            この操作は取り消すことができません。
          </Typography>
          
          <Typography variant="body2" paragraph>
            削除を実行するには、下のテキストフィールドに「削除」と入力してください。
          </Typography>
          
          <TextField
            fullWidth
            label="確認テキスト"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="削除"
            error={deleteConfirmText !== '' && deleteConfirmText !== '削除'}
            helperText={deleteConfirmText !== '' && deleteConfirmText !== '削除' ? '「削除」と正確に入力してください' : ''}
            sx={{ marginTop: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="inherit">
            キャンセル
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteConfirmText !== '削除'}
          >
            削除実行
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;