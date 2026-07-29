'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Sliders } from 'lucide-react';
import { CustomFieldDefinition, CustomFieldType } from '@/types/database';

interface CustomFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: CustomFieldDefinition | null;
  onSave: (label: string, key: string, fieldType: CustomFieldType, options: string[]) => Promise<void>;
}

export const CustomFieldModal: React.FC<CustomFieldModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const [label, setLabel] = useState('');
  const [fieldType, setFieldType] = useState<CustomFieldType>('text');
  const [optionsStr, setOptionsStr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setLabel(initialData.label || '');
      setFieldType(initialData.field_type || 'text');
      setOptionsStr(initialData.options ? initialData.options.join(', ') : '');
    } else {
      setLabel('');
      setFieldType('text');
      setOptionsStr('');
    }
  }, [initialData, isOpen]);

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
    if (!label.trim()) return;

    const key = initialData?.key || label
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    const options = fieldType === 'select' ? optionsStr.split(',').map((s) => s.trim()).filter(Boolean) : [];

    setLoading(true);
    try {
      await onSave(label.trim(), key, fieldType, options);
      setLabel('');
      setFieldType('text');
      setOptionsStr('');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar campo personalizado.');
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
            <Sliders className="h-5 w-5 text-indigo-500" />
            <h3 className="text-lg font-bold theme-text">
              {initialData ? 'Editar Campo Personalizado' : 'Novo Campo Personalizado'}
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
              Rótulo / Nome do Campo
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Câmera Usada, Qtd. Fotos, Equipamento Auxiliar"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full theme-input border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5">
              Tipo de Dado
            </label>
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value as CustomFieldType)}
              className="w-full theme-input border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="text">Texto Livre</option>
              <option value="number">Número</option>
              <option value="date">Data</option>
              <option value="boolean">Sim / Não (Checkbox)</option>
              <option value="select">Seleção Única (Dropdown)</option>
            </select>
          </div>

          {fieldType === 'select' && (
            <div>
              <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5">
                Opções da Seleção (separadas por vírgula)
              </label>
              <input
                type="text"
                placeholder="Ex: Opção A, Opção B, Opção C"
                value={optionsStr}
                onChange={(e) => setOptionsStr(e.target.value)}
                className="w-full theme-input border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

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
              disabled={loading || !label.trim()}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>{loading ? 'Salvando...' : initialData ? 'Salvar Alterações' : 'Adicionar Campo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
