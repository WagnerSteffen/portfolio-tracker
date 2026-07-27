'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, Check, ChevronDown, Sparkles } from 'lucide-react';

interface ClientComboboxProps {
  value: string;
  onChange: (value: string) => void;
  clients: string[];
  placeholder?: string;
}

export const ClientCombobox: React.FC<ClientComboboxProps> = ({
  value,
  onChange,
  clients,
  placeholder = 'Ex: Ana Clara ou Marca X',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter clients matching typed search term
  const filteredClients = clients.filter((client) =>
    client.toLowerCase().includes(value.toLowerCase().trim())
  );

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

  const handleSelectClient = (clientName: string) => {
    onChange(clientName);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <User className="absolute left-3 top-3 h-4 w-4 theme-text-muted pointer-events-none" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          className="w-full theme-input border rounded-xl pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
        />
        {clients.length > 0 && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-2.5 top-3 theme-text-muted hover:theme-text transition"
            title="Ver clientes cadastrados"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Dropdown Suggestions Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-full theme-card border theme-border rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto animate-fadeIn divide-y theme-border">
          <div className="px-3 py-2 theme-card-subtle flex items-center justify-between text-[11px] font-semibold theme-text-muted uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              Clientes na Base de Dados ({filteredClients.length})
            </span>
          </div>

          {filteredClients.length > 0 ? (
            <div className="py-1">
              {filteredClients.map((client) => {
                const isSelected = value.trim().toLowerCase() === client.toLowerCase();
                return (
                  <button
                    key={client}
                    type="button"
                    onClick={() => handleSelectClient(client)}
                    className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-indigo-600/15 text-indigo-500 font-semibold'
                        : 'theme-text hover:bg-zinc-500/10'
                    }`}
                  >
                    <span>{client}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-indigo-500" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-3.5 text-center text-xs theme-text-muted italic">
              {value.trim()
                ? `Nenhum cliente existente para "${value.trim()}". (Será cadastrado novo cliente)`
                : 'Nenhum cliente cadastrado ainda.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
