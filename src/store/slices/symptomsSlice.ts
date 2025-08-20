import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { SymptomRecord } from '../../types/models';
import { db } from '../../services/database/database';

interface SymptomsState {
  symptoms: SymptomRecord[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: SymptomsState = {
  symptoms: [],
  isLoading: false,
  error: null,
  lastFetched: null,
};

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Async thunks
export const fetchSymptoms = createAsyncThunk(
  'symptoms/fetchSymptoms',
  async (cycleId: string, { getState }) => {
    const state = getState() as { symptoms: SymptomsState };
    const now = Date.now();
    
    // Check cache validity
    if (state.symptoms.lastFetched && (now - state.symptoms.lastFetched < CACHE_DURATION)) {
      return state.symptoms.symptoms;
    }
    
    return await db.getSymptoms(cycleId);
  }
);

export const fetchSymptomsByDateRange = createAsyncThunk(
  'symptoms/fetchSymptomsByDateRange',
  async (params: { cycleId: string; startDate: Date; endDate: Date }) => {
    return await db.getSymptomsByDateRange(params.cycleId, params.startDate, params.endDate);
  }
);

export const addSymptom = createAsyncThunk(
  'symptoms/addSymptom',
  async (symptomData: Omit<SymptomRecord, 'id'>) => {
    const symptomId = await db.addSymptom(symptomData);
    const symptom = await db.symptoms.where('id').equals(symptomId).first();
    return symptom!;
  }
);

export const updateSymptom = createAsyncThunk(
  'symptoms/updateSymptom',
  async (params: { symptomId: string; updates: Partial<SymptomRecord> }) => {
    await db.updateSymptom(params.symptomId, params.updates);
    const symptom = await db.symptoms.where('id').equals(params.symptomId).first();
    return symptom!;
  }
);

export const deleteSymptom = createAsyncThunk(
  'symptoms/deleteSymptom',
  async (symptomId: string) => {
    await db.deleteSymptom(symptomId);
    return symptomId;
  }
);

const symptomsSlice = createSlice({
  name: 'symptoms',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    clearSymptoms: (state) => {
      state.symptoms = [];
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch symptoms
      .addCase(fetchSymptoms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSymptoms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.symptoms = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchSymptoms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch symptoms';
      })
      
      // Fetch symptoms by date range
      .addCase(fetchSymptomsByDateRange.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSymptomsByDateRange.fulfilled, (state, action) => {
        state.isLoading = false;
        // Merge with existing symptoms, avoiding duplicates
        const existingIds = new Set(state.symptoms.map(s => s.id));
        const newSymptoms = action.payload.filter(s => !existingIds.has(s.id));
        state.symptoms = [...state.symptoms, ...newSymptoms].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      })
      .addCase(fetchSymptomsByDateRange.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch symptoms by date range';
      })
      
      // Add symptom
      .addCase(addSymptom.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addSymptom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.symptoms = [action.payload, ...state.symptoms];
      })
      .addCase(addSymptom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to add symptom';
      })
      
      // Update symptom
      .addCase(updateSymptom.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateSymptom.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.symptoms.findIndex(symptom => symptom.id === action.payload.id);
        if (index !== -1) {
          state.symptoms[index] = action.payload;
        }
      })
      .addCase(updateSymptom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update symptom';
      })
      
      // Delete symptom
      .addCase(deleteSymptom.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteSymptom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.symptoms = state.symptoms.filter(symptom => symptom.id !== action.payload);
      })
      .addCase(deleteSymptom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete symptom';
      });
  },
});

export const { clearError, clearSymptoms } = symptomsSlice.actions;
export default symptomsSlice;