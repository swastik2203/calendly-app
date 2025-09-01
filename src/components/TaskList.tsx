import React from 'react';
import { Edit, Trash2, CheckCircle, Circle } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';
import { Task, TaskStatus } from '../types';
import { formatDate, formatTime } from '../utils/dateUtils';

interface TaskListProps {
  onEditTask: (task: Task) => void;
}

export function TaskList({ onEditTask }: TaskListProps) {
  const { state, getFilteredTasks, updateTaskStatus, updateCompletionStatus, deleteTask } = useTaskContext();
  const tasks = getFilteredTasks();

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    updateTaskStatus(taskId, status);
  };

  const handleCompletionToggle = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    updateCompletionStatus(taskId, newStatus as any);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case 'Done':
        return 'bg-green-600/20 text-green-400';
      case 'In Progress':
        return 'bg-blue-600/20 text-blue-400';
      case 'Accepted':
        return 'bg-yellow-600/20 text-yellow-400';
      default:
        return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getTaskColor = (color: Task['color']): string => {
    switch (color) {
      case 'red':
        return 'border-l-task-red';
      case 'green':
        return 'border-l-task-green';
      case 'blue':
        return 'border-l-task-blue';
      case 'yellow':
        return 'border-l-task-yellow';
      default:
        return 'border-l-gray-500';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">No tasks found</div>
          <div className="text-gray-500 text-sm">
            Create a new task to get started
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">
          {state.currentFilter.type} - {tasks.length} tasks
        </h2>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`card border-l-4 ${getTaskColor(task.color)} hover:bg-dark-700 transition-colors`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <button
                    onClick={() => handleCompletionToggle(task.id, task.completionStatus)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {task.completionStatus === 'Completed' ? (
                      <CheckCircle size={20} className="text-green-500" />
                    ) : (
                      <Circle size={20} />
                    )}
                  </button>
                  <h3 className={`font-medium text-sm ${
                    task.completionStatus === 'Completed' ? 'line-through text-gray-400' : 'text-white'
                  }`}>
                    {task.title}
                  </h3>
                  {task.type === 'Meeting' && (
                    <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
                      Meeting
                    </span>
                  )}
                </div>

                {task.description && (
                  <p className="text-gray-400 text-sm mb-2">{task.description}</p>
                )}

                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{formatDate(task.date)}</span>
                  {task.time && <span>{task.time}</span>}
                  {task.company && <span>{task.company}</span>}
                  {task.assignees.length > 0 && (
                    <span>Assigned to: {task.assignees.map(a => a.name).join(', ')}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                  className="text-xs bg-dark-700 border border-dark-600 text-white px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="No Action">No Action</option>
                  <option value="Accepted">Accepted</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>

                <button
                  onClick={() => onEditTask(task)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <Edit size={16} />
                </button>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mt-2">
              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 