'use client';

import { TaskProvider } from '@/context/TaskContext';
import TaskFormModal from '@/components/TaskForm/TaskFormModal';

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <TaskProvider>
      {children}
      <TaskFormModal />
    </TaskProvider>
  );
}
