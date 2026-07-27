'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Tag, FolderPlus } from 'lucide-react';

interface CategoryTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'category' | 'tag';
  onSave: (name: string, color: string) => Promise<void>;
}

const PRESET_COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#6b7280', // gray
];

export const CategoryTagModal: React.FC<CategoryTagModalProps> = ({
  isOpen,
  onClose,
  type,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSave(name.trim(), color);
      setName('');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="theme-card border theme-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5"
      >
        <div className="flex items-center justify-between border-b theme-border pb-3">
          <div className="flex items-center space-x-2">
            {type === 'category' ? (
              <FolderPlus className="h-5 w-5 text-indigo-500" />
            ) : (
              <Tag className="h-5 w-5 text-indigo-500" />
            )}
            <h3 className="text-lg font-bold theme-text">
              {type === 'category' ? 'Nova Categoria Comercial' : 'Nova Tag de Trabalho'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg theme-text-muted hover:theme-text hover:bg-zinc-500/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5">
              Nome da {type === 'category' ? 'Categoria' : 'Tag'}
            </label>
            <input
              type="text"
              required
              placeholder={type === 'category' ? 'Ex: B2B, Edital, Ensaio Autoral' : 'Ex: Fotografia, Vídeo, Branding'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full theme-input border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-2">
              Cor de Destaque
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c ? 'scale-110 border-white ring-2 ring-indigo-500' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-9 h-9 rounded-lg theme-input border theme-border cursor-pointer p-0.5"
              />
              <span className="text-xs font-mono theme-text-muted">{color}</span>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t theme-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm theme-text-muted hover:theme-text hover:bg-zinc-500/10 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>{loading ? 'Salvando...' : 'Criar Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
