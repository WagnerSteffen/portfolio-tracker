'use client';

import React, { useState } from 'react';
import {
  FolderPlus,
  Plus,
  Tag,
  Folder,
  Calendar,
  MapPin,
  User,
  DollarSign,
  FileText,
  Sliders,
  Check,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import { YouTubeIcon } from '@/components/icons/YouTubeIcon';
import {
  Job,
  JobFormData,
  CommercialCategory,
  JobTag,
  CustomFieldDefinition,
  PerformerType,
  JobStatus,
  PERFORMER_LABELS,
  STATUS_LABELS,
} from '@/types/database';
import { CategoryTagModal } from './CategoryTagModal';
import { CustomFieldModal } from './CustomFieldModal';

interface JobFormProps {
  initialData?: Job | null;
  categories: CommercialCategory[];
  tags: JobTag[];
  customFields: CustomFieldDefinition[];
  onSaveJob: (formData: JobFormData) => Promise<void>;
  onCreateCategory: (name: string, color: string) => Promise<CommercialCategory>;
  onCreateTag: (name: string, color: string) => Promise<JobTag>;
  onCreateCustomField: (
    label: string,
    key: string,
    fieldType: CustomFieldDefinition['field_type'],
    options: string[]
  ) => Promise<CustomFieldDefinition>;
  onCancel?: () => void;
}

export const JobForm: React.FC<JobFormProps> = ({
  initialData,
  categories,
  tags,
  customFields,
  onSaveJob,
  onCreateCategory,
  onCreateTag,
  onCreateCustomField,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [clientName, setClientName] = useState(initialData?.client_name || '');
  const [performer, setPerformer] = useState<PerformerType>(initialData?.performer || 'wagner');
  const [jobDate, setJobDate] = useState(initialData?.job_date || new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState(initialData?.location || '');
  const [driveUrl, setDriveUrl] = useState(initialData?.drive_url || '');
  const [youtubeUrl, setYoutubeUrl] = useState(initialData?.youtube_url || '');
  const [value, setValue] = useState<number>(initialData?.value || 0);
  const [status, setStatus] = useState<JobStatus>(initialData?.status || 'completed');
  const [description, setDescription] = useState(initialData?.description || '');

  // Category & Tag selection arrays (N:N)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialData?.categories?.map((c) => c.id) || []
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialData?.tags?.map((t) => t.id) || []
  );

  // Dynamic Custom Fields State
  const [customValues, setCustomValues] = useState<Record<string, any>>(
    initialData?.custom_fields || {}
  );

  // Modals state
  const [modalType, setModalType] = useState<'category' | 'tag' | 'custom_field' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((tagId) => tagId !== id) : [...prev, id]
    );
  };

  const handleCustomValueChange = (key: string, val: any) => {
    setCustomValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const formData: JobFormData = {
        title: title.trim(),
        client_name: clientName.trim(),
        performer,
        job_date: jobDate,
        location: location.trim(),
        drive_url: driveUrl.trim(),
        youtube_url: youtubeUrl.trim(),
        value: Number(value) || 0,
        status,
        description: description.trim(),
        category_ids: selectedCategoryIds,
        tag_ids: selectedTagIds,
        custom_fields: customValues,
      };

      await onSaveJob(formData);
      setSuccessMessage(initialData ? 'Trabalho atualizado com sucesso!' : 'Trabalho cadastrado com sucesso!');
      setTimeout(() => setSuccessMessage(''), 4000);

      if (!initialData) {
        // Reset form for next entry
        setTitle('');
        setClientName('');
        setLocation('');
        setDriveUrl('');
        setYoutubeUrl('');
        setValue(0);
        setDescription('');
        setSelectedCategoryIds([]);
        setSelectedTagIds([]);
        setCustomValues({});
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar trabalho.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            {initialData ? 'Editar Trabalho' : 'Cadastrar Novo Trabalho'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Preencha os dados do projeto, links de portfólio (Google Drive / YouTube) e selecione as categorias N:N.
          </p>
        </div>
        {initialData && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-300 hover:text-white transition"
          >
            Cancelar Edição
          </button>
        )}
      </div>

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl flex items-center justify-between animate-fadeIn text-sm">
          <span>{successMessage}</span>
          <Check className="h-4 w-4" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Informações Básicas */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl space-y-5">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-400" />
            Informações do Trabalho
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Título / Nome do Trabalho *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Cobertura Fotográfica Casamento Marina & Pedro"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Client Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Nome do Cliente / Empresa
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Ex: Ana Clara ou Marca X"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Performer ("Quem fez?") */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Executado por (Quem realizou) *
              </label>
              <select
                value={performer}
                onChange={(e) => setPerformer(e.target.value as PerformerType)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {Object.entries(PERFORMER_LABELS).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Date */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Data do Trabalho / Evento *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="date"
                  required
                  value={jobDate}
                  onChange={(e) => setJobDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Local / Cidade / Estado
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Ex: Florianópolis, SC"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Status do Projeto
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {Object.entries(STATUS_LABELS).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Value (R$) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Valor Comercial / Orçamento (R$)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={value || ''}
                  onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Categorias Comerciais & Tags (N:N) */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl space-y-5">
          {/* Categorias Comerciais (N:N) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Folder className="h-4 w-4 text-indigo-400" />
                Categorias Comerciais (B2B, B2C, Edital...) [N:N]
              </label>
              <button
                type="button"
                onClick={() => setModalType('category')}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-2.5 py-1 rounded-lg transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Nova Categoria</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {categories.map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 ml-1 text-white" />}
                  </button>
                );
              })}
              {categories.length === 0 && (
                <p className="text-xs text-zinc-500 italic">Nenhuma categoria cadastrada.</p>
              )}
            </div>
          </div>

          {/* Tags do Trabalho (N:N) */}
          <div className="pt-3 border-t border-zinc-800/80">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-indigo-400" />
                Tags do Trabalho (Fotografia, Vídeo, Branding...) [N:N]
              </label>
              <button
                type="button"
                onClick={() => setModalType('tag')}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-2.5 py-1 rounded-lg transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Nova Tag</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {tags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span>#{tag.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 ml-1 text-white" />}
                  </button>
                );
              })}
              {tags.length === 0 && (
                <p className="text-xs text-zinc-500 italic">Nenhuma tag cadastrada.</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Portfólio & Links (Google Drive & YouTube) */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-indigo-400" />
            Links do Portfólio & Mídias
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Google Drive URL */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FolderPlus className="h-4 w-4 text-emerald-400" />
                Link da Pasta no Google Drive
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/drive/folders/..."
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Link da pasta do cliente com entregáveis de alta resolução.
              </p>
            </div>

            {/* YouTube URL */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <YouTubeIcon className="h-4 w-4 text-red-500" />
                Link do Vídeo / Teaser no YouTube
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Vídeo do projeto, reels ou showreel final.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Campos Personalizados Dinâmicos */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-400" />
              Campos Personalizados (Formulário Dinâmico)
            </h3>
            <button
              type="button"
              onClick={() => setModalType('custom_field')}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-2.5 py-1 rounded-lg transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Criar Novo Campo</span>
            </button>
          </div>

          {customFields.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customFields.map((field) => (
                <div key={field.id} className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    {field.label}
                  </label>

                  {field.field_type === 'text' && (
                    <input
                      type="text"
                      value={customValues[field.key] || ''}
                      onChange={(e) => handleCustomValueChange(field.key, e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  )}

                  {field.field_type === 'number' && (
                    <input
                      type="number"
                      value={customValues[field.key] || ''}
                      onChange={(e) => handleCustomValueChange(field.key, e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  )}

                  {field.field_type === 'date' && (
                    <input
                      type="date"
                      value={customValues[field.key] || ''}
                      onChange={(e) => handleCustomValueChange(field.key, e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  )}

                  {field.field_type === 'boolean' && (
                    <label className="flex items-center space-x-2 text-sm text-zinc-300 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={Boolean(customValues[field.key])}
                        onChange={(e) => handleCustomValueChange(field.key, e.target.checked)}
                        className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Sim / Confirmado</span>
                    </label>
                  )}

                  {field.field_type === 'select' && (
                    <select
                      value={customValues[field.key] || ''}
                      onChange={(e) => handleCustomValueChange(field.key, e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Selecione uma opção...</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic py-2">
              Nenhum campo personalizado definido ainda. Clique em "Criar Novo Campo" acima para adicionar novas propriedades dynamicamente.
            </p>
          )}
        </div>

        {/* Section 5: Observações e Descrição */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl space-y-4">
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Descrição do Projeto / Notas Comerciais
          </label>
          <textarea
            rows={4}
            placeholder="Detalhes adicionais sobre o briefing, escopo, referências ou entregas do projeto..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            <span>{submitting ? 'Salvando...' : initialData ? 'Salvar Alterações' : 'Cadastrar Trabalho'}</span>
          </button>
        </div>
      </form>

      {/* Modals for creating category / tag / custom field inline */}
      <CategoryTagModal
        isOpen={modalType === 'category'}
        onClose={() => setModalType(null)}
        type="category"
        onSave={async (name, color) => {
          const created = await onCreateCategory(name, color);
          setSelectedCategoryIds((prev) => [...prev, created.id]);
        }}
      />

      <CategoryTagModal
        isOpen={modalType === 'tag'}
        onClose={() => setModalType(null)}
        type="tag"
        onSave={async (name, color) => {
          const created = await onCreateTag(name, color);
          setSelectedTagIds((prev) => [...prev, created.id]);
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
