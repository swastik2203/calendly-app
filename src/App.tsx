import React, { useState } from 'react';
import { TaskProvider, useTaskContext } from './contexts/TaskContext';
import { Header } from './components/Header';
import { TaskFilters } from './components/TaskFilters';
import { Calendar } from './components/Calendar';
import { DaySchedule } from './components/DaySchedule';
import { TaskList } from './components/TaskList';
import { TaskModal } from './components/TaskModal';
import { Task } from './types';
import { AuthGate } from './components/AuthGate';

function AppContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleAddTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <Header onAddTask={handleAddTask} />
      <TaskFilters />
      
      <div className="flex">
        {/* Calendar Sidebar */}
        <div className="w-80 p-4 border-r border-dark-700">
          <Calendar />
        </div>
        
        {/* Main Content - Conditionally render based on view mode */}
        <div className="flex-1">
          <ViewContent onEditTask={handleEditTask} />
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        task={selectedTask}
      />
    </div>
  );
}

// Separate component to handle view switching
function ViewContent({ onEditTask }: { onEditTask: (task: Task) => void }) {
  const { state } = useTaskContext();
  
  if (state.viewMode === 'day') {
    return <DaySchedule />;
  } else {
    return <TaskList onEditTask={onEditTask} />;
  }
}

function App() {
  return (
    <AuthGate>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </AuthGate>
  );
}

export default App; 