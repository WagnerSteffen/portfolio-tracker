'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Newspaper,
  Trash2,
  Loader2,
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
  ReportageLink,
  PERFORMER_LABELS,
  STATUS_LABELS,
  getJobPerformers,
} from '@/types/database';
import { CategoryTagModal } from './CategoryTagModal';
import { CustomFieldModal } from './CustomFieldModal';
import { formatExternalUrl } from '@/utils/url';
import { generateLinkMetadata } from '@/utils/url-title';
import { DatePicker } from '@/components/ui/DatePicker';
import { ClientCombobox } from '@/components/ui/ClientCombobox';
import { getJobs, getClients, createClient } from '@/lib/supabase/api';

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
  const formatBRLCurrency = (val: number) => {
    if (!val || val === 0) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const [title, setTitle] = useState(initialData?.title || '');
  const [clientName, setClientName] = useState(
    initialData?.clients && initialData.clients.length > 0
      ? initialData.clients.map((c) => c.name).join(', ')
      : initialData?.client_name || ''
  );
  const [performers, setPerformers] = useState<PerformerType[]>(
    getJobPerformers(initialData?.performer)
  );

  useEffect(() => {
    if (initialData) {
      setPerformers(getJobPerformers(initialData.performer));
    }
  }, [initialData]);

  const togglePerformer = (pKey: PerformerType) => {
    setPerformers((prev) => {
      if (prev.includes(pKey)) {
        if (prev.length <= 1) return prev; // Keep at least one performer selected
        return prev.filter((k) => k !== pKey);
      }
      return [...prev, pKey];
    });
  };

  const [jobDate, setJobDate] = useState(initialData?.job_date || new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState(initialData?.location || '');
  const [driveUrl, setDriveUrl] = useState(initialData?.drive_url || '');
  const [youtubeUrl, setYoutubeUrl] = useState(initialData?.youtube_url || '');
  const [value, setValue] = useState<number>(initialData?.value || 0);
  const [valueDisplay, setValueDisplay] = useState<string>(
    initialData?.value ? formatBRLCurrency(initialData.value) : ''
  );
  const [status, setStatus] = useState<JobStatus>(initialData?.status || 'completed');
  const [description, setDescription] = useState(initialData?.description || '');

  const [clientOptions, setClientOptions] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getJobs(), getClients().catch(() => [])])
      .then(([jobsList, clientsList]) => {
        if (!isMounted) return;
        const jobClientNames = jobsList.map((j) => j.client_name?.trim()).filter(Boolean) as string[];
        const dbClientNames = clientsList.map((c) => c.name.trim()).filter(Boolean);
        const uniqueClients = Array.from(new Set([...dbClientNames, ...jobClientNames])).sort((a, b) =>
          a.localeCompare(b, 'pt-BR')
        );
        setClientOptions(uniqueClients);
      })
      .catch((err) => console.error('Error fetching clients for combobox:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (initialData?.value) {
      setValue(initialData.value);
      setValueDisplay(formatBRLCurrency(initialData.value));
    } else if (!initialData) {
      setValue(0);
      setValueDisplay('');
    }
  }, [initialData]);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value.replace(/\D/g, '');
    if (!rawInput) {
      setValue(0);
      setValueDisplay('');
      return;
    }
    const numericValue = parseFloat(rawInput) / 100;
    setValue(numericValue);
    setValueDisplay(
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(numericValue)
    );
  };

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialData?.categories?.map((c) => c.id) || []
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialData?.tags?.map((t) => t.id) || []
  );

  const [customValues, setCustomValues] = useState<Record<string, unknown>>(
    initialData?.custom_fields || {}
  );

  const [reportageLinks, setReportageLinks] = useState<
    Array<{ id?: string; url: string; title: string; provider?: string | null; published_date?: string | null; loading?: boolean }>
  >(
    initialData?.reportage_links?.map((rl) => ({
      id: rl.id,
      url: rl.url,
      title: rl.title,
      provider: rl.provider,
      published_date: rl.published_date,
    })) || []
  );

  const addReportageLink = () => {
    setReportageLinks((prev) => [
      ...prev,
      { url: '', title: '', provider: '', published_date: '' },
    ]);
  };

  const removeReportageLink = (index: number) => {
    setReportageLinks((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateReportageLink = (
    index: number,
    field: 'url' | 'title' | 'published_date',
    value: string
  ) => {
    setReportageLinks((prev) => {
      const next = [...prev];
      const current = { ...next[index], [field]: value };

      if (field === 'url' && value.trim()) {
        const meta = generateLinkMetadata(value, current.title, current.published_date || undefined);
        if (!current.title) current.title = meta.title;
        current.provider = meta.provider;
        if (!current.published_date && meta.published_date) {
          current.published_date = meta.published_date;
        }
      }

      next[index] = current;
      return next;
    });
  };

  const fetchMetadataForLink = async (index: number) => {
    const link = reportageLinks[index];
    if (!link || !link.url.trim()) return;

    setReportageLinks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], loading: true };
      return next;
    });

    try {
      const res = await fetch(`/api/utils/metadata?url=${encodeURIComponent(link.url)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setReportageLinks((prev) => {
          const next = [...prev];
          next[index] = {
            ...next[index],
            title: json.data.title || next[index].title,
            provider: json.data.provider || next[index].provider,
            published_date: json.data.published_date || next[index].published_date,
            loading: false,
          };
          return next;
        });
      }
    } catch {
      setReportageLinks((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], loading: false };
        return next;
      });
    }
  };

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

  const handleCustomValueChange = (key: string, val: unknown) => {
    setCustomValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      let client_ids: string[] = [];
      if (clientName.trim()) {
        const clientsList = await getClients().catch(() => []);
        const existing = clientsList.find(
          (c) => c.name.toLowerCase() === clientName.trim().toLowerCase()
        );
        if (existing) {
          client_ids = [existing.id];
        } else {
          try {
            const newClient = await createClient(clientName.trim());
            client_ids = [newClient.id];
          } catch {
            // client creation fallback
          }
        }
      }

      const formData: JobFormData = {
        title: title.trim(),
        client_ids,
        client_name: clientName.trim(),
        performer: performers.join(','),
        job_date: jobDate,
        location: location.trim(),
        drive_url: formatExternalUrl(driveUrl),
        youtube_url: formatExternalUrl(youtubeUrl),
        value: Number(value) || 0,
        status,
        description: description.trim(),
        category_ids: selectedCategoryIds,
        tag_ids: selectedTagIds,
        custom_fields: customValues,
        reportage_links: reportageLinks
          .filter((l) => Boolean(l.url.trim()))
          .map((l) => ({
            id: l.id,
            url: formatExternalUrl(l.url),
            title: l.title.trim() || 'Reportagem',
            provider: l.provider,
            published_date: l.published_date || null,
          })),
      };

      await onSaveJob(formData);
      setSuccessMessage(initialData ? 'Trabalho atualizado com sucesso!' : 'Trabalho cadastrado com sucesso!');
      setTimeout(() => setSuccessMessage(''), 4000);

      if (!initialData) {
        setTitle('');
        setClientName('');
        setPerformers(['wagner']);
        setLocation('');
        setDriveUrl('');
        setYoutubeUrl('');
        setValue(0);
        setValueDisplay('');
        setDescription('');
        setSelectedCategoryIds([]);
        setSelectedTagIds([]);
        setCustomValues({});
        setReportageLinks([]);
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
      <div className="glass-panel p-6 rounded-2xl border theme-border flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold theme-text flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            {initialData ? 'Editar Trabalho' : 'Cadastrar Novo Trabalho'}
          </h2>
          <p className="text-xs theme-text-muted mt-1">
            Preencha os dados do projeto, links de portfólio (Google Drive / YouTube) e selecione as categorias N:N.
          </p>
        </div>
        {initialData && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold theme-card theme-text theme-border border transition"
          >
            Cancelar Edição
          </button>
        )}
      </div>

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-4 py-3 rounded-xl flex items-center justify-between animate-fadeIn text-sm">
          <span>{successMessage}</span>
          <Check className="h-4 w-4" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Informações Básicas */}
        <div className="theme-card border p-6 rounded-2xl space-y-5 shadow-sm">
          <h3 className="text-sm font-bold theme-text uppercase tracking-wider border-b theme-border pb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-500" />
            Informações do Trabalho
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5">
                Título / Nome do Trabalho *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Cobertura Fotográfica Casamento Marina & Pedro"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full theme-input border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Client Name */}
            <div>
              <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5">
                Nome do Cliente / Empresa
              </label>
              <ClientCombobox
                value={clientName}
                onChange={setClientName}
                clients={clientOptions}
                placeholder="Ex: Ana Clara ou Marca X"
              />
            </div>

            {/* Performer (Multi-Select) */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Executado por (Quem realizou) *</span>
                <span className="text-[10px] theme-text-muted font-normal">Pode selecionar múltiplos</span>
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {Object.entries(PERFORMER_LABELS).map(([key, val]) => {
                  const pKey = key as PerformerType;
                  const isSelected = performers.includes(pKey);
                  return (
                    <button
                      key={pKey}
                      type="button"
                      onClick={() => togglePerformer(pKey)}
                      className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
                        isSelected
                          ? `${val.badgeColor} ring-2 ring-indigo-500/30 shadow-sm`
                          : 'theme-card-subtle theme-text-muted theme-border hover:theme-text'
                      }`}
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>{val.label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 ml-1 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Job Date */}
            <div>
              <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5">
                Data do Trabalho / Evento *
              </label>
              <DatePicker
                value={jobDate}
                onChange={setJobDate}
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5">
                Local / Cidade / Estado
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 theme-text-muted" />
                <input
                  type="text"
                  placeholder="Ex: Florianópolis, SC"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full theme-input border rounded-xl pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5">
                Status do Projeto
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="w-full theme-input border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
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
              <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5">
                Valor Comercial / Orçamento (R$)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 theme-text-muted pointer-events-none" />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  value={valueDisplay}
                  onChange={handleCurrencyChange}
                  className="w-full theme-input border rounded-xl pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Categorias Comerciais & Tags (N:N) */}
        <div className="theme-card border p-6 rounded-2xl space-y-5 shadow-sm">
          {/* Categorias Comerciais */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold theme-text uppercase tracking-wider flex items-center gap-1.5">
                <Folder className="h-4 w-4 text-indigo-500" />
                Categorias Comerciais (B2B, B2C, Edital...) [N:N]
              </label>
              <button
                type="button"
                onClick={() => setModalType('category')}
                className="text-xs font-medium text-indigo-500 flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-lg transition"
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
                        : 'theme-card-subtle theme-text-muted theme-border hover:theme-text'
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
            </div>
          </div>

          {/* Tags */}
          <div className="pt-3 border-t theme-border">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold theme-text uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-indigo-500" />
                Tags do Trabalho (Fotografia, Vídeo, Branding...) [N:N]
              </label>
              <button
                type="button"
                onClick={() => setModalType('tag')}
                className="text-xs font-medium text-purple-500 flex items-center gap-1 bg-purple-500/10 px-2.5 py-1 rounded-lg transition"
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
                        : 'theme-card-subtle theme-text-muted theme-border hover:theme-text'
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
            </div>
          </div>
        </div>

        {/* Section 3: Portfólio & Links */}
        <div className="theme-card border p-6 rounded-2xl space-y-4 shadow-sm">
          <h3 className="text-sm font-bold theme-text uppercase tracking-wider border-b theme-border pb-2 flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-indigo-500" />
            Links do Portfólio & Mídias
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Google Drive URL */}
            <div>
              <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FolderPlus className="h-4 w-4 text-emerald-500" />
                Link da Pasta no Google Drive
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/drive/folders/..."
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                className="w-full theme-input border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* YouTube URL */}
            <div>
              <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <YouTubeIcon className="h-4 w-4 text-red-500" />
                Link do Vídeo / Teaser no YouTube
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full theme-input border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Sub-Section: Links de Reportagem / Mídia */}
          <div className="pt-4 border-t theme-border space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold theme-text uppercase tracking-wider flex items-center gap-1.5">
                <Newspaper className="h-4 w-4 text-indigo-500" />
                Links de Reportagem / Matérias na Mídia
              </label>
              <button
                type="button"
                onClick={addReportageLink}
                className="text-xs font-medium text-indigo-500 flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-lg transition hover:bg-indigo-500/20"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Adicionar Reportagem</span>
              </button>
            </div>

            {reportageLinks.length > 0 ? (
              <div className="space-y-3">
                {reportageLinks.map((link, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl border theme-border theme-card-subtle space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold theme-text-muted uppercase tracking-wider">
                        Reportagem #{index + 1} {link.provider ? `(${link.provider})` : ''}
                      </span>
                      <div className="flex items-center space-x-2">
                        {link.url.trim() && (
                          <button
                            type="button"
                            onClick={() => fetchMetadataForLink(index)}
                            disabled={link.loading}
                            className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 disabled:opacity-50"
                            title="Buscar título e data automaticamente da página"
                          >
                            {link.loading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Sparkles className="h-3 w-3 text-indigo-400" />
                            )}
                            <span>{link.loading ? 'Buscando...' : 'Obter Metadados'}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeReportageLink(index)}
                          className="p-1 text-zinc-400 hover:text-red-500 rounded-lg transition"
                          title="Remover link"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      {/* URL input */}
                      <div className="md:col-span-6">
                        <label className="block text-[11px] font-medium theme-text-muted mb-1">
                          URL da Notícia / Matéria *
                        </label>
                        <input
                          type="url"
                          placeholder="https://g1.globo.com/sc/... ou https://nsctotal.com.br/..."
                          value={link.url}
                          onChange={(e) => updateReportageLink(index, 'url', e.target.value)}
                          onBlur={() => {
                            if (link.url.trim() && !link.title) {
                              fetchMetadataForLink(index);
                            }
                          }}
                          className="w-full theme-input border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Title input */}
                      <div className="md:col-span-4">
                        <label className="block text-[11px] font-medium theme-text-muted mb-1">
                          Título Exibido (Autogerado ou Manual)
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Matéria sobre Exposição no G1"
                          value={link.title}
                          onChange={(e) => updateReportageLink(index, 'title', e.target.value)}
                          className="w-full theme-input border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Date input */}
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-medium theme-text-muted mb-1">
                          Data da Matéria
                        </label>
                        <DatePicker
                          value={link.published_date || ''}
                          onChange={(val) => updateReportageLink(index, 'published_date', val)}
                          placeholder="dd/mm/aaaa"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs theme-text-muted italic py-1">
                Nenhum link de reportagem adicionado ainda. Clique em &quot;Adicionar Reportagem&quot; acima para incluir matérias na mídia.
              </p>
            )}
          </div>
        </div>

        {/* Section 4: Dynamic Custom Fields */}
        <div className="theme-card border p-6 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b theme-border pb-2">
            <h3 className="text-sm font-bold theme-text uppercase tracking-wider flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-500" />
              Campos Personalizados (Formulário Dinâmico)
            </h3>
            <button
              type="button"
              onClick={() => setModalType('custom_field')}
              className="text-xs font-medium text-indigo-500 flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-lg transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Criar Novo Campo</span>
            </button>
          </div>

          {customFields.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customFields.map((field) => (
                <div key={field.id} className="theme-card-subtle p-3.5 rounded-xl border theme-border">
                  <label className="block text-xs font-semibold theme-text mb-1.5">
                    {field.label}
                  </label>

                  {field.field_type === 'text' && (
                    <input
                      type="text"
                      value={String(customValues[field.key] ?? '')}
                      onChange={(e) => handleCustomValueChange(field.key, e.target.value)}
                      className="w-full theme-input border rounded-lg px-3 py-2 text-sm focus:outline-none"
                    />
                  )}

                  {field.field_type === 'number' && (
                    <input
                      type="number"
                      value={String(customValues[field.key] ?? '')}
                      onChange={(e) => handleCustomValueChange(field.key, e.target.value)}
                      className="w-full theme-input border rounded-lg px-3 py-2 text-sm focus:outline-none"
                    />
                  )}

                  {field.field_type === 'date' && (
                    <DatePicker
                      value={String(customValues[field.key] ?? '')}
                      onChange={(val) => handleCustomValueChange(field.key, val)}
                    />
                  )}

                  {field.field_type === 'boolean' && (
                    <label className="flex items-center space-x-2 text-sm theme-text cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={Boolean(customValues[field.key])}
                        onChange={(e) => handleCustomValueChange(field.key, e.target.checked)}
                        className="w-4 h-4 rounded theme-input text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Sim / Confirmado</span>
                    </label>
                  )}

                  {field.field_type === 'select' && (
                    <select
                      value={String(customValues[field.key] ?? '')}
                      onChange={(e) => handleCustomValueChange(field.key, e.target.value)}
                      className="w-full theme-input border rounded-lg px-3 py-2 text-sm focus:outline-none"
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
            <p className="text-xs theme-text-muted italic py-2">
              Nenhum campo personalizado definido ainda.
            </p>
          )}
        </div>

        {/* Section 5: Observações */}
        <div className="theme-card border p-6 rounded-2xl space-y-4 shadow-sm">
          <label className="block text-xs font-semibold theme-text uppercase tracking-wider">
            Descrição do Projeto / Notas Comerciais
          </label>
          <textarea
            rows={4}
            placeholder="Detalhes adicionais sobre o briefing, escopo, referências ou entregas do projeto..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full theme-input border rounded-xl p-3.5 text-sm focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl text-sm font-medium theme-text-muted hover:theme-text transition"
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

      {/* Modals */}
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
