import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays, subDays, startOfWeek, endOfWeek } from 'date-fns';

export const formatDate = (date: Date): string => {
  return format(date, 'MMM dd, yyyy');
};

export const formatTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

export const formatDateTime = (date: Date): string => {
  return format(date, 'MMM dd, yyyy HH:mm');
};

export const getMonthDays = (date: Date): Date[] => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
};

export const getWeekDays = (date: Date): Date[] => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

export const isSelectedDate = (date: Date, selectedDate: Date): boolean => {
  return isSameDay(date, selectedDate);
};

export const getNextDay = (date: Date): Date => {
  return addDays(date, 1);
};

export const getPreviousDay = (date: Date): Date => {
  return subDays(date, 1);
};

export const getHourSlots = (): string[] => {
  const slots: string[] = [];
  for (let i = 0; i < 24; i++) {
    slots.push(`${i.toString().padStart(2, '0')}:00`);
  }
  return slots;
};

export const getTaskTimeSlot = (time: string): number => {
  const [hours] = time.split(':').map(Number);
  return hours;
}; 