'use client';

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { useTask } from '@/context/TaskContext';
import { Priority, TASK_COLORS, TaskFormData } from '@/types';
import { X } from 'lucide-react';
import { useTranslation } from '@/context/LocaleContext';

export default function TaskFormModal() {
  const { state, closeModal, addTask, updateTask } = useTask();
  const { isModalOpen, editingTask, selectedDate } = state;
  const modalRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    date: format(selectedDate, 'yyyy-MM-dd'),
    startTime: '',
    endTime: '',
    priority: 'medium',
    color: TASK_COLORS[0],
  });

  const [errors, setErrors] = useState<{ title?: string; date?: string }>({});

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description || '',
        date: editingTask.date,
        startTime: editingTask.startTime || '',
        endTime: editingTask.endTime || '',
        priority: editingTask.priority,
        color: editingTask.color,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: '',
        endTime: '',
        priority: 'medium',
        color: TASK_COLORS[0],
      });
    }
    setErrors({});
  }, [editingTask, selectedDate, isModalOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) closeModal();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen, closeModal]);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  const validate = (): boolean => {
    const newErrors: { title?: string; date?: string } = {};
    if (!formData.title.trim()) newErrors.title = t('task.required');
    if (!formData.date) newErrors.date = t('task.required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (editingTask) {
      updateTask(editingTask.id, formData);
    } else {
      addTask(formData);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeModal();
  };

  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {editingTask ? t('common.editTask') : t('common.newTask')}
          </h2>
          <button
            onClick={closeModal}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('task.title')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-800 dark:text-gray-100 ${
                errors.title ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
              placeholder={t('task.titlePlaceholder')}
              autoFocus
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('task.description')}
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors hover:border-gray-300 dark:hover:border-gray-500 resize-none bg-white dark:bg-gray-800 dark:text-gray-100"
              placeholder={t('task.descriptionPlaceholder')}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('task.date')} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-800 dark:text-gray-100 ${
                  errors.date ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              />
              {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('task.priority')}
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-800 dark:text-gray-100 hover:border-gray-300 dark:hover:border-gray-500 cursor-pointer"
              >
                <option value="low">{t('task.low')}</option>
                <option value="medium">{t('task.medium')}</option>
                <option value="high">{t('task.high')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('task.startTime')}
              </label>
              <input
                type="time"
                id="startTime"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('task.endTime')}
              </label>
              <input
                type="time"
                id="endTime"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('task.color')}
            </label>
            <div className="flex gap-2">
              {TASK_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    formData.color === color
                      ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {editingTask ? t('common.save') : t('common.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
