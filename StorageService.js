"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
class StorageService {
    constructor() {
        this.storageKey = 'taskmaster-tasks';
    }
    saveTasks(tasks) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(tasks));
        }
        catch (error) {
            console.error('Error saving tasks to localStorage:', error);
            throw new Error('Failed to save tasks. Storage might be full or unavailable.');
        }
    }
    loadTasks() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            return savedData ? JSON.parse(savedData) : [];
        }
        catch (error) {
            console.error('Error loading tasks from localStorage:', error);
            return [];
        }
    }
    clearTasks() {
        try {
            localStorage.removeItem(this.storageKey);
        }
        catch (error) {
            console.error('Error clearing tasks from localStorage:', error);
        }
    }
}
exports.StorageService = StorageService;
//# sourceMappingURL=StorageService.js.map