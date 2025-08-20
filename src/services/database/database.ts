// IndexedDB setup using Dexie
import Dexie, { Table } from 'dexie';
import { 
  UserProfile, 
  MenstrualCycle, 
  SymptomRecord, 
  PredictionData, 
  AnalyticsData, 
  BackupRecord 
} from '../../types/models';

export class MenstrualAppDatabase extends Dexie {
  users!: Table<UserProfile>;
  cycles!: Table<MenstrualCycle>;
  symptoms!: Table<SymptomRecord>;
  predictions!: Table<PredictionData>;
  analytics!: Table<AnalyticsData>;
  backups!: Table<BackupRecord>;

  constructor() {
    super('FemCareProDB');
    
    this.version(1).stores({
      users: 'id, createdAt, updatedAt',
      cycles: 'id, userId, startDate, endDate, [userId+startDate]',
      symptoms: 'id, cycleId, date, [cycleId+date]',
      predictions: 'userId, lastUpdated',
      analytics: 'userId, [userId+lastUpdated]',
      backups: 'id, userId, createdAt, type'
    });

    // データベースフック
    this.cycles.hook('creating', (_, obj) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.cycles.hook('updating', (modifications) => {
      modifications.updatedAt = new Date();
    });

    this.users.hook('creating', (_, obj) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.users.hook('updating', (modifications) => {
      modifications.updatedAt = new Date();
    });
  }

  // ユーザー関連メソッド
  async createUser(userData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const userWithId: UserProfile = {
        ...userData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await this.users.add(userWithId);
      return userWithId.id;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  async getUser(userId: string): Promise<UserProfile | undefined> {
    try {
      return await this.users.where('id').equals(userId).first();
    } catch (error) {
      console.error('Failed to get user:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      await this.users.where('id').equals(userId).modify(updates);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }

  // 周期関連メソッド
  async addCycle(cycle: Omit<MenstrualCycle, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const cycleWithId: MenstrualCycle = {
        ...cycle,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await this.cycles.add(cycleWithId);
      return cycleWithId.id;
    } catch (error) {
      console.error('Failed to add cycle:', error);
      throw error;
    }
  }

  async getCycles(userId: string, limit = 100): Promise<MenstrualCycle[]> {
    try {
      return await this.cycles
        .where('userId')
        .equals(userId)
        .orderBy('startDate')
        .reverse()
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error('Failed to get cycles:', error);
      throw error;
    }
  }

  async getCyclesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<MenstrualCycle[]> {
    try {
      return await this.cycles
        .where(['userId', 'startDate'])
        .between([userId, startDate], [userId, endDate])
        .toArray();
    } catch (error) {
      console.error('Failed to get cycles by date range:', error);
      throw error;
    }
  }

  async updateCycle(cycleId: string, updates: Partial<MenstrualCycle>): Promise<void> {
    try {
      await this.cycles.where('id').equals(cycleId).modify(updates);
    } catch (error) {
      console.error('Failed to update cycle:', error);
      throw error;
    }
  }

  async deleteCycle(cycleId: string): Promise<void> {
    try {
      await this.cycles.where('id').equals(cycleId).delete();
    } catch (error) {
      console.error('Failed to delete cycle:', error);
      throw error;
    }
  }

  // 症状関連メソッド
  async addSymptom(symptom: Omit<SymptomRecord, 'id'>): Promise<string> {
    try {
      const symptomWithId: SymptomRecord = {
        ...symptom,
        id: crypto.randomUUID(),
      };
      await this.symptoms.add(symptomWithId);
      return symptomWithId.id;
    } catch (error) {
      console.error('Failed to add symptom:', error);
      throw error;
    }
  }

  async getSymptoms(cycleId: string): Promise<SymptomRecord[]> {
    try {
      return await this.symptoms
        .where('cycleId')
        .equals(cycleId)
        .orderBy('date')
        .toArray();
    } catch (error) {
      console.error('Failed to get symptoms:', error);
      throw error;
    }
  }

  async getSymptomsByDateRange(cycleId: string, startDate: Date, endDate: Date): Promise<SymptomRecord[]> {
    try {
      return await this.symptoms
        .where(['cycleId', 'date'])
        .between([cycleId, startDate], [cycleId, endDate])
        .toArray();
    } catch (error) {
      console.error('Failed to get symptoms by date range:', error);
      throw error;
    }
  }

  async updateSymptom(symptomId: string, updates: Partial<SymptomRecord>): Promise<void> {
    try {
      await this.symptoms.where('id').equals(symptomId).modify(updates);
    } catch (error) {
      console.error('Failed to update symptom:', error);
      throw error;
    }
  }

  async deleteSymptom(symptomId: string): Promise<void> {
    try {
      await this.symptoms.where('id').equals(symptomId).delete();
    } catch (error) {
      console.error('Failed to delete symptom:', error);
      throw error;
    }
  }

  // 予測データ関連メソッド
  async savePrediction(prediction: PredictionData): Promise<void> {
    try {
      await this.predictions.put(prediction);
    } catch (error) {
      console.error('Failed to save prediction:', error);
      throw error;
    }
  }

  async getPrediction(userId: string): Promise<PredictionData | undefined> {
    try {
      return await this.predictions.where('userId').equals(userId).first();
    } catch (error) {
      console.error('Failed to get prediction:', error);
      throw error;
    }
  }

  // 分析データ関連メソッド
  async saveAnalytics(analytics: AnalyticsData): Promise<void> {
    try {
      await this.analytics.put(analytics);
    } catch (error) {
      console.error('Failed to save analytics:', error);
      throw error;
    }
  }

  async getAnalytics(userId: string): Promise<AnalyticsData | undefined> {
    try {
      return await this.analytics.where('userId').equals(userId).first();
    } catch (error) {
      console.error('Failed to get analytics:', error);
      throw error;
    }
  }

  // バックアップ関連メソッド
  async createBackup(userId: string, type: 'manual' | 'automatic' | 'export'): Promise<string> {
    try {
      const cycles = await this.getCycles(userId);
      const symptoms = await Promise.all(
        cycles.map(cycle => this.getSymptoms(cycle.id))
      ).then(results => results.flat());
      
      const user = await this.getUser(userId);
      if (!user) throw new Error('User not found');

      const backupData = {
        cycles,
        symptoms,
        settings: user.settings,
      };

      const backup: Omit<BackupRecord, 'id'> = {
        userId,
        createdAt: new Date(),
        type,
        data: backupData,
        size: JSON.stringify(backupData).length,
      };

      const backupWithId = {
        ...backup,
        id: crypto.randomUUID(),
      };
      
      await this.backups.add(backupWithId);
      return backupWithId.id;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  }

  async getBackups(userId: string, limit = 10): Promise<BackupRecord[]> {
    try {
      return await this.backups
        .where('userId')
        .equals(userId)
        .orderBy('createdAt')
        .reverse()
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error('Failed to get backups:', error);
      throw error;
    }
  }

  async deleteBackup(backupId: string): Promise<void> {
    try {
      await this.backups.where('id').equals(backupId).delete();
    } catch (error) {
      console.error('Failed to delete backup:', error);
      throw error;
    }
  }

  // データ全削除（アカウント削除時用）
  async deleteAllUserData(userId: string): Promise<void> {
    try {
      await this.transaction('rw', this.users, this.cycles, this.symptoms, this.predictions, this.analytics, this.backups, async () => {
        await this.users.where('id').equals(userId).delete();
        await this.cycles.where('userId').equals(userId).delete();
        
        // 症状データは周期に紐づくので、周期削除で自動的に関連データも削除される必要がある
        const cycles = await this.cycles.where('userId').equals(userId).toArray();
        for (const cycle of cycles) {
          await this.symptoms.where('cycleId').equals(cycle.id).delete();
        }
        
        await this.predictions.where('userId').equals(userId).delete();
        await this.analytics.where('userId').equals(userId).delete();
        await this.backups.where('userId').equals(userId).delete();
      });
    } catch (error) {
      console.error('Failed to delete all user data:', error);
      throw error;
    }
  }

  // データベース統計情報
  async getDatabaseStats(userId: string) {
    try {
      const [cycleCount, symptomCount, backupCount] = await Promise.all([
        this.cycles.where('userId').equals(userId).count(),
        this.cycles.where('userId').equals(userId).toArray()
          .then(cycles => Promise.all(cycles.map(c => this.symptoms.where('cycleId').equals(c.id).count())))
          .then(counts => counts.reduce((sum, count) => sum + count, 0)),
        this.backups.where('userId').equals(userId).count()
      ]);

      return {
        cycles: cycleCount,
        symptoms: symptomCount,
        backups: backupCount,
        totalRecords: cycleCount + symptomCount,
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      throw error;
    }
  }
}

// データベースインスタンス
export const db = new MenstrualAppDatabase();