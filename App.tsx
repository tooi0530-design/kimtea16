import React, { useState, useEffect } from 'react';
import { Calendar } from './components/Calendar';
import { DailyView } from './components/DailyView';
import { Todo, TaskStatus } from './types';
import { v4 as uuidv4 } from 'uuid';

// Helper to generate UUID since we can't import 'uuid' in browser easily without setup
// Using a simple random string generator for this SPA context
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function App() {
  const [view, setView] = useState<'calendar' | 'day'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  
  // State for Todos
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const saved = localStorage.getItem('haru_todos');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Persist Todos
  useEffect(() => {
    localStorage.setItem('haru_todos', JSON.stringify(todos));
  }, [todos]);

  // Group todos by date for the calendar indicators
  const todosByDate = todos.reduce((acc, todo) => {
    if (!acc[todo.date]) acc[todo.date] = [];
    acc[todo.date].push(todo);
    return acc;
  }, {} as Record<string, Todo[]>);

  // Handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setView('day');
  };

  const handleBackToCalendar = () => {
    setView('calendar');
  };

  // CRUD for Todos
  const handleAddTodo = (text: string) => {
    const newTodo: Todo = {
      id: generateId(),
      text,
      status: TaskStatus.PENDING,
      date: selectedDateStr,
      createdAt: Date.now()
    };
    setTodos(prev => [...prev, newTodo]);
  };

  const handleToggleStatus = (id: string) => {
    setTodos(prev => prev.map(todo => {
      if (todo.id !== id) return todo;
      
      // Cycle: PENDING -> SUCCESS -> FAILURE -> PENDING
      let nextStatus = TaskStatus.PENDING;
      if (todo.status === TaskStatus.PENDING) nextStatus = TaskStatus.SUCCESS;
      else if (todo.status === TaskStatus.SUCCESS) nextStatus = TaskStatus.FAILURE;
      else if (todo.status === TaskStatus.FAILURE) nextStatus = TaskStatus.PENDING;

      return { ...todo, status: nextStatus };
    }));
  };

  const handleDeleteTodo = (id: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setTodos(prev => prev.filter(t => t.id !== id));
    }
  };

  // Filter todos for the selected date view
  const currentDayTodos = todos.filter(t => t.date === selectedDateStr);

  return (
    <div className="max-w-md mx-auto h-screen bg-white shadow-2xl overflow-hidden relative">
      <div 
        className={`
          absolute inset-0 transition-transform duration-300 ease-in-out
          ${view === 'calendar' ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Calendar 
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onDateClick={handleDateClick}
          todosByDate={todosByDate}
        />
      </div>

      <div 
        className={`
          absolute inset-0 transition-transform duration-300 ease-in-out bg-white
          ${view === 'day' ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {view === 'day' && (
          <DailyView 
            dateStr={selectedDateStr}
            todos={currentDayTodos}
            onBack={handleBackToCalendar}
            onAddTodo={handleAddTodo}
            onToggleStatus={handleToggleStatus}
            onDeleteTodo={handleDeleteTodo}
          />
        )}
      </div>
    </div>
  );
}