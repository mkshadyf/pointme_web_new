import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { supabase } from '../lib/supabase';

interface SyncDB extends DBSchema {
  offline_mutations: {
    key: string;
    value: {
      id: string;
      table: string;
      type: 'INSERT' | 'UPDATE' | 'DELETE';
      data: any;
      timestamp: number;
      priority: 'high' | 'medium' | 'low';
      retries: number;
    };
    indexes: { 'by-timestamp': number; 'by-priority': string };
  };
  sync_logs: {
    key: string;
    value: {
      id: string;
      mutation_id: string;
      status: 'success' | 'error';
      error?: string;
      timestamp: number;
    };
  };
}

export class SyncService {
  private db: IDBPDatabase<SyncDB>;
  private maxRetries = 3;
  private syncInProgress = false;

  async init() {
    this.db = await openDB<SyncDB>('pointme-sync', 1, {
      upgrade(db) {
        const store = db.createObjectStore('offline_mutations', {
          keyPath: 'id',
        });
        store.createIndex('by-timestamp', 'timestamp');
        store.createIndex('by-priority', 'priority');

        db.createObjectStore('sync_logs', {
          keyPath: 'id',
          autoIncrement: true,
        });
      },
    });

    // Register sync event
    if ('serviceWorker' in navigator && 'sync' in registration) {
      const registration = await navigator.serviceWorker.ready;
      registration.sync.register('sync-data');
    }

    // Start sync when online
    window.addEventListener('online', () => this.syncOfflineData());
  }

  async queueMutation(
    table: string,
    type: 'INSERT' | 'UPDATE' | 'DELETE',
    data: any,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) {
    const mutation = {
      id: crypto.randomUUID(),
      table,
      type,
      data,
      timestamp: Date.now(),
      priority,
      retries: 0,
    };

    await this.db.add('offline_mutations', mutation);

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.syncOfflineData();
    }
  }

  async syncOfflineData() {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      const tx = this.db.transaction('offline_mutations', 'readwrite');
      const store = tx.objectStore('offline_mutations');
      const index = store.index('by-priority');

      // Process mutations in priority order
      for (const priority of ['high', 'medium', 'low']) {
        const mutations = await index.getAll(priority);

        for (const mutation of mutations) {
          try {
            if (mutation.retries >= this.maxRetries) {
              await this.logSync(mutation.id, 'error', 'Max retries exceeded');
              await store.delete(mutation.id);
              continue;
            }

            const result = await this.processMutation(mutation);
            await this.logSync(mutation.id, 'success');
            await store.delete(mutation.id);
          } catch (error) {
            mutation.retries++;
            await store.put(mutation);
            await this.logSync(mutation.id, 'error', error.message);
          }
        }
      }

      await tx.done;
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processMutation(mutation: any) {
    switch (mutation.type) {
      case 'INSERT':
        return await supabase.from(mutation.table).insert(mutation.data);
      case 'UPDATE':
        return await supabase
          .from(mutation.table)
          .update(mutation.data)
          .eq('id', mutation.data.id);
      case 'DELETE':
        return await supabase
          .from(mutation.table)
          .delete()
          .eq('id', mutation.data.id);
      default:
        throw new Error(`Unknown mutation type: ${mutation.type}`);
    }
  }

  private async logSync(
    mutationId: string,
    status: 'success' | 'error',
    error?: string
  ) {
    await this.db.add('sync_logs', {
      mutation_id: mutationId,
      status,
      error,
      timestamp: Date.now(),
    });
  }

  async getSyncLogs() {
    return this.db.getAll('sync_logs');
  }

  async clearSyncLogs() {
    const tx = this.db.transaction('sync_logs', 'readwrite');
    await tx.objectStore('sync_logs').clear();
    await tx.done;
  }
}

export const syncService = new SyncService(); 