import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarDay } from '../types';

interface CalendarProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateClick: (dateStr: string) => void;
  todosByDate: Record<string, any[]>;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export const Calendar: React.FC<CalendarProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onDateClick,
  todosByDate
}) => {
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const startingDayIndex = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
    const daysInMonth = lastDayOfMonth.getDate();

    const days: CalendarDay[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayIndex - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const dateStr = new Date(year, month - 1, day + 1).toISOString().split('T')[0]; // Simple ISO fix
      days.push({
        date: dateStr,
        isCurrentMonth: false,
        isToday: false,
        hasTodos: false
      });
    }

    // Current month
    const todayStr = new Date().toISOString().split('T')[0];
    for (let i = 1; i <= daysInMonth; i++) {
      // Create date safely considering timezone offset for simple ISO string generation
      const d = new Date(year, month, i);
      const yearStr = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

      days.push({
        date: dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        hasTodos: (todosByDate[dateStr]?.length || 0) > 0
      });
    }

    // Next month padding
    const remainingSlots = 42 - days.length; // 6 rows * 7 cols
    for (let i = 1; i <= remainingSlots; i++) {
      const d = new Date(year, month + 1, i);
      const yearStr = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yearStr}-${monthStr}-${dayStr}`;
      
      days.push({
        date: dateStr,
        isCurrentMonth: false,
        isToday: false,
        hasTodos: false
      });
    }

    return days;
  }, [currentDate, todosByDate]);

  return (
    <div className="flex flex-col h-full bg-background p-4">
      <div className="flex items-center justify-between mb-8 pt-4">
        <h1 className="text-2xl font-bold text-slate-800">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </h1>
        <div className="flex gap-2">
          <button 
            onClick={onPrevMonth}
            className="p-2 rounded-full hover:bg-slate-100 active:scale-95 transition"
          >
            <ChevronLeft size={24} className="text-slate-600" />
          </button>
          <button 
            onClick={onNextMonth}
            className="p-2 rounded-full hover:bg-slate-100 active:scale-95 transition"
          >
            <ChevronRight size={24} className="text-slate-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day, idx) => (
          <div 
            key={day} 
            className={`text-center text-sm font-medium py-2 ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-slate-400'}`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => onDateClick(day.date)}
            className={`
              relative flex flex-col items-center justify-start pt-2 rounded-2xl transition-all duration-200
              ${!day.isCurrentMonth ? 'opacity-30' : 'opacity-100 hover:bg-white hover:shadow-sm'}
              ${day.isToday ? 'bg-primary/10 font-bold text-primary' : ''}
              active:scale-90
            `}
          >
            <span className={`text-lg ${day.isToday ? 'text-primary' : 'text-slate-700'}`}>
              {parseInt(day.date.split('-')[2])}
            </span>
            {day.hasTodos && (
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary"></span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};