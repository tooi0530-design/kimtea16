export enum TaskStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS', // O
  FAILURE = 'FAILURE'  // X
}

export interface Todo {
  id: string;
  text: string;
  status: TaskStatus;
  date: string; // Format: YYYY-MM-DD
  createdAt: number;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
  hasTodos: boolean;
}