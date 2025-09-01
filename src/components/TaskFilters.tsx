import React from 'react';
import { useTaskContext } from '../contexts/TaskContext';

export function TaskFilters() {
  const { state, dispatch, getTasksByType } = useTaskContext();

  const filterTypes = [
    { type: 'My Tasks' as const, label: 'My Tasks' },
    { type: 'Delegated Task' as const, label: 'Delegated Task' },
    { type: 'Meetings' as const, label: 'Meetings' },
  ];

  const handleFilterChange = (filterType: typeof filterTypes[0]['type']) => {
    dispatch({ type: 'SET_FILTER', payload: { type: filterType } });
  };

  return (
    <div className="flex items-center space-x-2 p-4 bg-dark-800 border-b border-dark-700">
      {filterTypes.map(({ type, label }) => {
        const taskCount = getTasksByType(type).length;
        const isActive = state.currentFilter.type === type;

        return (
          <button
            key={type}
            onClick={() => handleFilterChange(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600'
            }`}
          >
            {label} {taskCount}
          </button>
        );
      })}
    </div>
  );
} 