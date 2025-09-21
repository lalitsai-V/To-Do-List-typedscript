class TodoApp {
    constructor() {
        this.tasks = [];
        this.init();
    }

    init() {
        this.cacheDom();
        this.bindEvents();
        this.loadFromLocalStorage();
    }

    cacheDom() {
        this.taskInput = document.getElementById('taskInput');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.descriptionInput = document.getElementById('descriptionInput');
        this.deadlineInput = document.getElementById('deadlineInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.downloadPdfBtn = document.getElementById('downloadPdfBtn');
        this.todoTasks = document.getElementById('todoTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.todoCount = document.getElementById('todoCount');
        this.completedCount = document.getElementById('completedCount');
        this.notification = document.getElementById('notification');
        this.clearAllBtn = document.getElementById('clearAllBtn');
    }

    bindEvents() {
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                this.addTask();
            }
        });
        this.downloadPdfBtn.addEventListener('click', () => this.downloadTasksAsPdf());
        if (this.clearAllBtn) {
            this.clearAllBtn.addEventListener('click', () => this.clearAllTasks());
        }
    }

    addTask() {
        const title = this.taskInput.value.trim();
        if (!title) {
            this.showNotification('Please enter a task title!', 'error');
            this.taskInput.focus();
            return;
        }

        let deadline = this.deadlineInput.value;
        if (!deadline) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            deadline = tomorrow.toISOString().split('T')[0];
        }

        this.tasks.unshift({
            id: this.generateId(),
            title,
            priority: this.prioritySelect.value,
            description: this.descriptionInput.value.trim(),
            deadline,
            completed: false,
            createdAt: new Date().toISOString()
        });

        this.saveAndRender();
        this.clearInputs();
        this.showNotification('Task added successfully!', 'success');
    }

    clearInputs() {
        this.taskInput.value = '';
        this.descriptionInput.value = '';
        this.prioritySelect.value = 'medium';
        this.deadlineInput.value = '';
    }

    toggleComplete(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveAndRender();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveAndRender();
        this.showNotification('Task deleted!', 'success');
    }

    editTask(id) {
        const taskElement = document.querySelector(`[data-task-id="${id}"]`);
        const titleElement = taskElement.querySelector('.task-title');
        const currentTitle = titleElement.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'task-title-input';
        input.value = currentTitle;
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'task-btn save-btn';
        saveBtn.textContent = 'Save';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'task-btn cancel-btn';
        cancelBtn.textContent = 'Cancel';
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '5px';
        buttonContainer.style.marginTop = '5px';
        buttonContainer.appendChild(saveBtn);
        buttonContainer.appendChild(cancelBtn);
        
        titleElement.style.display = 'none';
        titleElement.parentNode.parentNode.insertBefore(buttonContainer, titleElement.parentNode.nextSibling);
        titleElement.parentNode.insertBefore(input, titleElement);
        
        input.focus();
        input.select();
        
        const save = () => {
            const newTitle = input.value.trim();
            if (newTitle) {
                const task = this.tasks.find(t => t.id === id);
                task.title = newTitle;
                this.saveAndRender();
                this.showNotification('Task updated!', 'success');
            } else {
                this.showNotification('Task title cannot be empty!', 'error');
            }
        };
        
        const cancel = () => this.render();
        
        saveBtn.addEventListener('click', save);
        cancelBtn.addEventListener('click', cancel);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') cancel();
        });
    }

    toggleDescription(id) {
        const taskElement = document.querySelector(`[data-task-id="${id}"]`);
        const descriptionElement = taskElement.querySelector('.task-description');
        if (descriptionElement) {
            descriptionElement.classList.toggle('show');
        }
    }

    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item ${task.priority}-priority ${task.completed ? 'completed' : ''}`;
        taskDiv.dataset.taskId = task.id;

        const completedButtons = `
            <button class="task-btn complete-btn"><i class="fas fa-undo"></i> Undo</button>
        `;
        const todoButtons = `
            <button class="task-btn complete-btn"><i class="fas fa-check"></i> Complete</button>
            <button class="task-btn edit-btn"><i class="fas fa-edit"></i> Edit</button>
        `;

        taskDiv.innerHTML = `
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <span class="task-priority priority-${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                <span class="task-deadline">Deadline: ${task.deadline}</span>
            </div>
            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            <div class="task-actions">
                ${task.completed ? completedButtons : todoButtons}
                <button class="task-btn delete-btn"><i class="fas fa-trash"></i> Delete</button>
            </div>
        `;

        taskDiv.querySelector('.delete-btn').addEventListener('click', e => {
            e.stopPropagation();
            this.deleteTask(task.id);
        });

        taskDiv.querySelector('.complete-btn').addEventListener('click', e => {
            e.stopPropagation();
            this.toggleComplete(task.id);
        });

        const editBtn = taskDiv.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', e => {
                e.stopPropagation();
                this.editTask(task.id);
            });
        }
        
        if (task.description) {
            taskDiv.addEventListener('click', e => {
                if (!e.target.closest('.task-actions') && !e.target.closest('.task-title-input')) {
                    this.toggleDescription(task.id);
                }
            });
        }

        return taskDiv;
    }

    downloadTasksAsPdf() {
        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
            this.showNotification('PDF library not loaded!', 'error');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('TaskMaster Pro - Task List', 14, 22);
        doc.setFontSize(11);
        let y = 40;
        this.tasks.forEach((task, index) => {
            if (y > 280) {
                doc.addPage();
                y = 20;
            }
            const status = task.completed ? 'Completed' : 'To Complete';
            doc.text(`${index + 1}. ${task.title} [${status}]`, 14, y);
            y += 7;
            doc.text(`   - Priority: ${task.priority} | Deadline: ${task.deadline}`, 16, y);
            y += 7;
            if (task.description) {
                const descLines = doc.splitTextToSize(`   - Description: ${task.description}`, 170);
                doc.text(descLines, 16, y);
                y += (descLines.length * 5);
            }
            y += 5;
        });
        doc.save('taskmaster-tasks.pdf');
    }

    render() {
        const todoList = this.tasks.filter(t => !t.completed);
        const completedList = this.tasks.filter(t => t.completed);

        this.renderTaskList(this.todoTasks, todoList, 'No tasks to complete. Great job!');
        this.renderTaskList(this.completedTasks, completedList, 'No tasks completed yet.');

        this.todoCount.textContent = todoList.length;
        this.completedCount.textContent = completedList.length;
    }

    renderTaskList(container, list, emptyMsg) {
        container.innerHTML = '';
        if (list.length === 0) {
            container.innerHTML = `<p class="empty-list-msg">${emptyMsg}</p>`;
        } else {
            list.forEach(task => container.appendChild(this.createTaskElement(task)));
        }
    }

    saveAndRender() {
        this.saveToLocalStorage();
        this.render();
    }

    saveToLocalStorage() {
        localStorage.setItem('taskmaster-tasks', JSON.stringify(this.tasks));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('taskmaster-tasks');
        if (saved) {
            try {
                this.tasks = JSON.parse(saved);
            } catch (e) {
                console.error("Error parsing tasks from localStorage", e);
                this.tasks = [];
            }
        }
        this.render();
    }

    clearAllTasks() {
        if (confirm('Are you sure you want to delete ALL tasks? This cannot be undone.')) {
            this.tasks = [];
            this.saveAndRender();
            this.showNotification('All tasks have been cleared.', 'success');
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    showNotification(message, type = 'success') {
        this.notification.textContent = message;
        this.notification.className = `notification ${type} show`;
        setTimeout(() => this.notification.classList.remove('show'), 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => new TodoApp());