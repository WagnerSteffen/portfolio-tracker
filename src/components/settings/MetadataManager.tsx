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
  Users,
  Search,
  Mail,
  Phone,
  FileText,
} from 'lucide-react';
import { CommercialCategory, JobTag, CustomFieldDefinition, Client } from '@/types/database';
import { CategoryTagModal } from '../jobs/CategoryTagModal';
import { CustomFieldModal } from '../jobs/CustomFieldModal';
import { ClientModal } from './ClientModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface MetadataManagerProps {
  categories: CommercialCategory[];
  tags: JobTag[];
  customFields: CustomFieldDefinition[];
  clients?: Client[];
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
  onUpdateCustomField?: (
    id: string,
    label: string,
    key: string,
    fieldType: CustomFieldDefinition['field_type'],
    options: string[]
  ) => Promise<void>;
  onDeleteCustomField: (id: string) => Promise<void>;
  onCreateClient?: (data: { name: string; email?: string; phone?: string; notes?: string }) => Promise<void>;
  onUpdateClient?: (id: string, data: { name: string; email?: string; phone?: string; notes?: string }) => Promise<void>;
  onDeleteClient?: (id: string) => Promise<void>;
}

export const MetadataManager: React.FC<MetadataManagerProps> = ({
  categories,
  tags,
  customFields,
  clients = [],
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  onCreateCustomField,
  onUpdateCustomField,
  onDeleteCategory: _onDeleteCategory,
  onCreateClient,
  onUpdateClient,
  onDeleteClient,
}) => {
  const [modalType, setModalType] = useState<'category' | 'tag' | 'custom_field' | 'client' | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingCustomField, setEditingCustomField] = useState<CustomFieldDefinition | null>(null);
  const [clientSearchQuery, setClientSearchQuery] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<{
    title: string;
    description: string;
    onConfirm: () => Promise<void> | void;
  } | null>(null);

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

  const openNewClientModal = () => {
    setEditingClient(null);
    setModalType('client');
  };

  const openEditClientModal = (client: Client) => {
    setEditingClient(client);
    setModalType('client');
  };

  const openNewCustomFieldModal = () => {
    setEditingCustomField(null);
    setModalType('custom_field');
  };

  const openEditCustomFieldModal = (field: CustomFieldDefinition) => {
    setEditingCustomField(field);
    setModalType('custom_field');
  };

  const filteredClients = clients.filter((c) => {
    const query = clientSearchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      c.name.toLowerCase().includes(query) ||
      (c.email && c.email.toLowerCase().includes(query)) ||
      (c.phone && c.phone.includes(query)) ||
      (c.notes && c.notes.toLowerCase().includes(query))
    );
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border theme-border">
        <h2 className="text-xl font-bold theme-text">Configurations / Configurações do Sistema</h2>
        <p className="text-xs theme-text-muted mt-1">
          Gerencie clientes cadastrados, categorias comerciais, tags de trabalhos e campos personalizados dinâmicos do formulário.
        </p>
      </div>

      {/* Section 0: Gestão de Clientes (CRUD) */}
      <div className="theme-card border p-6 rounded-2xl space-y-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b theme-border pb-3">
          <div>
            <h3 className="text-base font-bold theme-text flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" />
              <span>Gestão de Clientes ({clients.length})</span>
            </h3>
            <p className="text-xs theme-text-muted mt-0.5">
              Cadastre e edite clientes para autocompletar e vincular trabalhos no sistema.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 theme-text-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                className="w-full theme-input border rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {onCreateClient && (
              <button
                onClick={openNewClientModal}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Novo Cliente</span>
              </button>
            )}
          </div>
        </div>

        {filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="p-4 theme-card-subtle rounded-xl border theme-border space-y-2 relative group hover:border-indigo-500/40 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold theme-text">{client.name}</h4>
                    {client.created_at && (
                      <span className="text-[10px] theme-text-muted">
                        Cadastrado em {new Date(client.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    {onUpdateClient && (
                      <button
                        onClick={() => openEditClientModal(client)}
                        className="p-1 theme-text-muted hover:theme-text rounded transition"
                        title="Editar Cliente"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {onDeleteClient && (
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            title: 'Excluir Cliente',
                            description: `Tem certeza que deseja excluir o cliente "${client.name}"? Esta ação removerá o cadastro do banco de dados.`,
                            onConfirm: () => onDeleteClient(client.id),
                          })
                        }
                        className="p-1 theme-text-muted hover:text-red-500 rounded transition"
                        title="Excluir Cliente"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-xs theme-text-muted pt-1 border-t theme-border">
                  {client.email && (
                    <div className="flex items-center space-x-1.5">
                      <Mail className="h-3 w-3 text-indigo-400 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center space-x-1.5">
                      <Phone className="h-3 w-3 text-indigo-400 shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.notes && (
                    <div className="flex items-start space-x-1.5 text-[11px] italic pt-0.5">
                      <FileText className="h-3 w-3 text-zinc-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{client.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs theme-text-muted italic py-2">
            {clientSearchQuery
              ? `Nenhum cliente encontrado para "${clientSearchQuery}".`
              : 'Nenhum cliente cadastrado ainda. Clique em "Novo Cliente" acima para cadastrar.'}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Commercial Categories */}
        <div className="theme-card border p-6 rounded-2xl space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b theme-border pb-3">
            <h3 className="text-sm font-bold theme-text flex items-center gap-2">
              <FolderPlus className="h-4 w-4 text-indigo-500" />
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
                className="flex items-center justify-between p-3 theme-card-subtle rounded-xl border theme-border text-xs"
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
                      className="theme-input border theme-border theme-text px-2 py-1 rounded text-xs w-full focus:outline-none"
                    />
                    <button
                      onClick={() => saveEditCategory(cat.id)}
                      className="p-1 text-emerald-500 hover:bg-zinc-500/10 rounded"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingCatId(null)}
                      className="p-1 theme-text-muted hover:bg-zinc-500/10 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="font-semibold theme-text">{cat.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => startEditCategory(cat)}
                        className="p-1 theme-text-muted hover:theme-text"
                        title="Editar"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            title: 'Excluir Categoria',
                            description: `Tem certeza que deseja excluir a categoria "${cat.name}"?`,
                            onConfirm: () => onDeleteCategory(cat.id),
                          })
                        }
                        className="p-1 theme-text-muted hover:text-red-500"
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
        <div className="theme-card border p-6 rounded-2xl space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b theme-border pb-3">
            <h3 className="text-sm font-bold theme-text flex items-center gap-2">
              <Tag className="h-4 w-4 text-purple-500" />
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
                className="flex items-center justify-between p-3 theme-card-subtle rounded-xl border theme-border text-xs"
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
                      className="theme-input border theme-border theme-text px-2 py-1 rounded text-xs w-full focus:outline-none"
                    />
                    <button
                      onClick={() => saveEditTag(tag.id)}
                      className="p-1 text-emerald-500 hover:bg-zinc-500/10 rounded"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingTagId(null)}
                      className="p-1 theme-text-muted hover:bg-zinc-500/10 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                      <span className="font-semibold theme-text">#{tag.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => startEditTag(tag)}
                        className="p-1 theme-text-muted hover:theme-text"
                        title="Editar"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            title: 'Excluir Tag',
                            description: `Tem certeza que deseja excluir a tag "${tag.name}"?`,
                            onConfirm: () => onDeleteTag(tag.id),
                          })
                        }
                        className="p-1 theme-text-muted hover:text-red-500"
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

      {/* Section 3: Dynamic Custom Fields Grid */}
      <div className="theme-card border p-6 rounded-2xl space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b theme-border pb-3">
          <div>
            <h3 className="text-sm font-bold theme-text flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-500" />
              Campos Personalizados do Formulário
            </h3>
            <p className="text-xs theme-text-muted mt-0.5">
              Clique no botão de edição no canto superior direito do campo para alterar sua definição.
            </p>
          </div>
          <button
            onClick={openNewCustomFieldModal}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Adicionar Campo</span>
          </button>
        </div>

        {customFields.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {customFields.map((field) => (
              <div
                key={field.id}
                className="p-4 theme-card-subtle rounded-xl border theme-border flex flex-col justify-between space-y-3 relative group hover:border-indigo-500/40 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold theme-text">{field.label}</h4>
                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 inline-block mt-1 uppercase">
                      {field.field_type}
                    </span>
                  </div>

                  {/* Somente 1 botão com símbolo de edição no canto superior direito */}
                  <button
                    onClick={() => openEditCustomFieldModal(field)}
                    className="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                    title="Editar Campo Personalizado"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-[11px] theme-text-muted border-t theme-border pt-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="opacity-70">Chave:</span>
                    <span className="font-mono theme-text font-semibold">{field.key}</span>
                  </div>
                  {field.options && field.options.length > 0 && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="opacity-70 shrink-0">Opções:</span>
                      <span className="truncate theme-text font-medium">{field.options.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs theme-text-muted italic">Nenhum campo personalizado cadastrado.</p>
        )}
      </div>

      {/* Modals */}
      <ClientModal
        isOpen={modalType === 'client'}
        onClose={() => setModalType(null)}
        initialData={editingClient}
        onSave={async (data) => {
          if (editingClient && onUpdateClient) {
            await onUpdateClient(editingClient.id, data);
          } else if (onCreateClient) {
            await onCreateClient(data);
          }
        }}
      />

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
        onClose={() => {
          setEditingCustomField(null);
          setModalType(null);
        }}
        initialData={editingCustomField}
        onSave={async (label, key, fieldType, options) => {
          if (editingCustomField && onUpdateCustomField) {
            await onUpdateCustomField(editingCustomField.id, label, key, fieldType, options);
          } else {
            await onCreateCustomField(label, key, fieldType, options);
          }
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={deleteTarget?.title || 'Excluir Item'}
        description={deleteTarget?.description || ''}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteTarget.onConfirm();
            setDeleteTarget(null);
          }
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
