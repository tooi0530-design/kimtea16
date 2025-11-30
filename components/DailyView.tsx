import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, CheckCircle2, XCircle, Circle, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { Todo, TaskStatus } from '../types';
import { getDailyAdvice } from '../services/geminiService';

interface DailyViewProps {
  dateStr: string;
  todos: Todo[];
  onBack: () => void;
  onAddTodo: (text: string) => void;
  onToggleStatus: (id: string) => void;
  onDeleteTodo: (id: string) => void;
}

export const DailyView: React.FC<DailyViewProps> = ({
  dateStr,
  todos,
  onBack,
  onAddTodo,
  onToggleStatus,
  onDeleteTodo
}) => {
  const [newTodoText, setNewTodoText] = useState('');
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Format date nicely
  const formattedDate = new Date(dateStr).toLocaleDateString('ko-KR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newTodoText.trim()) {
      onAddTodo(newTodoText.trim());
      setNewTodoText('');
      setAdvice(null); // Reset advice when tasks change
      // Keep focus if needed, or blur. On mobile, keeping focus might keep keyboard up.
    }
  };

  const handleGetAdvice = async () => {
    if (isLoadingAdvice) return;
    setIsLoadingAdvice(true);
    const message = await getDailyAdvice(dateStr, todos);
    setAdvice(message);
    setIsLoadingAdvice(false);
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.SUCCESS:
        return <CheckCircle2 className="w-8 h-8 text-success" strokeWidth={1.5} />;
      case TaskStatus.FAILURE:
        return <XCircle className="w-8 h-8 text-failure" strokeWidth={1.5} />;
      default:
        return <Circle className="w-8 h-8 text-slate-300" strokeWidth={1.5} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Header */}
      <div className="flex items-center p-4 bg-surface shadow-sm z-10 sticky top-0">
        <button 
          onClick={onBack}
          className="p-2 mr-2 -ml-2 rounded-full hover:bg-slate-100 active:bg-slate-200 transition"
        >
          <ArrowLeft className="text-slate-700" size={24} />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-800">{formattedDate}</h2>
          <p className="text-xs text-slate-500">할 일 {todos.length}개</p>
        </div>
        <button
          onClick={handleGetAdvice}
          disabled={isLoadingAdvice}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold shadow-md active:scale-95 transition-transform"
        >
          {isLoadingAdvice ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          <span>AI 코칭</span>
        </button>
      </div>

      {/* AI Advice Section (Collapsible) */}
      {advice && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 border-b border-indigo-100 animate-fade-in">
          <div className="flex gap-3">
            <div className="min-w-[24px] pt-0.5">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Sparkles size={14} />
              </div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              "{advice}"
            </p>
          </div>
        </div>
      )}

      {/* Todo List */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-3 no-scrollbar">
        {todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Plus size={32} className="text-slate-300" />
            </div>
            <p>새로운 할 일을 추가해보세요</p>
          </div>
        ) : (
          todos.map((todo, index) => (
            <div 
              key={todo.id} 
              className={`
                group flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 
                transition-all duration-300
                ${todo.status === TaskStatus.SUCCESS ? 'bg-green-50/50' : ''}
                ${todo.status === TaskStatus.FAILURE ? 'bg-red-50/50' : ''}
              `}
            >
              <div className="text-sm font-bold text-slate-300 w-6 text-center">
                {index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`
                  text-base truncate transition-colors
                  ${todo.status === TaskStatus.SUCCESS ? 'text-slate-400 line-through' : 'text-slate-800'}
                  ${todo.status === TaskStatus.FAILURE ? 'text-slate-400' : ''}
                `}>
                  {todo.text}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleStatus(todo.id)}
                  className="active:scale-90 transition-transform focus:outline-none"
                  aria-label="Change Status"
                >
                  {getStatusIcon(todo.status)}
                </button>
                
                <button 
                  onClick={() => onDeleteTodo(todo.id)}
                  className="p-2 text-slate-300 hover:text-red-400 active:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area (Sticky Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="할 일을 입력하세요..."
            className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all outline-none"
          />
          <button 
            type="submit"
            disabled={!newTodoText.trim()}
            className="bg-primary disabled:bg-slate-300 text-white p-3 rounded-xl font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all flex items-center justify-center min-w-[52px]"
          >
            <Plus size={24} />
          </button>
        </form>
      </div>
      
      {/* Safe area spacer for modern phones with home indicators */}
      <div className="h-[env(safe-area-inset-bottom)] bg-white" />
    </div>
  );
};