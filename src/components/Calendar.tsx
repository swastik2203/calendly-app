import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';
import { getMonthDays, formatDate, isToday, isSelectedDate } from '../utils/dateUtils';

export function Calendar() {
  const { state, dispatch, getTasksForDate } = useTaskContext();

  const handlePreviousMonth = () => {
    const newDate = new Date(state.selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    dispatch({ type: 'SET_SELECTED_DATE', payload: newDate });
  };

  const handleNextMonth = () => {
    const newDate = new Date(state.selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    dispatch({ type: 'SET_SELECTED_DATE', payload: newDate });
  };

  const handleDateSelect = (date: Date) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date });
  };

  const monthDays = getMonthDays(state.selectedDate);
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="card max-w-sm mx-auto">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePreviousMonth}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-white">
            {formatDate(state.selectedDate).split(',')[0]}
          </span>
          <span className="text-gray-400">
            {state.selectedDate.getFullYear()}
          </span>
        </div>
        <button
          onClick={handleNextMonth}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-400 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((date) => {
          const tasksForDate = getTasksForDate(date);
          const isCurrentDate = isToday(date);
          const isSelected = isSelectedDate(date, state.selectedDate);

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateSelect(date)}
              className={`relative p-2 text-sm rounded-lg transition-colors ${
                isSelected
                  ? 'bg-red-600 text-white'
                  : isCurrentDate
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              <span>{date.getDate()}</span>
              
              {/* Task Indicators */}
              {tasksForDate.length > 0 && (
                <div className="flex justify-center space-x-1 mt-1">
                  {tasksForDate.slice(0, 3).map((task, index) => (
                    <div
                      key={index}
                      className={`w-1 h-1 rounded-full ${
                        task.color === 'red'
                          ? 'bg-task-red'
                          : task.color === 'green'
                          ? 'bg-task-green'
                          : task.color === 'blue'
                          ? 'bg-task-blue'
                          : 'bg-task-yellow'
                      }`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
} 