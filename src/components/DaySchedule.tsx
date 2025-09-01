import React from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { getHourSlots, getTaskTimeSlot } from '../utils/dateUtils';
import { Task } from '../types';

export function DaySchedule() {
  const { state, getTasksForDate } = useTaskContext();
  const hourSlots = getHourSlots();
  const tasksForDate = getTasksForDate(state.selectedDate);

  const getTasksForHour = (hour: string): Task[] => {
    const hourNumber = getTaskTimeSlot(hour);
    return tasksForDate.filter(task => {
      if (!task.time) return false;
      const taskHour = getTaskTimeSlot(task.time);
      return taskHour === hourNumber;
    });
  };

  const getTaskColor = (color: Task['color']): string => {
    switch (color) {
      case 'red':
        return 'border-l-task-red bg-task-red/10';
      case 'green':
        return 'border-l-task-green bg-task-green/10';
      case 'blue':
        return 'border-l-task-blue bg-task-blue/10';
      case 'yellow':
        return 'border-l-task-yellow bg-task-yellow/10';
      default:
        return 'border-l-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="flex-1 p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white mb-2">Hourly Schedule</h2>
        <div className="flex items-center justify-between">
          <div className="w-full h-px bg-dark-600"></div>
          <span className="text-sm text-gray-400 ml-4">
            {tasksForDate.length} scheduled
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {hourSlots.map((hour) => {
          const tasksForHour = getTasksForHour(hour);
          
          return (
            <div key={hour} className="flex items-center space-x-4">
              <div className="w-16 text-sm text-gray-400 font-medium">
                {hour}
              </div>
              <div className="flex-1 min-h-[40px] border border-dark-600 rounded-lg bg-dark-800 p-2">
                {tasksForHour.length > 0 ? (
                  <div className="space-y-1">
                    {tasksForHour.map((task) => (
                      <div
                        key={task.id}
                        className={`p-2 rounded border-l-4 ${getTaskColor(task.color)}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white text-sm">
                              {task.title}
                            </h4>
                            {task.company && (
                              <p className="text-xs text-gray-400">
                                {task.company}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              task.status === 'Done' 
                                ? 'bg-green-600/20 text-green-400'
                                : task.status === 'In Progress'
                                ? 'bg-blue-600/20 text-blue-400'
                                : task.status === 'Accepted'
                                ? 'bg-yellow-600/20 text-yellow-400'
                                : 'bg-gray-600/20 text-gray-400'
                            }`}>
                              {task.status}
                            </span>
                            {task.type === 'Meeting' && (
                              <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
                                Meeting
                              </span>
                            )}
                          </div>
                        </div>
                        {task.assignees.length > 0 && (
                          <div className="mt-1">
                            <p className="text-xs text-gray-400">
                              Assigned to: {task.assignees.map(a => a.name).join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm italic">
                    No tasks scheduled
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