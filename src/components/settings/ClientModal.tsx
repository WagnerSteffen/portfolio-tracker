'use client';

import React, { useState, useEffect } from 'react';
import { X, UserCheck, Loader2 } from 'lucide-react';
import { Client } from '@/types/database';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Client | null;
  onSave: (data: { name: string; email?: string; phone?: string; notes?: string }) => Promise<void>;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setNotes('');
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setErrorMsg('');
    try {
      await onSave({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('Erro ao salvar cliente. Verifique se o nome já existe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg theme-card border theme-border rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b theme-border pb-3">
          <h3 className="text-base font-bold theme-text flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-indigo-500" />
            <span>{initialData ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5">
              Nome do Cliente / Empresa *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Ana Clara Souza ou Marca X"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full theme-input border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5">
                E-mail (Opcional)
              </label>
              <input
                type="email"
                placeholder="cliente@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full theme-input border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5">
                Telefone / WhatsApp (Opcional)
              </label>
              <input
                type="text"
                placeholder="(48) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full theme-input border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5">
              Observações / Notas (Opcional)
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Contato principal do departamento de marketing..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full theme-input border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t theme-border flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold theme-card-subtle theme-text-muted hover:theme-text transition border theme-border"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{initialData ? 'Salvar Alterações' : 'Cadastrar Cliente'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
