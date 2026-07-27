'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Selecione uma data...',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Parse current selected date or fallback to today
  const selectedDate = value ? parseISO(value) : null;
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate || new Date());

  const containerRef = useRef<HTMLDivElement>(null);

  // Update current month view when value changes externally
  useEffect(() => {
    if (value) {
      try {
        const parsed = parseISO(value);
        if (!isNaN(parsed.getTime())) {
          setCurrentMonth(parsed);
        }
      } catch {}
    }
  }, [value]);

  // Close popover on outside click or ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handleSelectDay = (day: Date) => {
    const formattedDate = format(day, 'yyyy-MM-dd');
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const formattedDate = format(today, 'yyyy-MM-dd');
    setCurrentMonth(today);
    onChange(formattedDate);
    setIsOpen(false);
  };

  // Generate calendar days matrix
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const formattedDisplay = value
    ? (() => {
        try {
          const parsed = parseISO(value);
          return format(parsed, 'dd/MM/yyyy');
        } catch {
          return value;
        }
      })()
    : '';

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full theme-input border rounded-xl pl-9 pr-3.5 py-2.5 text-sm flex items-center justify-between cursor-pointer transition select-none ${
          isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''
        }`}
      >
        <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-indigo-500 pointer-events-none" />
        <span className={formattedDisplay ? 'theme-text font-medium' : 'theme-text-muted'}>
          {formattedDisplay || placeholder}
        </span>

        <div className="flex items-center space-x-1">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 text-zinc-400 hover:text-zinc-200 transition rounded-md"
              title="Limpar data"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Hidden native input for HTML form validation */}
      <input
        type="text"
        required={required}
        value={value}
        onChange={() => {}}
        tabIndex={-1}
        className="opacity-0 absolute inset-0 pointer-events-none -z-10"
      />

      {/* Shadcn-Style Calendar Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 w-72 sm:w-80 theme-card border theme-border rounded-2xl p-4 shadow-2xl animate-fadeIn space-y-3">
          {/* Calendar Header Navigation */}
          <div className="flex items-center justify-between pb-2 border-b theme-border">
            <span className="text-sm font-bold theme-text capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg theme-text-muted hover:theme-text hover:bg-zinc-500/10 transition"
                title="Mês Anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg theme-text-muted hover:theme-text hover:bg-zinc-500/10 transition"
                title="Próximo Mês"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map((d) => (
              <span key={d} className="text-[11px] font-semibold theme-text-muted py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDay = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-9 w-full rounded-xl text-xs font-medium flex items-center justify-center transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                      : isTodayDay
                      ? 'border border-indigo-500 text-indigo-500 font-bold hover:bg-indigo-500/10'
                      : isCurrentMonth
                      ? 'theme-text hover:bg-zinc-500/15'
                      : 'theme-text-muted opacity-30 hover:opacity-60'
                  }`}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          {/* Footer Shortcuts */}
          <div className="pt-2 border-t theme-border flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-indigo-500 hover:text-indigo-400 font-semibold px-2 py-1 rounded-lg hover:bg-indigo-500/10 transition flex items-center gap-1"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Hoje ({format(new Date(), 'dd/MM')})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="theme-text-muted hover:theme-text px-2 py-1 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
