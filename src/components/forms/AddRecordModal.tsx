import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  IconButton,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
// DatePicker import removed for simplification
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { addCycle } from '../../store/slices/cyclesSlice';
import { MenstrualCycle } from '../../types/models';

interface AddRecordModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'cycle' | 'flow' | 'symptom';
  initialDate?: Date;
}

const AddRecordModal: React.FC<AddRecordModalProps> = ({
  open,
  onClose,
  mode,
  initialDate = new Date(),
}) => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector(state => state.user);

  // Form state
  const [date, setDate] = useState<Date>(initialDate);
  const [flowLevel, setFlowLevel] = useState<'spotting' | 'light' | 'medium' | 'heavy'>('medium');
  const [flowColor, setFlowColor] = useState<'bright_red' | 'dark_red' | 'brown' | 'pink' | 'orange' | 'black'>('bright_red');
  const [painLevel, setPainLevel] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!currentUser?.id) return;

    setIsSubmitting(true);
    try {
      if (mode === 'cycle') {
        // Create a new cycle with the first flow record
        const newCycle: Omit<MenstrualCycle, 'id' | 'createdAt' | 'updatedAt'> = {
          userId: currentUser.id,
          startDate: date,
          endDate: undefined,
          actualLength: undefined,
          predictedLength: currentUser.settings.cycleLength,
          flowRecords: [{
            id: crypto.randomUUID(),
            date: date,
            flowLevel,
            flowColor,
            clots: false,
            products: [],
            leakage: false,
            pain: {
              severity: painLevel as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
              location: ['lower_abdomen'],
              type: ['cramping'],
              duration: 'hours',
              medication: [],
            },
            notes,
          }],
          symptoms: [],
          ovulation: null,
          notes: '',
          isConfirmed: true,
        };

        await dispatch(addCycle(newCycle)).unwrap();
      }

      // Reset form and close
      setDate(new Date());
      setFlowLevel('medium');
      setFlowColor('bright_red');
      setPainLevel(0);
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Failed to add record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'cycle': return '新しい周期を開始';
      case 'flow': return '経血の記録';
      case 'symptom': return '症状の記録';
      default: return '記録を追加';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 1,
        }}
      >
        <Typography variant="h6">{getTitle()}</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ paddingTop: 1 }}>
        <Stack spacing={3}>
          {/* Date Selection */}
          <TextField
            label="日付"
            type="date"
            value={date.toISOString().split('T')[0]}
            onChange={(e) => setDate(new Date(e.target.value))}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />

          {/* Flow Level */}
          {(mode === 'cycle' || mode === 'flow') && (
            <FormControl fullWidth>
              <InputLabel>経血量</InputLabel>
              <Select
                value={flowLevel}
                label="経血量"
                onChange={(e) => setFlowLevel(e.target.value as 'spotting' | 'light' | 'medium' | 'heavy')}
              >
                <MenuItem value="spotting">少量</MenuItem>
                <MenuItem value="light">少ない</MenuItem>
                <MenuItem value="medium">普通</MenuItem>
                <MenuItem value="heavy">多い</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Flow Color */}
          {(mode === 'cycle' || mode === 'flow') && (
            <FormControl fullWidth>
              <InputLabel>色</InputLabel>
              <Select
                value={flowColor}
                label="色"
                onChange={(e) => setFlowColor(e.target.value as 'bright_red' | 'dark_red' | 'brown' | 'pink' | 'orange' | 'black')}
              >
                <MenuItem value="bright_red">鮮赤色</MenuItem>
                <MenuItem value="dark_red">暗赤色</MenuItem>
                <MenuItem value="brown">茶色</MenuItem>
                <MenuItem value="pink">ピンク</MenuItem>
                <MenuItem value="orange">オレンジ</MenuItem>
                <MenuItem value="black">黒色</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Pain Level */}
          <Box>
            <Typography variant="body2" gutterBottom>
              痛みのレベル: {painLevel}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <Chip
                  key={level}
                  label={level}
                  onClick={() => setPainLevel(level)}
                  color={painLevel === level ? 'primary' : 'default'}
                  size="small"
                  clickable
                />
              ))}
            </Box>
          </Box>

          {/* Notes */}
          <TextField
            label="メモ"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="症状や気分など、記録しておきたいことを入力してください"
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ padding: 3 }}>
        <Button onClick={onClose} color="inherit">
          キャンセル
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          sx={{ minWidth: 100 }}
        >
          {isSubmitting ? '保存中...' : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddRecordModal;