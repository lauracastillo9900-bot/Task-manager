export type Priority = 'low' | 'medium' | 'high';
export type ViewMode = 'month' | 'week' | 'day';

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  priority: Priority;
  completed: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  priority: Priority;
  color: string;
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
};

export const TASK_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#22c55e',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
];
