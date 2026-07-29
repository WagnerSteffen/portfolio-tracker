'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, X, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Selecione uma data...',
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Parse current selected date safely
  const selectedDate = value ? (() => {
    try {
      const parsed = parseISO(value);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    } catch {
      return undefined;
    }
  })() : undefined;

  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleSelectDay = (date: Date | undefined) => {
    if (!date) {
      onChange('');
    } else {
      const formattedDate = format(date, 'yyyy-MM-dd');
      onChange(formattedDate);
    }
    setIsOpen(false);
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const formattedDate = format(today, 'yyyy-MM-dd');
    onChange(formattedDate);
    setIsOpen(false);
  };

  const formattedDisplay = value
    ? (() => {
        try {
          const parsed = parseISO(value);
          return isNaN(parsed.getTime()) ? value : format(parsed, 'dd/MM/yyyy');
        } catch {
          return value;
        }
      })()
    : '';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
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

      {/* Shadcn UI Calendar Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 theme-card border theme-border rounded-2xl p-3 shadow-2xl animate-fadeIn space-y-2 max-w-full">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelectDay}
            captionLayout="dropdown"
            startMonth={new Date(1980, 0)}
            endMonth={new Date(2040, 11)}
            locale={ptBR}
          />

          {/* Footer Shortcuts */}
          <div className="pt-2 border-t theme-border flex items-center justify-between text-xs px-2">
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
