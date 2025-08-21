// Mock data service for fallback when database is unavailable
import { MenstrualCycle, SymptomRecord, PredictionData, AnalyticsData } from '../types/models';

export class MockDataService {
  private static instance: MockDataService;
  private mockCycles: MenstrualCycle[] = [];
  private mockSymptoms: SymptomRecord[] = [];
  private mockPredictions: PredictionData | null = null;
  private mockAnalytics: AnalyticsData | null = null;

  static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  private constructor() {
    this.generateMockData();
  }

  private generateMockData() {
    const now = new Date();
    const userId = 'fallback-user';

    // Generate 6 months of mock cycle data
    this.mockCycles = [];
    for (let i = 0; i < 6; i++) {
      const cycleStart = new Date(now);
      cycleStart.setDate(now.getDate() - (i * 28) - (Math.random() * 4 - 2)); // Add some variation
      
      const cycleEnd = new Date(cycleStart);
      cycleEnd.setDate(cycleStart.getDate() + (4 + Math.floor(Math.random() * 2))); // 4-6 days

      const cycle: MenstrualCycle = {
        id: `mock-cycle-${i}`,
        userId,
        startDate: cycleStart,
        endDate: cycleEnd,
        actualLength: 28 + Math.floor(Math.random() * 4) - 2, // 26-30 days
        predictedLength: 28,
        flowRecords: [],
        symptoms: [],
        ovulation: null,
        notes: i === 0 ? '今回の周期は少し重めでした' : '',
        isConfirmed: true,
        createdAt: new Date(cycleStart.getTime() - 86400000),
        updatedAt: new Date(cycleStart.getTime() - 86400000),
      };

      // Generate flow records for this cycle
      for (let day = 0; day < 5; day++) {
        const flowDate = new Date(cycleStart);
        flowDate.setDate(cycleStart.getDate() + day);

        const flowRecord = {
          id: `mock-flow-${i}-${day}`,
          date: flowDate,
          flowLevel: day === 0 ? 'light' : day === 1 || day === 2 ? 'medium' : day === 3 ? 'light' : 'spotting',
          flowColor: 'bright_red',
          clots: day === 1 || day === 2,
          products: [],
          leakage: false,
          pain: {
            severity: Math.floor(Math.random() * 4) + 1,
            location: ['lower_abdomen'],
            type: ['cramping'],
            duration: 'hours',
            medication: [],
          },
          notes: day === 0 ? '生理開始' : '',
        } as any;

        cycle.flowRecords.push(flowRecord);
      }

      // Generate ovulation record
      if (i < 3) { // Only for recent cycles
        const ovulationDate = new Date(cycleStart);
        ovulationDate.setDate(cycleStart.getDate() + 14);
        
        cycle.ovulation = {
          id: `mock-ovulation-${i}`,
          date: ovulationDate,
          method: 'symptom_tracking',
          confidence: 0.7 + Math.random() * 0.2,
          signs: {
            cervicalMucus: 'egg_white',
            cervicalPosition: 'high',
            basalBodyTemp: 36.5 + Math.random() * 0.5,
            ovulationPain: Math.random() > 0.5,
            mood: Math.floor(Math.random() * 5) + 1,
            libido: Math.floor(Math.random() * 5) + 1,
          },
          notes: 'clear signs observed',
        };
      }

      // Generate symptoms for this cycle
      for (let day = 0; day < 5; day++) {
        const symptomDate = new Date(cycleStart);
        symptomDate.setDate(cycleStart.getDate() + day);

        if (Math.random() > 0.3) { // 70% chance of symptoms each day
          const symptom: SymptomRecord = {
            id: `mock-symptom-${i}-${day}`,
            cycleId: cycle.id,
            date: symptomDate,
            symptoms: {
              pain: {
                cramps: Math.floor(Math.random() * 5) + 1,
                headache: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0,
                backPain: Math.random() > 0.8 ? Math.floor(Math.random() * 3) + 1 : 0,
              },
              mood: {
                irritability: Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 1 : 0,
                anxiety: Math.random() > 0.8 ? Math.floor(Math.random() * 3) + 1 : 0,
                depression: Math.random() > 0.9 ? Math.floor(Math.random() * 2) + 1 : 0,
                overall: Math.floor(Math.random() * 5) + 1,
              },
              physical: {
                fatigue: Math.random() > 0.5 ? Math.floor(Math.random() * 4) + 1 : 0,
                bloating: Math.random() > 0.6 ? Math.floor(Math.random() * 3) + 1 : 0,
                nausea: Math.random() > 0.9 ? Math.floor(Math.random() * 2) + 1 : 0,
              },
              energy: {
                overall: Math.floor(Math.random() * 5) + 1,
              },
            },
            flow: day < 3 ? ['light', 'medium', 'heavy'][Math.floor(Math.random() * 3)] as any : 'none',
            notes: day === 0 ? '生理開始' : '',
          };

          cycle.symptoms.push(symptom);
          this.mockSymptoms.push(symptom);
        }
      }

      this.mockCycles.push(cycle);
    }

    // Generate predictions
    const nextPeriodDate = new Date(now);
    nextPeriodDate.setDate(now.getDate() + (28 - (now.getDate() % 28)));

    const fertileStart = new Date(nextPeriodDate);
    fertileStart.setDate(nextPeriodDate.getDate() - 14);
    
    const fertileEnd = new Date(fertileStart);
    fertileEnd.setDate(fertileStart.getDate() + 6);

    const ovulationDate = new Date(fertileStart);
    ovulationDate.setDate(fertileStart.getDate() + 3);

    this.mockPredictions = {
      userId,
      nextPeriodDate,
      nextPeriodConfidence: 0.85,
      averageCycleLength: 28,
      cycleVariability: 0.12,
      fertileWindowStart: fertileStart,
      fertileWindowEnd: fertileEnd,
      ovulationDate,
      ovulationConfidence: 0.78,
      lastUpdated: now,
    };

    // Generate analytics
    this.mockAnalytics = {
      userId,
      cycleStats: {
        averageLength: 28,
        shortestCycle: 26,
        longestCycle: 30,
        regularity: 0.88,
        totalCycles: this.mockCycles.length,
      },
      symptomPatterns: {
        mostCommon: ['cramps', 'fatigue', 'mood_swings'],
        severity: {
          mild: 0.3,
          moderate: 0.5,
          severe: 0.2,
        },
        timing: {
          prePeriod: 0.6,
          duringPeriod: 0.9,
          postPeriod: 0.2,
        },
      },
      insights: [
        'あなたの周期は非常に規則的です',
        '痛みのレベルは平均的です',
        '気分の変化は生理前に多く見られます',
      ],
      lastGenerated: now,
      lastUpdated: now,
    };

    console.log('✓ Mock data generated:', {
      cycles: this.mockCycles.length,
      symptoms: this.mockSymptoms.length,
      hasPredictions: !!this.mockPredictions,
      hasAnalytics: !!this.mockAnalytics,
    });
  }

  // Cycle methods
  getCycles(userId: string, limit = 100): Promise<MenstrualCycle[]> {
    return Promise.resolve(this.mockCycles.slice(0, limit));
  }

  addCycle(cycle: Omit<MenstrualCycle, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const newCycle: MenstrualCycle = {
      ...cycle,
      id: `mock-cycle-new-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockCycles.unshift(newCycle);
    return Promise.resolve(newCycle.id);
  }

  updateCycle(cycleId: string, updates: Partial<MenstrualCycle>): Promise<void> {
    const index = this.mockCycles.findIndex(c => c.id === cycleId);
    if (index !== -1) {
      this.mockCycles[index] = {
        ...this.mockCycles[index],
        ...updates,
        updatedAt: new Date(),
      };
    }
    return Promise.resolve();
  }

  deleteCycle(cycleId: string): Promise<void> {
    this.mockCycles = this.mockCycles.filter(c => c.id !== cycleId);
    this.mockSymptoms = this.mockSymptoms.filter(s => s.cycleId !== cycleId);
    return Promise.resolve();
  }

  // Symptom methods
  getSymptoms(cycleId: string): Promise<SymptomRecord[]> {
    return Promise.resolve(this.mockSymptoms.filter(s => s.cycleId === cycleId));
  }

  addSymptom(symptom: Omit<SymptomRecord, 'id'>): Promise<string> {
    const newSymptom: SymptomRecord = {
      ...symptom,
      id: `mock-symptom-new-${Date.now()}`,
    };
    this.mockSymptoms.push(newSymptom);
    return Promise.resolve(newSymptom.id);
  }

  updateSymptom(symptomId: string, updates: Partial<SymptomRecord>): Promise<void> {
    const index = this.mockSymptoms.findIndex(s => s.id === symptomId);
    if (index !== -1) {
      this.mockSymptoms[index] = { ...this.mockSymptoms[index], ...updates };
    }
    return Promise.resolve();
  }

  deleteSymptom(symptomId: string): Promise<void> {
    this.mockSymptoms = this.mockSymptoms.filter(s => s.id !== symptomId);
    return Promise.resolve();
  }

  // Prediction methods
  getPrediction(userId: string): Promise<PredictionData | undefined> {
    return Promise.resolve(this.mockPredictions || undefined);
  }

  savePrediction(prediction: PredictionData): Promise<void> {
    this.mockPredictions = prediction;
    return Promise.resolve();
  }

  // Analytics methods
  getAnalytics(userId: string): Promise<AnalyticsData | undefined> {
    return Promise.resolve(this.mockAnalytics || undefined);
  }

  saveAnalytics(analytics: AnalyticsData): Promise<void> {
    this.mockAnalytics = analytics;
    return Promise.resolve();
  }

  // Check if we're in fallback mode
  isFallbackMode(): boolean {
    return true;
  }

  // Get current cycle
  getCurrentCycle(userId: string): MenstrualCycle | undefined {
    const now = new Date();
    return this.mockCycles.find(cycle => {
      const cycleStart = new Date(cycle.startDate);
      const daysSinceStart = Math.floor((now.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceStart >= 0 && daysSinceStart <= 35; // Within reasonable cycle range
    });
  }
}

export const mockDataService = MockDataService.getInstance();