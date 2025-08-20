import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PredictionData, MenstrualCycle } from '../../types/models';
import { db } from '../../services/database/database';
import { addDays } from 'date-fns';

interface PredictionsState {
  predictions: PredictionData | null;
  isLoading: boolean;
  error: string | null;
  lastCalculated: number | null;
}

const initialState: PredictionsState = {
  predictions: null,
  isLoading: false,
  error: null,
  lastCalculated: null,
};

// Helper function to calculate cycle statistics
const calculateCycleStats = (cycles: MenstrualCycle[]) => {
  if (cycles.length < 2) return null;

  const cycleLengths = cycles
    .filter(c => c.actualLength && c.actualLength > 0)
    .map(c => c.actualLength!)
    .slice(0, 12); // Use last 12 cycles for calculation

  if (cycleLengths.length < 2) return null;

  const averageLength = cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;
  
  const variance = cycleLengths.reduce((sum, length) => {
    return sum + Math.pow(length - averageLength, 2);
  }, 0) / cycleLengths.length;
  
  const standardDeviation = Math.sqrt(variance);

  return {
    averageLength: Math.round(averageLength),
    standardDeviation,
    variability: standardDeviation / averageLength,
  };
};

// Helper function to calculate next period date
const calculateNextPeriod = (cycles: MenstrualCycle[], stats: ReturnType<typeof calculateCycleStats>) => {
  if (!cycles.length || !stats) return null;

  const latestCycle = cycles[0];
  const nextPeriodDate = addDays(latestCycle.startDate, stats.averageLength);
  
  // Calculate confidence based on cycle regularity
  // Lower variability = higher confidence
  const baseConfidence = 0.5;
  const variabilityFactor = Math.max(0, 0.5 - stats.variability);
  const dataFactor = Math.min(0.3, cycles.length * 0.05); // More data = higher confidence
  
  const confidence = Math.min(0.95, baseConfidence + variabilityFactor + dataFactor);

  return {
    date: nextPeriodDate,
    confidence,
  };
};

// Helper function to calculate ovulation date
const calculateNextOvulation = (nextPeriodDate: Date, lutealPhaseLength = 14) => {
  const ovulationDate = addDays(nextPeriodDate, -lutealPhaseLength);
  
  // Ovulation confidence is generally lower than period prediction
  const confidence = 0.7;

  return {
    date: ovulationDate,
    confidence,
  };
};

// Helper function to calculate fertile window
const calculateFertileWindow = (ovulationDate: Date) => {
  // Fertile window: 5 days before ovulation + ovulation day
  return {
    start: addDays(ovulationDate, -5),
    end: ovulationDate,
  };
};

// Async thunks
export const calculatePredictions = createAsyncThunk(
  'predictions/calculatePredictions',
  async (params: { userId: string; lutealPhaseLength?: number }) => {
    try {
      // Fetch recent cycles for calculation
      const cycles = await db.getCycles(params.userId, 12);
      
      if (cycles.length < 2) {
        throw new Error('Need at least 2 cycles for predictions');
      }

      // Calculate cycle statistics
      const stats = calculateCycleStats(cycles);
      if (!stats) {
        throw new Error('Unable to calculate cycle statistics');
      }

      // Calculate next period
      const nextPeriod = calculateNextPeriod(cycles, stats);
      if (!nextPeriod) {
        throw new Error('Unable to calculate next period');
      }

      // Calculate next ovulation
      const lutealPhaseLength = params.lutealPhaseLength || 14;
      const nextOvulation = calculateNextOvulation(nextPeriod.date, lutealPhaseLength);
      
      // Calculate fertile window
      const fertileWindow = calculateFertileWindow(nextOvulation.date);
      
      // Calculate PMS start date (typically 7-10 days before period)
      const pmsStartDate = addDays(nextPeriod.date, -10);

      const predictions: PredictionData = {
        userId: params.userId,
        nextPeriodDate: nextPeriod.date,
        nextPeriodConfidence: nextPeriod.confidence,
        nextOvulationDate: nextOvulation.date,
        nextOvulationConfidence: nextOvulation.confidence,
        fertileWindowStart: fertileWindow.start,
        fertileWindowEnd: fertileWindow.end,
        pmsStartDate,
        averageCycleLength: stats.averageLength,
        cycleVariability: stats.variability,
        lastUpdated: new Date(),
      };

      // Save predictions to database
      await db.savePrediction(predictions);

      return predictions;
    } catch (error) {
      console.error('Failed to calculate predictions:', error);
      throw error;
    }
  }
);

export const fetchPredictions = createAsyncThunk(
  'predictions/fetchPredictions',
  async (userId: string) => {
    return await db.getPrediction(userId);
  }
);

export const updatePredictions = createAsyncThunk(
  'predictions/updatePredictions',
  async (params: { userId: string; updates: Partial<PredictionData> }) => {
    const existing = await db.getPrediction(params.userId);
    if (!existing) {
      throw new Error('No existing predictions found');
    }

    const updated: PredictionData = {
      ...existing,
      ...params.updates,
      lastUpdated: new Date(),
    };

    await db.savePrediction(updated);
    return updated;
  }
);

const predictionsSlice = createSlice({
  name: 'predictions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    clearPredictions: (state) => {
      state.predictions = null;
      state.lastCalculated = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Calculate predictions
      .addCase(calculatePredictions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(calculatePredictions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.predictions = action.payload;
        state.lastCalculated = Date.now();
      })
      .addCase(calculatePredictions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to calculate predictions';
      })
      
      // Fetch predictions
      .addCase(fetchPredictions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPredictions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.predictions = action.payload || null;
      })
      .addCase(fetchPredictions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch predictions';
      })
      
      // Update predictions
      .addCase(updatePredictions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatePredictions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.predictions = action.payload;
      })
      .addCase(updatePredictions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update predictions';
      });
  },
});

export const { clearError, clearPredictions } = predictionsSlice.actions;
export default predictionsSlice;