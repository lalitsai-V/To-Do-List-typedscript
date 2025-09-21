export enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high"
}

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  description: string;
  deadline: string;
  completed: boolean;
  createdAt: string;
}

export interface TaskCreateDto {
  title: string;
  priority: Priority;
  description: string;
  deadline: string;
}
