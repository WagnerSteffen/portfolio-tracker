'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  Filter,
  ArrowUpDown,
  X,
  FolderPlus,
  Calendar,
  DollarSign,
  PlusCircle,
  Eye,
  Edit2,
  Trash2,
  User,
  Tag,
  Folder,
  Newspaper,
} from 'lucide-react';
import { YouTubeIcon } from '@/components/icons/YouTubeIcon';
import {
  Job,
  CommercialCategory,
  JobTag,
  PerformerType,
  CustomFieldDefinition,
  PERFORMER_LABELS,
  STATUS_LABELS,
  getJobPerformers,
} from '@/types/database';
import { JobCard } from './JobCard';
import { JobDetailModal } from './JobDetailModal';
import { formatExternalUrl } from '@/utils/url';
import { DatePicker } from '@/components/ui/DatePicker';
import { CustomSelect, SelectOption } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface JobsExplorerProps {
  jobs: Job[];
  categories: CommercialCategory[];
  tags: JobTag[];
  customFields: CustomFieldDefinition[];
  onEditJob: (job: Job) => void;
  onDeleteJob: (id: string) => void;
  onAddNewJob: () => void;
}

type SortOption = 'date_desc' | 'date_asc' | 'value_desc' | 'title_asc';
type DateFilterMode = 'all' | 'this_year' | 'last_12_months' | 'specific_year' | 'custom_range';

export const JobsExplorer: React.FC<JobsExplorerProps> = ({
  jobs,
  categories,
  tags,
  customFields,
  onEditJob,
  onDeleteJob,
  onAddNewJob,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');

  const [selectedPerformers, setSelectedPerformers] = useState<PerformerType[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [onlyDrive, setOnlyDrive] = useState(false);
  const [onlyYoutube, setOnlyYoutube] = useState(false);

  // Date Filter States
  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>('all');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [deletingJob, setDeletingJob] = useState<Job | null>(null);

  // Extract unique available years from jobs
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    jobs.forEach((j) => {
      if (j.job_date) {
        const y = new Date(j.job_date + 'T00:00:00').getFullYear();
        if (!isNaN(y)) years.add(y);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [jobs]);

  const togglePerformer = (p: PerformerType) => {
    setSelectedPerformers((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const toggleCategoryFilter = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleTagFilter = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedPerformers([]);
    setSelectedCategoryIds([]);
    setSelectedTagIds([]);
    setOnlyDrive(false);
    setOnlyYoutube(false);
    setDateFilterMode('all');
    setSelectedYear(new Date().getFullYear());
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters =
    searchTerm ||
    selectedPerformers.length > 0 ||
    selectedCategoryIds.length > 0 ||
    selectedTagIds.length > 0 ||
    onlyDrive ||
    onlyYoutube ||
    dateFilterMode !== 'all';

  const filteredAndSortedJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchesTitle = job.title.toLowerCase().includes(term);
          const clientNames = (job.clients && job.clients.length > 0
            ? job.clients.map((c) => c.name).join(' ')
            : job.client_name || '').toLowerCase();
          const matchesClient = clientNames.includes(term);
          const matchesLocation = job.location?.toLowerCase().includes(term);
          const matchesDesc = job.description?.toLowerCase().includes(term);
          if (!matchesTitle && !matchesClient && !matchesLocation && !matchesDesc) {
            return false;
          }
        }

        if (selectedPerformers.length > 0) {
          const jobPerformers = getJobPerformers(job.performer);
          const hasPerformer = selectedPerformers.some((p) => jobPerformers.includes(p));
          if (!hasPerformer) return false;
        }

        if (selectedCategoryIds.length > 0) {
          const jobCatIds = job.categories?.map((c) => c.id) || [];
          const hasCategory = selectedCategoryIds.some((id) => jobCatIds.includes(id));
          if (!hasCategory) return false;
        }

        if (selectedTagIds.length > 0) {
          const jobTagIds = job.tags?.map((t) => t.id) || [];
          const hasTag = selectedTagIds.some((id) => jobTagIds.includes(id));
          if (!hasTag) return false;
        }

        if (onlyDrive && !job.drive_url) return false;

        if (onlyYoutube && !job.youtube_url) return false;

        // Date Filter Evaluation
        if (dateFilterMode !== 'all') {
          if (!job.job_date) return false;
          const jobDateObj = new Date(job.job_date + 'T00:00:00');
          const now = new Date();

          if (dateFilterMode === 'this_year') {
            if (jobDateObj.getFullYear() !== now.getFullYear()) return false;
          } else if (dateFilterMode === 'last_12_months') {
            const twelveMonthsAgo = new Date();
            twelveMonthsAgo.setFullYear(now.getFullYear() - 1);
            if (jobDateObj < twelveMonthsAgo) return false;
          } else if (dateFilterMode === 'specific_year') {
            if (jobDateObj.getFullYear() !== Number(selectedYear)) return false;
          } else if (dateFilterMode === 'custom_range') {
            if (startDate) {
              const startObj = new Date(startDate + 'T00:00:00');
              if (jobDateObj < startObj) return false;
            }
            if (endDate) {
              const endObj = new Date(endDate + 'T23:59:59');
              if (jobDateObj > endObj) return false;
            }
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return new Date(b.job_date).getTime() - new Date(a.job_date).getTime();
        }
        if (sortBy === 'date_asc') {
          return new Date(a.job_date).getTime() - new Date(b.job_date).getTime();
        }
        if (sortBy === 'value_desc') {
          return (b.value || 0) - (a.value || 0);
        }
        if (sortBy === 'title_asc') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [
    jobs,
    searchTerm,
    selectedPerformers,
    selectedCategoryIds,
    selectedTagIds,
    onlyDrive,
    onlyYoutube,
    dateFilterMode,
    selectedYear,
    startDate,
  ]);

  // Options for Shadcn CustomSelect Dropdowns
  const performerOptions: SelectOption[] = useMemo(
    () => [
      { value: 'all', label: 'Todos os Executantes' },
      ...((['wagner', 'daiana', 'aflora', 'joint'] as PerformerType[]).map((p) => ({
        value: p,
        label: PERFORMER_LABELS[p].label,
      }))),
    ],
    []
  );

  const categoryOptions: SelectOption[] = useMemo(
    () => [
      { value: 'all', label: 'Todas as Categorias' },
      ...categories.map((cat) => ({
        value: cat.id,
        label: cat.name,
      })),
    ],
    [categories]
  );

  const tagOptions: SelectOption[] = useMemo(
    () => [
      { value: 'all', label: 'Todas as Tags' },
      ...tags.map((tag) => ({
        value: tag.id,
        label: `#${tag.name}`,
      })),
    ],
    [tags]
  );

  const dateOptions: SelectOption[] = useMemo(
    () => [
      { value: 'all', label: 'Todas as Datas' },
      { value: 'this_year', label: `Este Ano (${new Date().getFullYear()})` },
      { value: 'last_12_months', label: 'Últimos 12 Meses' },
      { value: 'specific_year', label: 'Ano Específico...' },
      { value: 'custom_range', label: 'Intervalo (Range)...' },
    ],
    []
  );

  const yearOptions: SelectOption[] = useMemo(
    () =>
      availableYears.map((y) => ({
        value: String(y),
        label: `Ano ${y}`,
      })),
    [availableYears]
  );

  const mediaOptions: SelectOption[] = useMemo(
    () => [
      { value: 'all', label: 'Todas as Mídias' },
      { value: 'drive', label: 'Com Google Drive' },
      { value: 'youtube', label: 'Com YouTube' },
      { value: 'both', label: 'Com Drive & YouTube' },
    ],
    []
  );

  const sortSelectOptions: SelectOption[] = useMemo(
    () => [
      { value: 'date_desc', label: 'Mais Recentes' },
      { value: 'date_asc', label: 'Mais Antigos' },
      { value: 'value_desc', label: 'Maior Valor R$' },
      { value: 'title_asc', label: 'Título A-Z' },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="glass-panel p-4 md:p-6 rounded-2xl border theme-border space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 theme-text-muted" />
            <input
              type="text"
              placeholder="Buscar por título, cliente, local ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full theme-input border rounded-xl pl-10 pr-9 py-2.5 text-xs md:text-sm focus:outline-none focus:border-indigo-500 shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs theme-text-muted hover:theme-text"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Controls: View Mode, Sort, Mobile Filter, Add New */}
          <div className="flex items-center flex-wrap gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center theme-input p-1 rounded-xl border theme-border">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'theme-text-muted hover:theme-text'
                }`}
                title="Visualização em Grade"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'theme-text-muted hover:theme-text'
                }`}
                title="Visualização em Tabela"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Sort Select */}
            <div className="w-36 sm:w-40">
              <CustomSelect
                value={sortBy}
                onChange={(val) => setSortBy(val as SortOption)}
                options={sortSelectOptions}
                icon={<ArrowUpDown className="h-3.5 w-3.5" />}
              />
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="md:hidden flex items-center space-x-1 px-3 py-2 theme-card border theme-border rounded-xl text-xs theme-text"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Filtros</span>
            </button>

            {/* Add New Job Button */}
            <button
              onClick={onAddNewJob}
              className="hidden sm:flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Novo</span>
            </button>
          </div>
        </div>

        {/* Filter Pills / Multi-Filter Bar */}
        <div className={`space-y-4 pt-3 border-t theme-border ${showFiltersMobile ? 'block' : 'hidden md:block'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold theme-text-muted uppercase tracking-wider">Filtros Avançados:</span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-indigo-500 font-medium underline"
              >
                Limpar todos os filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 items-start">
            {/* 1. Performer Filter Dropdown */}
            <div>
              <span className="text-[11px] theme-text-muted font-semibold uppercase block mb-1.5 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-indigo-500" />
                Quem fez?
              </span>
              <CustomSelect
                value={selectedPerformers.length === 1 ? selectedPerformers[0] : 'all'}
                onChange={(val) => {
                  if (val === 'all') setSelectedPerformers([]);
                  else setSelectedPerformers([val as PerformerType]);
                }}
                options={performerOptions}
              />
            </div>

            {/* 2. Commercial Category Filter Dropdown */}
            <div>
              <span className="text-[11px] theme-text-muted font-semibold uppercase block mb-1.5 flex items-center gap-1">
                <Folder className="h-3.5 w-3.5 text-indigo-500" />
                Categorias
              </span>
              <CustomSelect
                value={selectedCategoryIds.length === 1 ? selectedCategoryIds[0] : 'all'}
                onChange={(val) => {
                  if (val === 'all') setSelectedCategoryIds([]);
                  else setSelectedCategoryIds([val]);
                }}
                options={categoryOptions}
              />
            </div>

            {/* 3. Tags Filter Dropdown */}
            <div>
              <span className="text-[11px] theme-text-muted font-semibold uppercase block mb-1.5 flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-indigo-500" />
                Tags
              </span>
              <CustomSelect
                value={selectedTagIds.length === 1 ? selectedTagIds[0] : 'all'}
                onChange={(val) => {
                  if (val === 'all') setSelectedTagIds([]);
                  else setSelectedTagIds([val]);
                }}
                options={tagOptions}
              />
            </div>

            {/* 4. Date / Period Filter Dropdown */}
            <div>
              <span className="text-[11px] theme-text-muted font-semibold uppercase block mb-1.5 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                Período / Data
              </span>
              <div className="space-y-2">
                <CustomSelect
                  value={dateFilterMode}
                  onChange={(val) => setDateFilterMode(val as DateFilterMode)}
                  options={dateOptions}
                />

                {/* Sub-controls for Specific Year */}
                {dateFilterMode === 'specific_year' && (
                  <div className="flex items-center space-x-1.5 animate-fadeIn">
                    <span className="text-[11px] theme-text-muted font-medium shrink-0">Ano:</span>
                    <CustomSelect
                      value={String(selectedYear)}
                      onChange={(val) => setSelectedYear(Number(val))}
                      options={yearOptions}
                    />
                  </div>
                )}

                {/* Sub-controls for Custom Range */}
                {dateFilterMode === 'custom_range' && (
                  <div className="space-y-1.5 animate-fadeIn text-xs">
                    <div>
                      <span className="text-[10px] theme-text-muted font-medium block mb-0.5">De:</span>
                      <DatePicker value={startDate} onChange={setStartDate} placeholder="Data inicial..." />
                    </div>
                    <div>
                      <span className="text-[10px] theme-text-muted font-medium block mb-0.5">Até:</span>
                      <DatePicker value={endDate} onChange={setEndDate} placeholder="Data final..." />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 5. Media Availability Filter Dropdown */}
            <div>
              <span className="text-[11px] theme-text-muted font-semibold uppercase block mb-1.5 flex items-center gap-1">
                <FolderPlus className="h-3.5 w-3.5 text-indigo-500" />
                Mídia Disponível
              </span>
              <CustomSelect
                value={
                  onlyDrive && onlyYoutube
                    ? 'both'
                    : onlyDrive
                    ? 'drive'
                    : onlyYoutube
                    ? 'youtube'
                    : 'all'
                }
                onChange={(val) => {
                  if (val === 'all') {
                    setOnlyDrive(false);
                    setOnlyYoutube(false);
                  } else if (val === 'drive') {
                    setOnlyDrive(true);
                    setOnlyYoutube(false);
                  } else if (val === 'youtube') {
                    setOnlyDrive(false);
                    setOnlyYoutube(true);
                  } else if (val === 'both') {
                    setOnlyDrive(true);
                    setOnlyYoutube(true);
                  }
                }}
                options={mediaOptions}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Explorer Results Counter */}
      <div className="flex items-center justify-between px-2 text-xs theme-text-muted">
        <span>
          Exibindo <strong className="theme-text font-semibold">{filteredAndSortedJobs.length}</strong> de{' '}
          <strong className="theme-text font-semibold">{jobs.length}</strong> trabalhos cadastrados
        </span>
        {hasActiveFilters && (
          <span className="text-indigo-500 font-medium">Filtros aplicados</span>
        )}
      </div>

      {/* Display List */}
      {filteredAndSortedJobs.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAndSortedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={onEditJob}
                onDelete={() => setDeletingJob(job)}
                onViewDetails={setSelectedJob}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="theme-card border rounded-2xl overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs theme-text">
                <thead className="theme-card-subtle theme-text-muted uppercase tracking-wider border-b theme-border">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Título / Cliente</th>
                    <th className="py-3.5 px-4 font-bold">Executado por</th>
                    <th className="py-3.5 px-4 font-bold">Data</th>
                    <th className="hidden sm:table-cell py-3.5 px-4 font-bold">Local</th>
                    <th className="hidden md:table-cell py-3.5 px-4 font-bold">Categorias</th>
                    <th className="py-3.5 px-4 font-bold">Valor</th>
                    <th className="hidden sm:table-cell py-3.5 px-4 font-bold">Links</th>
                    <th className="py-3.5 px-4 font-bold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border">
                  {filteredAndSortedJobs.map((job) => {
                    const jobPerformers = getJobPerformers(job.performer);
                    const formattedValue = new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(job.value || 0);

                    const clientDisplay = job.clients && job.clients.length > 0
                      ? job.clients.map((c) => c.name).join(', ')
                      : job.client_name;

                    return (
                      <tr
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className="hover:bg-zinc-500/10 transition cursor-pointer select-none"
                      >
                        <td className="py-3 px-4">
                          <span className="font-bold theme-text hover:text-indigo-500 transition-colors block">
                            {job.title}
                          </span>
                          {clientDisplay && (
                            <span className="text-[11px] theme-text-muted block">{clientDisplay}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {jobPerformers.map((pKey) => {
                              const perf = PERFORMER_LABELS[pKey] || PERFORMER_LABELS.wagner;
                              return (
                                <span
                                  key={pKey}
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${perf.badgeColor}`}
                                >
                                  {perf.label.split(' ')[0]}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-4 theme-text-muted whitespace-nowrap">
                          {job.job_date ? new Date(job.job_date + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="hidden sm:table-cell py-3 px-4 theme-text-muted max-w-[150px] truncate">
                          {job.location || '-'}
                        </td>
                        <td className="hidden md:table-cell py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {job.categories?.map((c) => (
                              <span
                                key={c.id}
                                className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                                style={{ backgroundColor: `${c.color}22`, color: c.color }}
                              >
                                {c.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-emerald-500 whitespace-nowrap">
                          {job.value > 0 ? formattedValue : '-'}
                        </td>
                        <td className="hidden sm:table-cell py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {job.drive_url && (
                              <a
                                href={formatExternalUrl(job.drive_url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-emerald-500 hover:underline"
                                title="Abrir Drive"
                              >
                                <FolderPlus className="h-4 w-4" />
                              </a>
                            )}
                            {job.youtube_url && (
                              <a
                                href={formatExternalUrl(job.youtube_url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-red-500 hover:underline"
                                title="Abrir YouTube"
                              >
                                <YouTubeIcon className="h-4 w-4" />
                              </a>
                            )}
                            {job.reportage_links && job.reportage_links.length > 0 && (
                              <span
                                className="text-indigo-400 flex items-center space-x-1"
                                title={`${job.reportage_links.length} reportagem(ns) na mídia`}
                              >
                                <Newspaper className="h-4 w-4 text-indigo-400" />
                                <span className="text-[10px] font-bold">{job.reportage_links.length}</span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedJob(job);
                              }}
                              className="p-1 theme-text-muted hover:theme-text"
                              title="Ver Detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditJob(job);
                              }}
                              className="p-1 theme-text-muted hover:text-indigo-500"
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingJob(job);
                              }}
                              className="p-1 theme-text-muted hover:text-red-500"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4 border theme-border">
          <div className="h-12 w-12 rounded-full theme-card-subtle flex items-center justify-center mx-auto theme-text-muted">
            <Search className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold theme-text">Nenhum trabalho encontrado</h3>
            <p className="text-xs theme-text-muted max-w-sm mx-auto">
              Tente alterar os termos da busca ou ajustar os filtros aplicados.
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 theme-card hover:bg-zinc-500/10 theme-text text-xs font-semibold rounded-xl border theme-border transition"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <JobDetailModal
        job={selectedJob}
        customFields={customFields}
        onClose={() => setSelectedJob(null)}
        onEdit={onEditJob}
      />

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingJob)}
        title="Excluir Trabalho"
        description={
          deletingJob
            ? `Tem certeza que deseja excluir "${deletingJob.title}"? Esta ação removerá permanentemente o trabalho do portfólio.`
            : ''
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (deletingJob) {
            onDeleteJob(deletingJob.id);
            setDeletingJob(null);
          }
        }}
        onClose={() => setDeletingJob(null)}
      />
    </div>
  );
};
