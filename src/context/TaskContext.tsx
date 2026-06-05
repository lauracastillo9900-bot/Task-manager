'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Task, TaskFormData, ViewMode } from '@/types';
import { format } from 'date-fns';

interface TaskState {
  tasks: Task[];
  selectedDate: Date;
  viewMode: ViewMode;
  isModalOpen: boolean;
  editingTask: Task | null;
}

type TaskAction =
  | { type: 'ADD_TASK'; payload: TaskFormData }
  | { type: 'UPDATE_TASK'; payload: { id: string; data: TaskFormData } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'SET_SELECTED_DATE'; payload: Date }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'OPEN_MODAL'; payload: { task?: Task; date?: Date } }
  | { type: 'CLOSE_MODAL' }
  | { type: 'LOAD_TASKS'; payload: Task[] };

const initialState: TaskState = {
  tasks: [],
  selectedDate: new Date(),
  viewMode: 'month',
  isModalOpen: false,
  editingTask: null,
};

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'ADD_TASK': {
      const now = new Date().toISOString();
      const newTask: Task = {
        id: uuidv4(),
        ...action.payload,
        completed: false,
        createdAt: now,
        updatedAt: now,
      };
      return { ...state, tasks: [...state.tasks, newTask], isModalOpen: false, editingTask: null };
    }
    case 'UPDATE_TASK': {
      const { id, data } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, ...data, updatedAt: new Date().toISOString() }
            : task
        ),
        isModalOpen: false,
        editingTask: null,
      };
    }
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload
            ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
            : task
        ),
      };
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'OPEN_MODAL':
      return {
        ...state,
        isModalOpen: true,
        editingTask: action.payload.task || null,
        selectedDate: action.payload.date || state.selectedDate,
      };
    case 'CLOSE_MODAL':
      return { ...state, isModalOpen: false, editingTask: null };
    case 'LOAD_TASKS':
      return { ...state, tasks: action.payload };
    default:
      return state;
  }
}

interface TaskContextValue {
  state: TaskState;
  addTask: (data: TaskFormData) => void;
  updateTask: (id: string, data: TaskFormData) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: ViewMode) => void;
  openModal: (options?: { task?: Task; date?: Date }) => void;
  closeModal: () => void;
  getTasksForDate: (date: Date) => Task[];
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

const STORAGE_KEY = 'task-calendar-basic-tasks';

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const hydrated = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const tasks = JSON.parse(stored) as Task[];
        dispatch({ type: 'LOAD_TASKS', payload: tasks });
      } catch (e) {
        console.error('Failed to load tasks from storage:', e);
      }
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  }, [state.tasks]);

  const addTask = (data: TaskFormData) => dispatch({ type: 'ADD_TASK', payload: data });
  const updateTask = (id: string, data: TaskFormData) => dispatch({ type: 'UPDATE_TASK', payload: { id, data } });
  const deleteTask = (id: string) => dispatch({ type: 'DELETE_TASK', payload: id });
  const toggleTask = (id: string) => dispatch({ type: 'TOGGLE_TASK', payload: id });
  const setSelectedDate = (date: Date) => dispatch({ type: 'SET_SELECTED_DATE', payload: date });
  const setViewMode = (mode: ViewMode) => dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  const openModal = (options?: { task?: Task; date?: Date }) => dispatch({ type: 'OPEN_MODAL', payload: options || {} });
  const closeModal = () => dispatch({ type: 'CLOSE_MODAL' });

  const getTasksForDate = (date: Date): Task[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return state.tasks.filter((task) => task.date === dateStr);
  };

  return (
    <TaskContext.Provider
      value={{
        state,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        setSelectedDate,
        setViewMode,
        openModal,
        closeModal,
        getTasksForDate,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTask(): TaskContextValue {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}
