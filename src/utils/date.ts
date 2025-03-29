import { eachDayOfInterval, endOfWeek, format, startOfWeek } from 'date-fns';

export const getCurrentWeekDates = () => {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 });
  const end = endOfWeek(now, { weekStartsOn: 1 });

  return eachDayOfInterval({ start, end }).map((date) => ({
    date,
    label: format(date, 'EEE'),
  }));
};
