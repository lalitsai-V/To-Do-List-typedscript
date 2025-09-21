import { Task, Priority, TaskCreateDto } from './models/Task';
import { StorageService } from './service/StorageService';
import { NotificationService, NotificationType } from './service/NotificationService';
import { DateUtils } from './utils/DateUtils';
import { PdfGenerator } from './utils/PdfGenerator';

class TaskMasterApp {
  private tasks: Task[] = [];
  private storageService: StorageService;
  private notificationService: NotificationService;
  private pdfGenerator?: PdfGenerator;

  // DOM elements
  private taskInput!: HTMLInputElement;
  private prioritySelect!: HTMLSelectElement;
  private descriptionInput!: HTMLTextAreaElement;
  private deadlineInput!: HTMLInputElement;
  private addTaskBtn!: HTMLButtonElement;
  private downloadPdfBtn!: HTMLButtonElement;
  private todoTasksContainer!: HTMLElement;
  private completedTasksContainer!: HTMLElement;
  private todoCountElement!: HTMLElement;
  private completedCountElement!: HTMLElement;
  
  constructor() {
    this.storageService = new StorageService();
    this.notificationService = new NotificationService('notification');
    
    try {
      this.pdfGenerator = new PdfGenerator();
    } catch (error) {
      console.warn('PDF generation will be unavailable:', error);
    }
    
    this.initialize();
  }
  
  private initialize(): void {
    // Cache DOM elements
    this.cacheDomElements();
    
    // Load tasks from storage
    this.loadTasks();
    
    // Bind event handlers
    this.bindEvents();
    
    // Initial render
    this.renderTasks();
  }
  
  private cacheDomElements(): void {
    try {
      this.taskInput = this.getElement<HTMLInputElement>('taskInput');
      this.prioritySelect = this.getElement<HTMLSelectElement>('prioritySelect');
      this.descriptionInput = this.getElement<HTMLTextAreaElement>('descriptionInput');
      this.deadlineInput = this.getElement<HTMLInputElement>('deadlineInput');
      this.addTaskBtn = this.getElement<HTMLButtonElement>('addTaskBtn');
      this.downloadPdfBtn = this.getElement<HTMLButtonElement>('downloadPdfBtn');
      this.todoTasksContainer = this.getElement<HTMLElement>('todoTasks');
      this.completedTasksContainer = this.getElement<HTMLElement>('completedTasks');
      this.todoCountElement = this.getElement<HTMLElement>('todoCount');
      this.completedCountElement = this.getElement<HTMLElement>('completedCount');
    } catch (error) {
      console.error('Error initializing app - DOM elements not found:', error);
      document.body.innerHTML = '<div class="error-screen">Application failed to initialize. Please reload the page.</div>';
    }
  }
  
  private getElement<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id) as T;
    if (!element) {
      throw new Error(`Element with id "${id}" not found`);
    }
    return element;
  }
  
  private bindEvents(): void {
    this.addTaskBtn.addEventListener('click', () => this.handleAddTask());
    
    this.taskInput.addEventListener('keypress', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleAddTask();
      }
    });
    
    this.downloadPdfBtn.addEventListener('click', () => this.handleDownloadPdf());
  }
  
  private loadTasks(): void {
    try {
      this.tasks = this.storageService.loadTasks();
    } catch (error) {
      console.error('Failed to load tasks:', error);
      this.notificationService.show(
        'Failed to load your tasks. Starting fresh.',
        NotificationType.ERROR
      );
      this.tasks = [];
    }
  }
  
  private saveTasks(): void {
    try {
      this.storageService.saveTasks(this.tasks);
    } catch (error) {
      console.error('Failed to save tasks:', error);
      this.notificationService.show(
        'Failed to save your tasks. Storage might be full.',
        NotificationType.ERROR
      );
    }
  }
  
  private handleAddTask(): void {
    try {
      const title = this.taskInput.value.trim();
      
      if (!title) {
        this.notificationService.show('Please enter a task title!', NotificationType.ERROR);
        this.taskInput.focus();
        return;
      }
      
      let deadline = this.deadlineInput.value;
      if (!deadline) {
        deadline = DateUtils.getTomorrowDate();
      }
      
      const priority = this.prioritySelect.value as Priority;
      const description = this.descriptionInput.value.trim();
      
      const newTask: Task = {
        id: this.generateId(),
        title,
        priority,
        description,
        deadline,
        completed: false,
        createdAt: new Date().toISOString()
      };
      
      // Add task to the beginning of the array
      this.tasks.unshift(newTask);
      
      // Save and render
      this.saveTasks();
      this.renderTasks();
      
      // Clear inputs
      this.clearInputFields();
      
      // Show success notification
      this.notificationService.show('Task added successfully!', NotificationType.SUCCESS);
    } catch (error) {
      console.error('Error adding task:', error);
      this.notificationService.show('Failed to add task. Please try again.', NotificationType.ERROR);
    }
  }
  
  private clearInputFields(): void {
    this.taskInput.value = '';
    this.prioritySelect.value = Priority.MEDIUM;
    this.descriptionInput.value = '';
    this.deadlineInput.value = '';
    this.taskInput.focus();
  }
  
  private handleToggleComplete(taskId: string): void {
    try {
      const taskIndex = this.tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        this.tasks[taskIndex].completed = !this.tasks[taskIndex].completed;
        this.saveTasks();
        this.renderTasks();
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      this.notificationService.show('Failed to update task status.', NotificationType.ERROR);
    }
  }
  
  private handleDeleteTask(taskId: string): void {
    try {
      this.tasks = this.tasks.filter(t => t.id !== taskId);
      this.saveTasks();
      this.renderTasks();
      this.notificationService.show('Task deleted!', NotificationType.SUCCESS);
    } catch (error) {
      console.error('Error deleting task:', error);
      this.notificationService.show('Failed to delete task.', NotificationType.ERROR);
    }
  }
  
  private handleEditTask(taskId: string): void {
    try {
      const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
      if (!taskElement) return;
      
      const titleElement = taskElement.querySelector('.task-title');
      if (!titleElement) return;
      
      const currentTitle = titleElement.textContent || '';
      
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'task-title-input';
      input.value = currentTitle;
      
      const buttonContainer = document.createElement('div');
      buttonContainer.style.display = 'flex';
      buttonContainer.style.gap = '5px';
      buttonContainer.style.marginTop = '5px';
      
      const saveBtn = document.createElement('button');
      saveBtn.className = 'task-btn save-btn';
      saveBtn.innerHTML = '<i class="fas fa-save"></i> Save';
      
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'task-btn cancel-btn';
      cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
      
      buttonContainer.appendChild(saveBtn);
      buttonContainer.appendChild(cancelBtn);
      
      (titleElement as HTMLElement).style.display = 'none';
      titleElement.parentNode!.parentNode!.insertBefore(buttonContainer, titleElement.parentNode!.nextSibling);
      titleElement.parentNode!.insertBefore(input, titleElement);
      
      input.focus();
      input.select();
      
      const saveHandler = () => {
        const newTitle = input.value.trim();
        if (newTitle) {
          const taskIndex = this.tasks.findIndex(t => t.id === taskId);
          if (taskIndex !== -1) {
            this.tasks[taskIndex].title = newTitle;
            this.saveTasks();
            this.renderTasks();
            this.notificationService.show('Task updated!', NotificationType.SUCCESS);
          }
        } else {
          this.notificationService.show('Task title cannot be empty!', NotificationType.ERROR);
        }
      };
      
      const cancelHandler = () => this.renderTasks();
      
      saveBtn.addEventListener('click', saveHandler);
      cancelBtn.addEventListener('click', cancelHandler);
      
      input.addEventListener('keypress', (e: KeyboardEvent) => {
        if (e.key === 'Enter') saveHandler();
      });
      
      input.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape') cancelHandler();
      });
    } catch (error) {
      console.error('Error setting up task editing:', error);
      this.notificationService.show('Failed to edit task.', NotificationType.ERROR);
    }
  }
  
  private handleToggleDescription(taskId: string): void {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (!taskElement) return;
    
    const descriptionElement = taskElement.querySelector('.task-description');
    if (descriptionElement) {
      descriptionElement.classList.toggle('show');
    }
  }
  
  private handleDownloadPdf(): void {
    try {
      if (!this.pdfGenerator) {
        this.notificationService.show('PDF generator not available. Please check console for details.', NotificationType.ERROR);
        return;
      }
      
      if (this.tasks.length === 0) {
        this.notificationService.show('No tasks to export!', NotificationType.INFO);
        return;
      }
      
      this.pdfGenerator.generateTasksPdf(this.tasks);
      this.notificationService.show('PDF downloaded successfully!', NotificationType.SUCCESS);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      this.notificationService.show('Failed to generate PDF. See console for details.', NotificationType.ERROR);
    }
  }
  
  private renderTasks(): void {
    try {
      const todoTasks = this.tasks.filter(t => !t.completed);
      const completedTasks = this.tasks.filter(t => t.completed);
      
      this.renderTaskList(this.todoTasksContainer, todoTasks, 'No tasks to complete. Great job!');
      this.renderTaskList(this.completedTasksContainer, completedTasks, 'No completed tasks yet.');
      
      this.todoCountElement.textContent = todoTasks.length.toString();
      this.completedCountElement.textContent = completedTasks.length.toString();
    } catch (error) {
      console.error('Error rendering tasks:', error);
      this.notificationService.show('Failed to render tasks. Please reload the page.', NotificationType.ERROR);
    }
  }
  
  private renderTaskList(container: HTMLElement, tasks: Task[], emptyMessage: string): void {
    container.innerHTML = '';
    
    if (tasks.length === 0) {
      const emptyElement = document.createElement('p');
      emptyElement.className = 'empty-list-msg';
      emptyElement.textContent = emptyMessage;
      container.appendChild(emptyElement);
      return;
    }
    
    tasks.forEach(task => {
      container.appendChild(this.createTaskElement(task));
    });
  }
  
  private createTaskElement(task: Task): HTMLElement {
    const taskDiv = document.createElement('div');
    taskDiv.className = `task-item ${task.priority}-priority ${task.completed ? 'completed' : ''}`;
    
    // Add deadline-passed class if deadline has passed
    if (!task.completed && DateUtils.isDatePassed(task.deadline)) {
      taskDiv.classList.add('deadline-passed');
    }
    
    taskDiv.dataset.taskId = task.id;
    
    const taskHeader = document.createElement('div');
    taskHeader.className = 'task-header';
    
    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.title;
    
    const priority = document.createElement('span');
    priority.className = `task-priority priority-${task.priority}`;
    priority.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
    
    const deadline = document.createElement('span');
    deadline.className = 'task-deadline';
    deadline.textContent = DateUtils.formatDateForDisplay(task.deadline);
    
    taskHeader.appendChild(title);
    taskHeader.appendChild(priority);
    taskHeader.appendChild(deadline);
    taskDiv.appendChild(taskHeader);
    
    if (task.description) {
      const description = document.createElement('div');
      description.className = 'task-description';
      description.textContent = task.description;
      taskDiv.appendChild(description);
    }
    
    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';
    
    // Complete/Undo button
    const completeBtn = document.createElement('button');
    completeBtn.className = 'task-btn complete-btn';
    completeBtn.innerHTML = task.completed 
      ? '<i class="fas fa-undo"></i> Undo' 
      : '<i class="fas fa-check"></i> Complete';
    completeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleToggleComplete(task.id);
    });
    
    // Edit button (only for uncompleted tasks)
    if (!task.completed) {
      const editBtn = document.createElement('button');
      editBtn.className = 'task-btn edit-btn';
      editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleEditTask(task.id);
      });
      taskActions.appendChild(editBtn);
    }
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-btn delete-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleDeleteTask(task.id);
    });
    
    taskActions.appendChild(completeBtn);
    taskActions.appendChild(deleteBtn);
    taskDiv.appendChild(taskActions);
    
    // Toggle description on click (if description exists)
    if (task.description) {
      taskDiv.addEventListener('click', (e) => {
        if (!e.target || 
            !(e.target as Element).closest('.task-actions') && 
            !(e.target as Element).closest('.task-title-input')) {
          this.handleToggleDescription(task.id);
        }
      });
    }
    
    return taskDiv;
  }
  
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new TaskMasterApp();
});
