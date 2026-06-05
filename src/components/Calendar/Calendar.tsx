'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  isToday,
} from 'date-fns';
import { useTask } from '@/context/TaskContext';
import { ViewMode, Task } from '@/types';
import { ChevronLeft, ChevronRight, CalendarIcon, List, LayoutGrid } from 'lucide-react';
import { useTranslation } from '@/context/LocaleContext';

// ─── Header ──────────────────────────────────────────────────

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: ViewMode;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewModeChange: (mode: ViewMode) => void;
}

function CalendarHeader({
  currentDate,
  viewMode,
  onPrev,
  onNext,
  onToday,
  onViewModeChange,
}: CalendarHeaderProps) {
  const { t } = useTranslation();

  const getTitle = () => {
    switch (viewMode) {
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'week': {
        const ws = startOfWeek(currentDate, { weekStartsOn: 0 });
        const we = endOfWeek(currentDate, { weekStartsOn: 0 });
        return `${format(ws, 'MMM d')} – ${format(we, 'MMM d, yyyy')}`;
      }
      case 'day':
        return format(currentDate, 'EEEE, MMMM d');
      default:
        return format(currentDate, 'MMMM yyyy');
    }
  };

  const viewModes: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'month', icon: <LayoutGrid className="w-4 h-4" />, label: t('calendar.month') },
    { mode: 'week', icon: <CalendarIcon className="w-4 h-4" />, label: t('calendar.week') },
    { mode: 'day', icon: <List className="w-4 h-4" />, label: t('calendar.day') },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label={t('common.previous')}
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={onNext}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label={t('common.next')}
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 ml-2">
          {getTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToday}
          className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {t('calendar.today')}
        </button>

        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {viewModes.map(({ mode, icon, label }) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              } ${mode !== 'day' ? 'border-r border-gray-200 dark:border-gray-700' : ''}`}
              aria-label={`${label} view`}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Month View ──────────────────────────────────────────────

function MonthView({
  currentDate,
  selectedDate,
  onSelectDate,
  getTasksForDate,
  onAddTask,
}: {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  getTasksForDate: (date: Date) => Task[];
  onAddTask: (date: Date) => void;
}) {
  const { t } = useTranslation();

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  const weekDays = [
    t('hobby.sunday'),
    t('hobby.monday'),
    t('hobby.tuesday'),
    t('hobby.wednesday'),
    t('hobby.thursday'),
    t('hobby.friday'),
    t('hobby.saturday'),
  ];

  const totalRows = Math.ceil(days.length / 7);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-900">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 bg-white dark:bg-gray-950">
        {days.map((day, index) => {
          const tasks = getTasksForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = isSameDay(day, selectedDate);
          const isDayToday = isToday(day);
          const row = Math.floor(index / 7);
          const isLastRow = row === totalRows - 1;

          return (
            <div
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              onDoubleClick={() => onAddTask(day)}
              className={`min-h-16 sm:min-h-24 p-1 sm:p-2 border-b border-r border-gray-100 dark:border-gray-800 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                !isCurrentMonth ? 'bg-gray-50/50 dark:bg-gray-900/30' : ''
              } ${isSelected ? 'ring-2 ring-inset ring-blue-500 bg-blue-50 dark:bg-blue-950/30' : ''} ${
                isLastRow ? 'border-b-0' : ''
              }`}
            >
              <span
                className={`inline-flex items-center justify-center w-6 h-6 text-xs sm:text-sm font-medium rounded-full ${
                  isDayToday
                    ? 'bg-blue-600 text-white'
                    : isCurrentMonth
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              >
                {format(day, 'd')}
              </span>
              <div className="mt-0.5 sm:mt-1 space-y-0.5">
                {tasks.slice(0, 2).map((task) => (
                  <div
                    key={task.id}
                    className="text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded truncate font-medium"
                    style={{
                      backgroundColor: `${task.color}15`,
                      color: task.color,
                    }}
                  >
                    {task.title}
                  </div>
                ))}
                {tasks.length > 2 && (
                  <div className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 px-1">
                    +{tasks.length - 2}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week View ───────────────────────────────────────────────

function WeekView({
  currentDate,
  selectedDate,
  onSelectDate,
  getTasksForDate,
  onAddTask,
}: {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  getTasksForDate: (date: Date) => Task[];
  onAddTask: (date: Date) => void;
}) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const hours = Array.from({ length: 14 }, (_, i) => i + 6); // 6 AM to 7 PM

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="grid grid-cols-8 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="py-2 sm:py-3" />
        {days.map((day) => {
          const isDayToday = isToday(day);
          const isSelected = isSameDay(day, selectedDate);
          return (
            <div
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`py-2 sm:py-3 text-center cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                isSelected ? 'bg-blue-50 dark:bg-blue-950/30' : ''
              }`}
            >
              <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {format(day, 'EEE')}
              </div>
              <div
                className={`mt-0.5 mx-auto w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-xs sm:text-sm font-semibold ${
                  isDayToday ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      <div className="max-h-[60vh] overflow-y-auto bg-white dark:bg-gray-950">
        <div className="grid grid-cols-8">
          {hours.map((hour) => (
            <div key={hour} className="contents">
              <div className="py-3 px-1 sm:px-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-right border-r border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 sticky left-0">
                {format(new Date(2000, 0, 1, hour, 0), 'h a')}
              </div>
              {days.map((day) => {
                const tasks = getTasksForDate(day).filter((task) => {
                  if (!task.startTime) return false;
                  const taskHour = parseInt(task.startTime.split(':')[0], 10);
                  return taskHour === hour;
                });
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    onClick={() => onAddTask(day)}
                    className="min-h-12 border-r border-b border-gray-100 dark:border-gray-800 p-0.5 sm:p-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="text-[10px] sm:text-xs px-1 py-0.5 rounded truncate font-medium mb-0.5"
                        style={{
                          backgroundColor: `${task.color}20`,
                          color: task.color,
                        }}
                      >
                        <span className="hidden sm:inline">{task.startTime} </span>
                        {task.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Day Detail View ─────────────────────────────────────────

function DayDetailView({
  date,
  tasks,
  onEditTask,
  onAddTask,
}: {
  date: Date;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onAddTask: () => void;
}) {
  const { toggleTask, deleteTask } = useTask();
  const { t } = useTranslation();

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (!a.startTime && !b.startTime) return 0;
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [tasks]);

  const priorityStyles: Record<string, string> = {
    low: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 bg-white dark:bg-gray-950">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {format(date, 'EEEE')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm sm:text-base">
            {format(date, 'MMMM d, yyyy')}
            {isToday(date) && (
              <span className="ml-2 text-sm font-medium text-blue-600">{t('calendar.today')}</span>
            )}
          </p>
        </div>
        <button
          onClick={onAddTask}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">{t('common.newTask')}</span>
        </button>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">{t('calendar.noTasks')}</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">{t('task.titlePlaceholder')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedTasks.map((task) => (
            <div
              key={task.id}
              className={`group flex items-start gap-3 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                task.completed ? 'opacity-50' : ''
              }`}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  task.completed
                    ? 'bg-gray-900 dark:bg-gray-100 border-gray-900 dark:border-gray-100'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                }`}
              >
                {task.completed && (
                  <svg className="w-3 h-3 text-white dark:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: task.color }}
                  />
                  <h3
                    className={`font-medium truncate ${
                      task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {task.title}
                  </h3>
                </div>

                {task.description && (
                  <p className={`mt-1 text-sm ${task.completed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    {task.description}
                  </p>
                )}

                <div className="mt-2 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  {task.startTime && (
                    <span className="font-medium">{task.startTime}{task.endTime && ` – ${task.endTime}`}</span>
                  )}
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityStyles[task.priority]}`}>
                    {task.priority}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEditTask(task)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                  aria-label="Edit task"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  aria-label="Delete task"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Calendar ───────────────────────────────────────────

export default function Calendar() {
  const {
    state,
    setSelectedDate,
    setViewMode,
    openModal,
    getTasksForDate,
  } = useTask();

  const [currentDate, setCurrentDate] = useState(state.selectedDate);

  const navigate = useCallback((direction: 1 | -1) => {
    const fn = direction === 1
      ? { month: addMonths, week: addWeeks, day: addDays }
      : { month: subMonths, week: subWeeks, day: subDays };

    const compute = fn[state.viewMode] ?? ((d: Date) => d);
    const next = compute(currentDate, 1);
    setCurrentDate(next);
    if (state.viewMode === 'day') setSelectedDate(next);
  }, [state.viewMode, currentDate, setSelectedDate]);

  const handlePrev = useCallback(() => navigate(-1), [navigate]);
  const handleNext = useCallback(() => navigate(1), [navigate]);

  const handleToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }, [setSelectedDate]);

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode);
      if (mode === 'day') setSelectedDate(currentDate);
    },
    [setViewMode, setSelectedDate, currentDate]
  );

  const handleSelectDate = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      setCurrentDate(date);
    },
    [setSelectedDate]
  );

  const handleAddTask = useCallback(
    (date: Date) => openModal({ date }),
    [openModal]
  );

  return (
    <div className="h-full flex flex-col">
      <CalendarHeader
        currentDate={state.viewMode === 'day' ? state.selectedDate : currentDate}
        viewMode={state.viewMode}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onViewModeChange={handleViewModeChange}
      />

      {state.viewMode === 'month' && (
        <MonthView
          currentDate={currentDate}
          selectedDate={state.selectedDate}
          onSelectDate={handleSelectDate}
          getTasksForDate={getTasksForDate}
          onAddTask={handleAddTask}
        />
      )}

      {state.viewMode === 'week' && (
        <WeekView
          currentDate={currentDate}
          selectedDate={state.selectedDate}
          onSelectDate={handleSelectDate}
          getTasksForDate={getTasksForDate}
          onAddTask={handleAddTask}
        />
      )}

      {state.viewMode === 'day' && (
        <DayDetailView
          date={state.selectedDate}
          tasks={getTasksForDate(state.selectedDate)}
          onEditTask={(task) => openModal({ task })}
          onAddTask={() => handleAddTask(state.selectedDate)}
        />
      )}
    </div>
  );
}
