// This file mainly serves as a central export for storage.
// Specific feature storage (auth, chat) is handled in their respective directories.
import { users, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  // Add any general purpose storage methods here if needed
}

export class MemStorage implements IStorage {
  constructor() {}
}

export const storage = new MemStorage();
