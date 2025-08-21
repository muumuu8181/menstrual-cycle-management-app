import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MenstrualCycle, FlowRecord } from '../../types/models';
import { db } from '../../services/database/database';
import { mockDataService } from '../../services/mockData';

interface CyclesState {
  cycles: MenstrualCycle[];
  currentCycle: MenstrualCycle | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  selectedCycleId: string | null;
}

const initialState: CyclesState = {
  cycles: [],
  currentCycle: null,
  isLoading: false,
  error: null,
  lastFetched: null,
  selectedCycleId: null,
};

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Async thunks
export const fetchCycles = createAsyncThunk(
  'cycles/fetchCycles',
  async (params: { userId: string; limit?: number }, { getState }) => {
    const state = getState() as { cycles: CyclesState };
    const now = Date.now();
    
    // Check cache validity
    if (state.cycles.lastFetched && (now - state.cycles.lastFetched < CACHE_DURATION) && state.cycles.cycles.length > 0) {
      return state.cycles.cycles; // Return cached data
    }
    
    try {
      return await db.getCycles(params.userId, params.limit);
    } catch (error) {
      console.warn('Database fetch failed, using mock data:', error);
      return await mockDataService.getCycles(params.userId, params.limit);
    }
  }
);

export const fetchCyclesByDateRange = createAsyncThunk(
  'cycles/fetchCyclesByDateRange',
  async (params: { userId: string; startDate: Date; endDate: Date }) => {
    try {
      return await db.getCyclesByDateRange(params.userId, params.startDate, params.endDate);
    } catch (error) {
      console.warn('Database date range fetch failed, using mock data:', error);
      const cycles = await mockDataService.getCycles(params.userId);
      return cycles.filter(cycle => {
        const cycleDate = new Date(cycle.startDate);
        return cycleDate >= params.startDate && cycleDate <= params.endDate;
      });
    }
  }
);

export const addCycle = createAsyncThunk(
  'cycles/addCycle',
  async (cycleData: Omit<MenstrualCycle, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const cycleId = await db.addCycle(cycleData);
      const cycle = await db.cycles.where('id').equals(cycleId).first();
      return cycle!;
    } catch (error) {
      console.warn('Database add cycle failed, using mock data:', error);
      const cycleId = await mockDataService.addCycle(cycleData);
      const cycles = await mockDataService.getCycles(cycleData.userId);
      return cycles.find(c => c.id === cycleId)!;
    }
  }
);

export const updateCycle = createAsyncThunk(
  'cycles/updateCycle',
  async (params: { cycleId: string; updates: Partial<MenstrualCycle> }) => {
    try {
      await db.updateCycle(params.cycleId, params.updates);
      const cycle = await db.cycles.where('id').equals(params.cycleId).first();
      return cycle!;
    } catch (error) {
      console.warn('Database update cycle failed, using mock data:', error);
      await mockDataService.updateCycle(params.cycleId, params.updates);
      const cycles = await mockDataService.getCycles('fallback-user');
      return cycles.find(c => c.id === params.cycleId)!;
    }
  }
);

export const deleteCycle = createAsyncThunk(
  'cycles/deleteCycle',
  async (cycleId: string) => {
    try {
      await db.deleteCycle(cycleId);
    } catch (error) {
      console.warn('Database delete cycle failed, using mock data:', error);
      await mockDataService.deleteCycle(cycleId);
    }
    return cycleId;
  }
);

export const addFlowRecord = createAsyncThunk(
  'cycles/addFlowRecord',
  async (params: { cycleId: string; flowRecord: Omit<FlowRecord, 'id'> }) => {
    const cycle = await db.cycles.where('id').equals(params.cycleId).first();
    if (!cycle) throw new Error('Cycle not found');

    const newFlowRecord: FlowRecord = {
      ...params.flowRecord,
      id: crypto.randomUUID(),
    };

    const updatedFlowRecords = [...cycle.flowRecords, newFlowRecord];
    await db.updateCycle(params.cycleId, { flowRecords: updatedFlowRecords });
    
    const updatedCycle = await db.cycles.where('id').equals(params.cycleId).first();
    return updatedCycle!;
  }
);

export const updateFlowRecord = createAsyncThunk(
  'cycles/updateFlowRecord',
  async (params: { cycleId: string; flowRecordId: string; updates: Partial<FlowRecord> }) => {
    const cycle = await db.cycles.where('id').equals(params.cycleId).first();
    if (!cycle) throw new Error('Cycle not found');

    const updatedFlowRecords = cycle.flowRecords.map(record => 
      record.id === params.flowRecordId 
        ? { ...record, ...params.updates }
        : record
    );

    await db.updateCycle(params.cycleId, { flowRecords: updatedFlowRecords });
    const updatedCycle = await db.cycles.where('id').equals(params.cycleId).first();
    return updatedCycle!;
  }
);

export const deleteFlowRecord = createAsyncThunk(
  'cycles/deleteFlowRecord',
  async (params: { cycleId: string; flowRecordId: string }) => {
    const cycle = await db.cycles.where('id').equals(params.cycleId).first();
    if (!cycle) throw new Error('Cycle not found');

    const updatedFlowRecords = cycle.flowRecords.filter(
      record => record.id !== params.flowRecordId
    );

    await db.updateCycle(params.cycleId, { flowRecords: updatedFlowRecords });
    const updatedCycle = await db.cycles.where('id').equals(params.cycleId).first();
    return updatedCycle!;
  }
);

const cyclesSlice = createSlice({
  name: 'cycles',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    setSelectedCycle: (state, action: PayloadAction<string | null>) => {
      state.selectedCycleId = action.payload;
      if (action.payload) {
        state.currentCycle = state.cycles.find(cycle => cycle.id === action.payload) || null;
      } else {
        state.currentCycle = null;
      }
    },
    
    clearCycles: (state) => {
      state.cycles = [];
      state.currentCycle = null;
      state.lastFetched = null;
      state.selectedCycleId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cycles
      .addCase(fetchCycles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCycles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cycles = action.payload;
        state.lastFetched = Date.now();
        
        // Set current cycle to the most recent ongoing or recent cycle
        if (action.payload.length > 0) {
          const ongoingCycle = action.payload.find(cycle => !cycle.endDate);
          state.currentCycle = ongoingCycle || action.payload[0];
        }
      })
      .addCase(fetchCycles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch cycles';
      })
      
      // Fetch cycles by date range
      .addCase(fetchCyclesByDateRange.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCyclesByDateRange.fulfilled, (state, action) => {
        state.isLoading = false;
        // Merge with existing cycles, avoiding duplicates
        const existingIds = new Set(state.cycles.map(c => c.id));
        const newCycles = action.payload.filter(c => !existingIds.has(c.id));
        state.cycles = [...state.cycles, ...newCycles].sort(
          (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
      })
      .addCase(fetchCyclesByDateRange.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch cycles by date range';
      })
      
      // Add cycle
      .addCase(addCycle.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addCycle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cycles = [action.payload, ...state.cycles];
        state.currentCycle = action.payload;
        state.selectedCycleId = action.payload.id;
      })
      .addCase(addCycle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to add cycle';
      })
      
      // Update cycle
      .addCase(updateCycle.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCycle.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.cycles.findIndex(cycle => cycle.id === action.payload.id);
        if (index !== -1) {
          state.cycles[index] = action.payload;
        }
        if (state.currentCycle?.id === action.payload.id) {
          state.currentCycle = action.payload;
        }
      })
      .addCase(updateCycle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update cycle';
      })
      
      // Delete cycle
      .addCase(deleteCycle.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCycle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cycles = state.cycles.filter(cycle => cycle.id !== action.payload);
        if (state.currentCycle?.id === action.payload) {
          state.currentCycle = state.cycles.length > 0 ? state.cycles[0] : null;
        }
        if (state.selectedCycleId === action.payload) {
          state.selectedCycleId = null;
        }
      })
      .addCase(deleteCycle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete cycle';
      })
      
      // Flow record operations
      .addCase(addFlowRecord.fulfilled, (state, action) => {
        const index = state.cycles.findIndex(cycle => cycle.id === action.payload.id);
        if (index !== -1) {
          state.cycles[index] = action.payload;
        }
        if (state.currentCycle?.id === action.payload.id) {
          state.currentCycle = action.payload;
        }
      })
      .addCase(updateFlowRecord.fulfilled, (state, action) => {
        const index = state.cycles.findIndex(cycle => cycle.id === action.payload.id);
        if (index !== -1) {
          state.cycles[index] = action.payload;
        }
        if (state.currentCycle?.id === action.payload.id) {
          state.currentCycle = action.payload;
        }
      })
      .addCase(deleteFlowRecord.fulfilled, (state, action) => {
        const index = state.cycles.findIndex(cycle => cycle.id === action.payload.id);
        if (index !== -1) {
          state.cycles[index] = action.payload;
        }
        if (state.currentCycle?.id === action.payload.id) {
          state.currentCycle = action.payload;
        }
      });
  },
});

export const { clearError, setSelectedCycle, clearCycles } = cyclesSlice.actions;
export default cyclesSlice;