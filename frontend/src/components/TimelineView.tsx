import { DialogPanel } from './DialogPanel';
import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  Filter,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEvent } from '../context/EventContext';
import { TaskItem, TaskPriority, TaskStatus } from '../types';
import { api } from '../services/api';

export const TimelineView: React.FC = () => {
  const { t } = useLanguage();
  const { currentEvent, refreshCurrentEvent } = useEvent();

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [completionPct, setCompletionPct] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [taskForm, setTaskForm] = useState<{
    title: string;
    description: string;
    due_date: string;
    milestone_phase: string;
    priority: TaskPriority;
    status: TaskStatus;
  }>({
    title: '',
    description: '',
    due_date: '',
    milestone_phase: 'preparation',
    priority: 'medium',
    status: 'pending',
  });

  const fetchTasks = useCallback(async () => {
    if (!currentEvent?.id) return;
    setLoading(true);
    try {
      const res = await api.getTasks(currentEvent.id, statusFilter, priorityFilter);
      setTasks(res.tasks);
      setTotalCount(res.total_tasks);
      setCompletedCount(res.completed_tasks);
      setCompletionPct(res.completion_percentage);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentEvent?.id, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleOpenAdd = () => {
    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      due_date: '',
      milestone_phase: 'preparation',
      priority: 'medium',
      status: 'pending',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (task: TaskItem) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
      milestone_phase: task.milestone_phase || 'preparation',
      priority: task.priority,
      status: task.status,
    });
    setModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent?.id) return;

    if (!taskForm.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    try {
      if (editingTask) {
        await api.updateTask(editingTask.id, currentEvent.id, taskForm);
      } else {
        await api.addTask(currentEvent.id, taskForm);
      }
      setModalOpen(false);
      await fetchTasks();
      refreshCurrentEvent();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error saving task');
    }
  };

  const handleToggleTaskStatus = async (task: TaskItem) => {
    if (!currentEvent?.id) return;
    const nextStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.updateTask(task.id, currentEvent.id, { status: nextStatus });
      await fetchTasks();
      refreshCurrentEvent();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error toggling task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!currentEvent?.id) return;
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await api.deleteTask(taskId, currentEvent.id);
      await fetchTasks();
      refreshCurrentEvent();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting task');
    }
  };

  if (!currentEvent) return null;

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {t.timelineTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t.timelineSubtitle}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-brand-700 hover:from-rose-700 hover:to-brand-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-200 active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.addTaskBtn}</span>
        </button>
      </div>

      {/* Progress & Milestone KPI Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Preparation Completion
          </span>
          <span className="text-sm font-bold text-brand-700">
            {completedCount} of {totalCount} Tasks Done ({completionPct}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-brand-600 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Filters:</span>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">{t.filterAll}</option>
          <option value="pending">{t.filterPending}</option>
          <option value="completed">{t.filterCompleted}</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">{t.filterPriorityAll}</option>
          <option value="high">{t.filterHigh}</option>
          <option value="medium">{t.filterMedium}</option>
          <option value="low">{t.filterLow}</option>
        </select>
      </div>

      {/* Task List Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">{t.loading}</div>
      ) : tasks.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200 space-y-2">
          <p>No tasks match the selected filters.</p>
          <button
            onClick={handleOpenAdd}
            className="text-xs font-bold text-brand-600 hover:underline"
          >
            + Create a New Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isDone = task.status === 'completed';
            const priorityBadge =
              task.priority === 'high'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : task.priority === 'medium'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200';

            return (
              <div
                key={task.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                  isDone
                    ? 'bg-slate-50/70 border-slate-200 opacity-80'
                    : 'bg-white border-slate-200/90 hover:border-brand-200 shadow-sm hover:shadow'
                }`}
              >
                {/* Completion Checkbox */}
                <button
                  onClick={() => handleToggleTaskStatus(task)}
                  aria-label={isDone ? t.markPending : t.markDone}
                  className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                    isDone
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 hover:border-brand-500 text-transparent'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                {/* Content */}
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${priorityBadge}`}>
                      {task.priority}
                    </span>

                    {task.due_date && (
                      <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{task.due_date}</span>
                      </span>
                    )}
                  </div>

                  <h3 className={`text-sm sm:text-base font-bold text-slate-900 ${isDone ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className={`text-xs text-slate-600 ${isDone ? 'text-slate-400' : ''}`}>
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="inline-flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(task)}
                    aria-label="Edit task"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    aria-label="Delete task"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Task Modal */}
      {modalOpen && (
        <div className="dialog-overlay fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm">
          <DialogPanel className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95" contentClassName="p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingTask ? 'Edit Task' : t.addTaskBtn}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Schedule food tasting, book DJ"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Description / Actionable Steps
                </label>
                <textarea
                  rows={2}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="e.g. Confirm 5 appetizers and 2 desserts for 50 guests"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Due / Milestone
                  </label>
                  <input
                    type="text"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    placeholder="e.g. 2 weeks before"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-brand-700 hover:from-rose-700 hover:to-brand-800 text-white text-xs font-bold shadow-sm"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      )}
    </div>
  );
};
