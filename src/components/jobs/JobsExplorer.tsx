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
} from '@/types/database';
import { JobCard } from './JobCard';
import { JobDetailModal } from './JobDetailModal';

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

  // Filters state
  const [selectedPerformers, setSelectedPerformers] = useState<PerformerType[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [onlyDrive, setOnlyDrive] = useState(false);
  const [onlyYoutube, setOnlyYoutube] = useState(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Selected job for detail modal
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Toggle helpers for filters
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
  };

  const hasActiveFilters =
    searchTerm ||
    selectedPerformers.length > 0 ||
    selectedCategoryIds.length > 0 ||
    selectedTagIds.length > 0 ||
    onlyDrive ||
    onlyYoutube;

  // Filter & Sort Logic
  const filteredAndSortedJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        // Search term check
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchesTitle = job.title.toLowerCase().includes(term);
          const matchesClient = job.client_name?.toLowerCase().includes(term);
          const matchesLocation = job.location?.toLowerCase().includes(term);
          const matchesDesc = job.description?.toLowerCase().includes(term);
          if (!matchesTitle && !matchesClient && !matchesLocation && !matchesDesc) {
            return false;
          }
        }

        // Performer check
        if (selectedPerformers.length > 0 && !selectedPerformers.includes(job.performer)) {
          return false;
        }

        // Categories check (N:N)
        if (selectedCategoryIds.length > 0) {
          const jobCatIds = job.categories?.map((c) => c.id) || [];
          const hasCategory = selectedCategoryIds.some((id) => jobCatIds.includes(id));
          if (!hasCategory) return false;
        }

        // Tags check (N:N)
        if (selectedTagIds.length > 0) {
          const jobTagIds = job.tags?.map((t) => t.id) || [];
          const hasTag = selectedTagIds.some((id) => jobTagIds.includes(id));
          if (!hasTag) return false;
        }

        // Drive check
        if (onlyDrive && !job.drive_url) return false;

        // YouTube check
        if (onlyYoutube && !job.youtube_url) return false;

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
    sortBy,
  ]);

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="glass-panel p-4 md:p-6 rounded-2xl border border-zinc-800 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por título, cliente, local ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-zinc-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Controls: View mode, Sort, Mobile Filter toggle */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
                title="Visualização em Grade"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
                title="Visualização em Tabela"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Sort Select */}
            <div className="flex items-center space-x-1.5 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800 text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="date_desc" className="bg-zinc-900">Mais Recentes</option>
                <option value="date_asc" className="bg-zinc-900">Mais Antigos</option>
                <option value="value_desc" className="bg-zinc-900">Maior Valor R$</option>
                <option value="title_asc" className="bg-zinc-900">Título A-Z</option>
              </select>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="md:hidden flex items-center space-x-1 px-3 py-1.5 bg-zinc-800 text-zinc-200 rounded-xl text-xs"
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
              <span>Novo Trabalho</span>
            </button>
          </div>
        </div>

        {/* Filter Pills / Multi-Filter Bar */}
        <div className={`space-y-3 pt-3 border-t border-zinc-800 ${showFiltersMobile ? 'block' : 'hidden md:block'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Filtros Avançados:</span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
              >
                Limpar todos os filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Performer Filter */}
            <div>
              <span className="text-[11px] text-zinc-500 font-semibold uppercase block mb-1.5">Quem fez?</span>
              <div className="flex flex-wrap gap-1">
                {(['wagner', 'daiana', 'aflora', 'joint'] as PerformerType[]).map((p) => {
                  const isSel = selectedPerformers.includes(p);
                  return (
                    <button
                      key={p}
                      onClick={() => togglePerformer(p)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                        isSel
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {PERFORMER_LABELS[p].label.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Commercial Category Filter */}
            <div>
              <span className="text-[11px] text-zinc-500 font-semibold uppercase block mb-1.5">Categorias</span>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const isSel = selectedCategoryIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategoryFilter(cat.id)}
                      className={`text-xs px-2 py-0.5 rounded-md border transition ${
                        isSel
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags Filter */}
            <div>
              <span className="text-[11px] text-zinc-500 font-semibold uppercase block mb-1.5">Tags</span>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                {tags.map((tag) => {
                  const isSel = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTagFilter(tag.id)}
                      className={`text-[11px] px-2 py-0.5 rounded-md border transition ${
                        isSel
                          ? 'bg-purple-600 text-white border-purple-500'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      #{tag.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Portfolio Links toggles */}
            <div>
              <span className="text-[11px] text-zinc-500 font-semibold uppercase block mb-1.5">Mídia Disponível</span>
              <div className="flex items-center space-x-3 text-xs pt-1">
                <label className="flex items-center space-x-1.5 text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyDrive}
                    onChange={(e) => setOnlyDrive(e.target.checked)}
                    className="rounded bg-zinc-950 border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <FolderPlus className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Com Google Drive</span>
                </label>

                <label className="flex items-center space-x-1.5 text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyYoutube}
                    onChange={(e) => setOnlyYoutube(e.target.checked)}
                    className="rounded bg-zinc-950 border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <YouTubeIcon className="h-3.5 w-3.5 text-red-500" />
                  <span>Com YouTube</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explorer Results Counter */}
      <div className="flex items-center justify-between px-2 text-xs text-zinc-400">
        <span>
          Exibindo <strong className="text-white font-semibold">{filteredAndSortedJobs.length}</strong> de{' '}
          <strong className="text-white font-semibold">{jobs.length}</strong> trabalhos cadastrados
        </span>
        {hasActiveFilters && (
          <span className="text-indigo-400 font-medium">Filtros aplicados</span>
        )}
      </div>

      {/* Display List: Grid vs Table */}
      {filteredAndSortedJobs.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAndSortedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={onEditJob}
                onDelete={onDeleteJob}
                onViewDetails={setSelectedJob}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Título / Cliente</th>
                    <th className="py-3.5 px-4 font-bold">Executado por</th>
                    <th className="py-3.5 px-4 font-bold">Data</th>
                    <th className="py-3.5 px-4 font-bold">Local</th>
                    <th className="py-3.5 px-4 font-bold">Categorias</th>
                    <th className="py-3.5 px-4 font-bold">Valor</th>
                    <th className="py-3.5 px-4 font-bold">Links</th>
                    <th className="py-3.5 px-4 font-bold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredAndSortedJobs.map((job) => {
                    const perf = PERFORMER_LABELS[job.performer] || PERFORMER_LABELS.wagner;
                    const formattedValue = new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(job.value || 0);

                    return (
                      <tr key={job.id} className="hover:bg-zinc-800/40 transition">
                        <td className="py-3 px-4">
                          <span
                            onClick={() => setSelectedJob(job)}
                            className="font-bold text-white hover:text-indigo-400 cursor-pointer block"
                          >
                            {job.title}
                          </span>
                          {job.client_name && (
                            <span className="text-[11px] text-zinc-400 block">{job.client_name}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${perf.badgeColor}`}>
                            {perf.label.split(' ')[0]}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                          {job.job_date ? new Date(job.job_date + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="py-3 px-4 text-zinc-400 max-w-[150px] truncate">
                          {job.location || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {job.categories?.map((c) => (
                              <span
                                key={c.id}
                                className="text-[10px] px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: `${c.color}22`, color: c.color }}
                              >
                                {c.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-emerald-400 whitespace-nowrap">
                          {job.value > 0 ? formattedValue : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1.5">
                            {job.drive_url && (
                              <a
                                href={job.drive_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:underline"
                                title="Abrir Drive"
                              >
                                <FolderPlus className="h-4 w-4" />
                              </a>
                            )}
                            {job.youtube_url && (
                              <a
                                href={job.youtube_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-500 hover:underline"
                                title="Abrir YouTube"
                              >
                                <YouTubeIcon className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => setSelectedJob(job)}
                              className="p-1 text-zinc-400 hover:text-white"
                              title="Ver Detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onEditJob(job)}
                              className="p-1 text-zinc-400 hover:text-indigo-400"
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Deseja excluir "${job.title}"?`)) onDeleteJob(job.id);
                              }}
                              className="p-1 text-zinc-400 hover:text-red-400"
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
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4 border border-zinc-800">
          <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <Search className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Nenhum trabalho encontrado</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Tente alterar os termos da busca ou ajustar os filtros aplicados.
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl transition"
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
    </div>
  );
};
