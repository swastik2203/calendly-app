import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Plus, User, LogOut, Book, Calendar } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';
import { formatDate } from '../utils/dateUtils';
import { NotificationPanel } from './NotificationPanel';
import { supabase } from '../lib/supabaseClient';

interface HeaderProps {
  onAddTask: () => void;
}

export function Header({ onAddTask }: HeaderProps) {
  const { state, dispatch } = useTaskContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if theme is stored in localStorage, default to dark
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    // Apply theme on mount
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Close profile dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const profileRef = useRef<HTMLDivElement>(null);

  const handleTodayClick = () => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: new Date() });
  };

  const handleViewModeChange = (mode: 'day' | 'list') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  };

  const toggleDarkMode = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="bg-dark-800 border-b border-dark-700 p-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleTodayClick}
            className="btn-secondary text-sm"
          >
            Today
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Center - View Mode Toggle */}
        <div className="flex items-center bg-dark-700 rounded-lg p-1">
          <button
            onClick={() => handleViewModeChange('day')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              state.viewMode === 'day'
                ? 'bg-primary-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => handleViewModeChange('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              state.viewMode === 'list'
                ? 'bg-primary-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            List
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          <NotificationPanel />
          <button
            onClick={onAddTask}
            className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
          </button>
          
          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="bg-dark-700 hover:bg-dark-600 text-white p-2 rounded-lg transition-colors"
            >
              <User size={20} />
            </button>
            
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-dark-700 border border-dark-600 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-dark-600">
                  <p className="text-white font-medium">
                    {state.currentUser?.name || 'User'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {state.currentUser?.email || 'user@example.com'}
                  </p>
                </div>
                
                <div className="py-2">
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-gray-300 hover:bg-dark-600 transition-colors"
                  >
                    <Book size={16} className="mr-3" />
                    Documentation
                  </a>
                  
                  <div className="px-4 py-3 border-b border-dark-600">
                    <div className="text-sm text-gray-400 mb-2">
                      Connect your Google Calendar to sync events with your tasks
                    </div>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">
                      Connect
                    </button>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-red-400 hover:bg-dark-600 transition-colors"
                  >
                    <LogOut size={16} className="mr-3" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date Display */}
      <div className="mt-4">
        <h1 className="text-xl font-semibold text-white">
          Day Schedule - {formatDate(state.selectedDate)}
        </h1>
      </div>
    </div>
  );
} 