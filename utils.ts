export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getTodayDateString = (): string => {
  return formatDate(new Date());
};

export const formatTimeDisplay = (time: string): string => {
  return time;
};

export const getWeekDays = (startDate: Date = new Date()) => {
  const days = [];
  const current = new Date(startDate);
  // Adjust to start of week (Sunday)
  const dayOfWeek = current.getDay(); 
  current.setDate(current.getDate() - dayOfWeek); // Go to Sunday

  // Show 14 days (2 weeks) to ensure "Whole Week" visibility + Next Week context
  for (let i = 0; i < 14; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
};

export const parseDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const getDayLabel = (date: Date): string => {
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'Hoje';
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) return 'Amanhã';

  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date).replace('.', '');
};