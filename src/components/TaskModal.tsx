import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, FileText, Repeat, Plus } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';
import { Task, User, TaskStatus } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
}

export function TaskModal({ isOpen, onClose, task }: TaskModalProps) {
  const { state, addTask, updateTask } = useTaskContext();
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Check current theme on mount and when theme changes
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkTheme();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    date: new Date(),
    startTime: '',
    endTime: '',
    type: 'Task' as Task['type'],
    color: 'blue' as Task['color'],
    assignees: [] as User[],
    manualEmails: [] as string[],
    isRecurring: false,
    recurrenceType: 'none' as 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'yearly',
    recurrenceInterval: 1,
    reminders: {
      '5min': false,
      '15min': false,
      '30min': false,
      '1hour': false,
      '1day': false,
    },
  });

  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        company: task.company || '',
        date: task.date,
        startTime: task.time || '',
        endTime: '', // Calculate end time based on start time + 1 hour
        type: task.type,
        color: task.color,
        assignees: task.assignees,
        manualEmails: [],
        isRecurring: task.isRecurring,
        recurrenceType: task.recurrencePattern?.type || 'none',
        recurrenceInterval: task.recurrencePattern?.interval || 1,
        reminders: {
          '5min': false,
          '15min': false,
          '30min': false,
          '1hour': false,
          '1day': false,
        },
      });
    } else {
      setFormData({
        title: '',
        description: '',
        company: '',
        date: new Date(),
        startTime: '',
        endTime: '',
        type: 'Task',
        color: 'blue',
        assignees: [],
        manualEmails: [],
        isRecurring: false,
        recurrenceType: 'none',
        recurrenceInterval: 1,
        reminders: {
          '5min': false,
          '15min': false,
          '30min': false,
          '1hour': false,
          '1day': false,
        },
      });
    }
    setSelectedUserId('');
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      ...formData,
      status: task?.status || 'No Action',
      completionStatus: task?.completionStatus || 'Pending',
      owner: state.currentUser!,
      time: formData.startTime,
      recurrencePattern: formData.isRecurring ? {
        type: formData.recurrenceType,
        interval: formData.recurrenceInterval,
      } : undefined,
    };

    if (task) {
      updateTask(task.id, taskData);
    } else {
      addTask(taskData);
    }
    
    onClose();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      date: new Date(e.target.value),
    }));
  };

  const handleAssigneeToggle = (user: User) => {
    setFormData(prev => ({
      ...prev,
      assignees: [user],
    }));
  };

  const addManualEmail = () => {
    const email = prompt('Enter email address:');
    if (email && email.includes('@')) {
      const manualUser: User = {
        id: email,
        name: email.split('@')[0],
        email: email,
      };
      setFormData(prev => ({
        ...prev,
        assignees: [manualUser],
        manualEmails: [],
      }));
    }
  };

  const removeManualEmail = (email: string) => {
    setFormData(prev => ({
      ...prev,
      manualEmails: prev.manualEmails.filter(e => e !== email),
    }));
  };

  const handleReminderChange = (reminder: keyof typeof formData.reminders) => {
    setFormData(prev => ({
      ...prev,
      reminders: {
        ...prev.reminders,
        [reminder]: !prev.reminders[reminder],
      },
    }));
  };

  const colorOptions = [
    { value: 'pink', label: 'Pink', class: 'bg-pink-400' },
    { value: 'green', label: 'Light Green', class: 'bg-green-400' },
    { value: 'blue', label: 'Light Blue', class: 'bg-blue-400' },
    { value: 'yellow', label: 'Yellow', class: 'bg-yellow-400' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-400' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-colors duration-200 ${
        isDarkMode 
          ? 'bg-dark-800 border border-dark-600' 
          : 'bg-white border border-gray-300'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-semibold transition-colors duration-200 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {task ? 'Edit Task' : 'Create New Event'}
          </h2>
          <button
            onClick={onClose}
            className={`transition-colors duration-200 ${
              isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Event Summary */}
        <div className={`mb-6 p-3 rounded-lg transition-colors duration-200 ${
          isDarkMode ? 'bg-blue-900/20 border border-blue-700/30' : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className={`text-sm font-medium transition-colors duration-200 ${
            isDarkMode ? 'text-blue-300' : 'text-blue-600'
          }`}>
            {formData.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div className={`text-sm font-medium transition-colors duration-200 ${
            isDarkMode ? 'text-blue-300' : 'text-blue-600'
          }`}>
            Start: {formData.startTime || 'Not set'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 transition-colors duration-200 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-900'
              }`}>
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={formData.date.toISOString().split('T')[0]}
                  onChange={handleDateChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-dark-700 border-dark-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <Calendar size={16} className={`absolute right-3 top-3 transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-400'
                }`} />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 transition-colors duration-200 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-900'
              }`}>
                Start Time
              </label>
              <select
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-dark-700 border-dark-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Select time</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                    {i.toString().padStart(2, '0')}:00
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title and Company */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 transition-colors duration-200 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-900'
              }`}>
                Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-dark-700 border-dark-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter task title"
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 transition-colors duration-200 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-900'
              }`}>
                Company (Optional)
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-dark-700 border-dark-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter company name"
              />
            </div>
          </div>

          {/* Type and Color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 transition-colors duration-200 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-900'
              }`}>
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-dark-700 border-dark-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="Task">Task</option>
                <option value="Meeting">Meeting</option>
                <option value="Week-off">Week-off</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 transition-colors duration-200 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-900'
              }`}>
                Color
              </label>
              <div className="flex space-x-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value as any }))}
                    className={`w-8 h-8 rounded-full ${color.class} border-2 transition-all ${
                      formData.color === color.value 
                        ? 'border-primary-500 scale-110' 
                        : isDarkMode ? 'border-dark-500 hover:scale-105' : 'border-gray-300 hover:scale-105'
                    }`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-sm font-semibold mb-2 transition-colors duration-200 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-900'
            }`}>
              Notes (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 h-20 resize-none transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-dark-700 border-dark-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Enter additional notes"
            />
          </div>

          {/* Assign to One Person */}
          <div>
            <label className={`block text-sm font-semibold mb-2 flex items-center transition-colors duration-200 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-900'
            }`}>
              <Users size={16} className="mr-2" />
              Assign to One Person
            </label>
            <div className="space-y-3">
              {/* Registered Users */}
              <div className="flex items-center space-x-2">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-dark-700 border-dark-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Select a registered user</option>
                  {state.users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const selectedUser = state.users.find(u => u.id === selectedUserId);
                    if (selectedUser) {
                      setFormData(prev => ({ ...prev, assignees: [selectedUser] }));
                      setSelectedUserId('');
                    }
                  }}
                  disabled={!selectedUserId}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign
                </button>
              </div>
              
              {/* Manual Email */}
              <button
                type="button"
                onClick={addManualEmail}
                className="text-primary-500 hover:text-primary-600 text-sm underline transition-colors"
              >
                Add email manually
              </button>

              {/* Selected Assignee */}
              {formData.assignees.length > 0 && (
                <div className="space-y-2">
                  <div className={`text-sm font-medium transition-colors duration-200 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Assigned to:</div>
                  {formData.assignees.map((assignee) => (
                    <div key={assignee.id} className={`flex items-center justify-between p-2 rounded transition-colors duration-200 ${
                      isDarkMode ? 'bg-dark-700' : 'bg-gray-50'
                    }`}>
                      <span className={`text-sm transition-colors duration-200 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>{assignee.name} ({assignee.email})</span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, assignees: [] }))}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Manual Emails */}
              {formData.manualEmails.length > 0 && (
                <div className="space-y-2">
                  <div className={`text-sm font-medium transition-colors duration-200 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Manual Emails:</div>
                  {formData.manualEmails.map((email, index) => (
                    <div key={index} className={`flex items-center justify-between p-2 rounded transition-colors duration-200 ${
                      isDarkMode ? 'bg-dark-700' : 'bg-gray-50'
                    }`}>
                      <span className={`text-sm transition-colors duration-200 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>{email}</span>
                      <button
                        type="button"
                        onClick={() => removeManualEmail(email)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* End Time */}
          <div>
            <label className={`block text-sm font-semibold mb-2 transition-colors duration-200 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-900'
            }`}>
              End Time
            </label>
            <select
              value={formData.endTime}
              onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-dark-700 border-dark-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">Select end time</option>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                  {i.toString().padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>

          {/* Repeat */}
          <div>
            <label className={`block text-sm font-semibold mb-2 transition-colors duration-200 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-900'
            }`}>
              Repeat
            </label>
            <select
              value={formData.recurrenceType}
              onChange={(e) => setFormData(prev => ({ ...prev, recurrenceType: e.target.value as any }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-dark-700 border-dark-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="none">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekdays">Weekdays only</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Reminders */}
          <div>
            <label className={`block text-sm font-semibold mb-2 transition-colors duration-200 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-900'
            }`}>
              Reminders
            </label>
            <div className="space-y-2">
              {Object.entries(formData.reminders).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => handleReminderChange(key as keyof typeof formData.reminders)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className={`text-sm transition-colors duration-200 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {key === '5min' && '5 minutes before'}
                    {key === '15min' && '15 minutes before'}
                    {key === '30min' && '30 minutes before'}
                    {key === '1hour' && '1 hour before'}
                    {key === '1day' && '1 day before'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`flex items-center justify-end space-x-4 pt-4 border-t transition-colors duration-200 ${
            isDarkMode ? 'border-dark-700' : 'border-gray-200'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 border rounded-lg transition-colors duration-200 ${
                isDarkMode 
                  ? 'border-dark-600 text-gray-300 hover:bg-dark-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {task ? 'Update Task' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 