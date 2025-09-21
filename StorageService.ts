import { Task } from '../models/Task';

export class StorageService {
  private readonly storageKey: string = 'taskmaster-tasks';

  public saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
      throw new Error('Failed to save tasks. Storage might be full or unavailable.');
    }
  }

  public loadTasks(): Task[] {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      return savedData ? JSON.parse(savedData) : [];
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      return [];
    }
  }

  public clearTasks(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error clearing tasks from localStorage:', error);
    }
  }
}
