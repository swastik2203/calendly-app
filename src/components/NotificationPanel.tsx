import React, { useState, useEffect } from 'react';
import { Bell, X, Mail, Clock, User } from 'lucide-react';
import { EmailService } from '../utils/emailService';
import { EmailNotification } from '../types';

export function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);

  useEffect(() => {
    // Update notifications every 5 seconds
    const interval = setInterval(() => {
      setNotifications(EmailService.getNotifications());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getNotificationIcon = (type: EmailNotification['type']) => {
    switch (type) {
      case 'assignment':
        return <User size={16} className="text-blue-400" />;
      case 'update':
        return <Mail size={16} className="text-green-400" />;
      case 'reminder':
        return <Clock size={16} className="text-yellow-400" />;
      default:
        return <Mail size={16} className="text-gray-400" />;
    }
  };

  const getNotificationTitle = (type: EmailNotification['type']) => {
    switch (type) {
      case 'assignment':
        return 'Task Assignment';
      case 'update':
        return 'Task Update';
      case 'reminder':
        return 'Task Reminder';
      default:
        return 'Notification';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <Bell size={20} />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-dark-800 border border-dark-700 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-dark-700">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 border-b border-dark-700 hover:bg-dark-700 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white">
                          {getNotificationTitle(notification.type)}
                        </p>
                        <span className="text-xs text-gray-400">
                          {formatTime(notification.sentAt!)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        Sent to {notification.recipient.email}
                      </p>
                      {notification.reminderTime && (
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.reminderTime} minutes before
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-dark-700">
              <button
                onClick={() => {
                  EmailService.clearNotifications();
                  setNotifications([]);
                }}
                className="w-full text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 