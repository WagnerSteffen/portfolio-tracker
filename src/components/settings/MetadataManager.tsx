'use client';

import React, { useState } from 'react';
import {
  FolderPlus,
  Tag,
  Sliders,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { CommercialCategory, JobTag, CustomFieldDefinition } from '@/types/database';
import { CategoryTagModal } from '../jobs/CategoryTagModal';
import { CustomFieldModal } from '../jobs/CustomFieldModal';

interface MetadataManagerProps {
  categories: CommercialCategory[];
  tags: JobTag[];
  customFields: CustomFieldDefinition[];
  onCreateCategory: (name: string, color: string) => Promise<CommercialCategory>;
  onUpdateCategory: (id: string, name: string, color: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onCreateTag: (name: string, color: string) => Promise<JobTag>;
  onUpdateTag: (id: string, name: string, color: string) => Promise<void>;
  onDeleteTag: (id: string) => Promise<void>;
  onCreateCustomField: (
    label: string,
    key: string,
    fieldType: CustomFieldDefinition['field_type'],
    options: string[]
  ) => Promise<CustomFieldDefinition>;
  onDeleteCustomField: (id: string) => Promise<void>;
}

export const MetadataManager: React.FC<MetadataManagerProps> = ({
  categories,
  tags,
  customFields,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  onCreateCustomField,
  onDeleteCustomField,
}) => {
  const [modalType, setModalType] = useState<'category' | 'tag' | 'custom_field' | null>(null);

  // Edit inline states
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatColor, setEditCatColor] = useState('');

  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editTagName, setEditTagName] = useState('');
  const [editTagColor, setEditTagColor] = useState('');

  const startEditCategory = (cat: CommercialCategory) => {
    setEditingCatId(cat.id);
    setEditCatName(cat.name);
    setEditCatColor(cat.color);
  };

  const saveEditCategory = async (id: string) => {
    if (!editCatName.trim()) return;
    await onUpdateCategory(id, editCatName.trim(), editCatColor);
    setEditingCatId(null);
  };

  const startEditTag = (t: JobTag) => {
    setEditingTagId(t.id);
    setEditTagName(t.name);
    setEditTagColor(t.color);
  };

  const saveEditTag = async (id: string) => {
    if (!editTagName.trim()) return;
    await onUpdateTag(id, editTagName.trim(), editTagColor);
    setEditingTagId(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800">
        <h2 className="text-xl font-bold text-white">Configurations / Configurações do Sistema</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Gerencie categorias comerciais (B2C, B2B, Edital...), tags de trabalhos e campos personalizados dinâmicos do formulário.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Commercial Categories */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderPlus className="h-4 w-4 text-indigo-400" />
              Categorias Comerciais (N:N)
            </h3>
            <button
              onClick={() => setModalType('category')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nova</span>
            </button>
          </div>

          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs"
              >
                {editingCatId === cat.id ? (
                  <div className="flex items-center space-x-2 w-full pr-2">
                    <input
                      type="color"
                      value={editCatColor}
                      onChange={(e) => setEditCatColor(e.target.value)}
                      className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editCatName}
                      onChange={(e) => setEditCatName(e.target.value)}
                      className="bg-zinc-900 border border-zinc-700 text-white px-2 py-1 rounded text-xs w-full focus:outline-none"
                    />
                    <button
                      onClick={() => saveEditCategory(cat.id)}
                      className="p-1 text-emerald-400 hover:bg-zinc-800 rounded"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingCatId(null)}
                      className="p-1 text-zinc-400 hover:bg-zinc-800 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="font-semibold text-zinc-200">{cat.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => startEditCategory(cat)}
                        className="p-1 text-zinc-400 hover:text-white"
                        title="Editar"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir categoria "${cat.name}"?`)) onDeleteCategory(cat.id);
                        }}
                        className="p-1 text-zinc-400 hover:text-red-400"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Job Tags */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Tag className="h-4 w-4 text-purple-400" />
              Tags de Trabalhos (N:N)
            </h3>
            <button
              onClick={() => setModalType('tag')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nova</span>
            </button>
          </div>

          <div className="space-y-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs"
              >
                {editingTagId === tag.id ? (
                  <div className="flex items-center space-x-2 w-full pr-2">
                    <input
                      type="color"
                      value={editTagColor}
                      onChange={(e) => setEditTagColor(e.target.value)}
                      className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editTagName}
                      onChange={(e) => setEditTagName(e.target.value)}
                      className="bg-zinc-900 border border-zinc-700 text-white px-2 py-1 rounded text-xs w-full focus:outline-none"
                    />
                    <button
                      onClick={() => saveEditTag(tag.id)}
                      className="p-1 text-emerald-400 hover:bg-zinc-800 rounded"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingTagId(null)}
                      className="p-1 text-zinc-400 hover:bg-zinc-800 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                      <span className="font-semibold text-zinc-200">#{tag.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => startEditTag(tag)}
                        className="p-1 text-zinc-400 hover:text-white"
                        title="Editar"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir tag "${tag.name}"?`)) onDeleteTag(tag.id);
                        }}
                        className="p-1 text-zinc-400 hover:text-red-400"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Dynamic Custom Fields Table */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="h-4 w-4 text-indigo-400" />
            Definições de Campos Personalizados do Formulário
          </h3>
          <button
            onClick={() => setModalType('custom_field')}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Adicionar Campo</span>
          </button>
        </div>

        {customFields.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-bold">Rótulo (Label)</th>
                  <th className="py-3 px-4 font-bold">Chave Interna</th>
                  <th className="py-3 px-4 font-bold">Tipo</th>
                  <th className="py-3 px-4 font-bold">Opções (se houver)</th>
                  <th className="py-3 px-4 font-bold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {customFields.map((f) => (
                  <tr key={f.id} className="hover:bg-zinc-800/40">
                    <td className="py-3 px-4 font-semibold text-white">{f.label}</td>
                    <td className="py-3 px-4 font-mono text-zinc-400">{f.key}</td>
                    <td className="py-3 px-4 text-indigo-300 uppercase font-mono">{f.field_type}</td>
                    <td className="py-3 px-4 text-zinc-400">
                      {f.options && f.options.length > 0 ? f.options.join(', ') : '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Excluir definição do campo "${f.label}"?`)) onDeleteCustomField(f.id);
                        }}
                        className="p-1 text-zinc-400 hover:text-red-400"
                        title="Excluir Campo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-zinc-500 italic">Nenhum campo personalizado cadastrado.</p>
        )}
      </div>

      {/* Modals */}
      <CategoryTagModal
        isOpen={modalType === 'category'}
        onClose={() => setModalType(null)}
        type="category"
        onSave={async (name, color) => {
          await onCreateCategory(name, color);
        }}
      />

      <CategoryTagModal
        isOpen={modalType === 'tag'}
        onClose={() => setModalType(null)}
        type="tag"
        onSave={async (name, color) => {
          await onCreateTag(name, color);
        }}
      />

      <CustomFieldModal
        isOpen={modalType === 'custom_field'}
        onClose={() => setModalType(null)}
        onSave={async (label, key, fieldType, options) => {
          await onCreateCustomField(label, key, fieldType, options);
        }}
      />
    </div>
  );
};
