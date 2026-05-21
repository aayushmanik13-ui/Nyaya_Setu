import Dexie, { type Table } from 'dexie';
import type { DecodedResult } from '@shared/routes';

export interface Document {
  id?: number;
  title: string;
  createdAt: Date;
  fileBlob: Blob; // Stored locally for privacy
  previewUrl: string; // URL.createObjectURL(fileBlob)
  language: string;
  decodedResult: DecodedResult;
}

class NyayaDatabase extends Dexie {
  documents!: Table<Document>;

  constructor() {
    super('NyayaSetuDB');
    this.version(1).stores({
      documents: '++id, createdAt'
    });
  }

  // Enforce 3 document limit for privacy
  async addDocument(doc: Omit<Document, 'id'>) {
    return this.transaction('rw', this.documents, async () => {
      const count = await this.documents.count();
      if (count >= 3) {
        // Find oldest document
        const oldest = await this.documents.orderBy('createdAt').first();
        if (oldest?.id) {
          await this.documents.delete(oldest.id);
        }
      }
      return this.documents.add(doc);
    });
  }
}

export const db = new NyayaDatabase();
