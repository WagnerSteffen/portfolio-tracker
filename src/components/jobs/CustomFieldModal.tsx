'use client';

import React, { useState } from 'react';
import { X, Plus, Sliders } from 'lucide-react';
import { CustomFieldType } from '@/types/database';

interface CustomFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (label: string, key: string, fieldType: CustomFieldType, options: string[]) => Promise<void>;
}

export const CustomFieldModal: React.FC<CustomFieldModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [label, setLabel] = useState('');
  const [fieldType, setFieldType] = useState<CustomFieldType>('text');
  const [optionsStr, setOptionsStr] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    // Generate snake_case key from label
    const key = label
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="h-5 w-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Novo Campo Personalizado</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Rótulo / Nome do Campo
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Câmera Usada, Qtd. Fotos, Equipamento Auxiliar"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Tipo de Dado
            </label>
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value as CustomFieldType)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Opções da Seleção (separadas por vírgula)
              </label>
              <input
                type="text"
                placeholder="Ex: Opção A, Opção B, Opção C"
                value={optionsStr}
                onChange={(e) => setOptionsStr(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !label.trim()}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>{loading ? 'Salvando...' : 'Adicionar Campo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
