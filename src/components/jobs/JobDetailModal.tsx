'use client';

import React, { useEffect } from 'react';
import {
  X,
  Calendar,
  MapPin,
  FolderPlus,
  DollarSign,
  UserCheck,
  Tag,
  Folder,
  FileText,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { YouTubeIcon } from '@/components/icons/YouTubeIcon';
import { Job, PERFORMER_LABELS, STATUS_LABELS, CustomFieldDefinition, getJobPerformers } from '@/types/database';
import { formatExternalUrl } from '@/utils/url';
import { CollapsibleLinksGroup } from '@/components/ui/CollapsibleLinksGroup';

interface JobDetailModalProps {
  job: Job | null;
  customFields: CustomFieldDefinition[];
  onClose: () => void;
  onEdit: (job: Job) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  customFields,
  onClose,
  onEdit,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!job) return null;

  const performers = getJobPerformers(job.performer);
  const statusInfo = STATUS_LABELS[job.status] || STATUS_LABELS.completed;

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(job.value || 0);

  const formattedDate = job.job_date
    ? new Date(job.job_date + 'T00:00:00').toLocaleDateString('pt-BR')
    : '';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="theme-card border theme-border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl space-y-6"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b theme-border pb-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {performers.map((pKey) => {
                const performerInfo = PERFORMER_LABELS[pKey] || PERFORMER_LABELS.wagner;
                return (
                  <span
                    key={pKey}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${performerInfo.badgeColor} flex items-center space-x-1`}
                  >
                    <UserCheck className="h-3 w-3" />
                    <span>{performerInfo.label}</span>
                  </span>
                );
              })}
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <h2 className="text-xl font-bold theme-text">{job.title}</h2>
            {(job.client_name || (job.clients && job.clients.length > 0)) && (
              <p className="text-sm theme-text-muted">
                Cliente: <span className="theme-text font-medium">{job.clients && job.clients.length > 0 ? job.clients.map(c => c.name).join(', ') : job.client_name}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl theme-text-muted hover:theme-text hover:bg-zinc-500/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 theme-card-subtle p-4 rounded-2xl border theme-border text-xs">
          <div>
            <span className="theme-text-muted block mb-1">Data do Evento</span>
            <div className="flex items-center space-x-1.5 theme-text font-medium">
              <Calendar className="h-3.5 w-3.5 text-indigo-500" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div>
            <span className="theme-text-muted block mb-1">Localização</span>
            <div className="flex items-center space-x-1.5 theme-text font-medium truncate">
              <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <span className="truncate">{job.location || 'Não especificada'}</span>
            </div>
          </div>

          <div>
            <span className="theme-text-muted block mb-1">Valor Comercial</span>
            <div className="flex items-center space-x-1 text-emerald-500 font-bold">
              <DollarSign className="h-3.5 w-3.5" />
              <span>{formattedValue}</span>
            </div>
          </div>
        </div>

        {/* Portfolio & Media Links */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold theme-text-muted uppercase tracking-wider">
            Arquivos & Links de Entregáveis
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {job.drive_url ? (
              <a
                href={formatExternalUrl(job.drive_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition group"
              >
                <div className="flex items-center space-x-2.5">
                  <FolderPlus className="h-5 w-5" />
                  <div>
                    <span className="text-xs font-bold block">Google Drive</span>
                    <span className="text-[11px] opacity-80">Abrir pasta de fotos</span>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            ) : (
              <div className="flex items-center space-x-2.5 p-3.5 theme-card-subtle border theme-border theme-text-muted rounded-xl">
                <FolderPlus className="h-5 w-5" />
                <span className="text-xs">Sem link do Google Drive</span>
              </div>
            )}

            {job.youtube_url ? (
              <a
                href={formatExternalUrl(job.youtube_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl hover:bg-red-500/20 transition group"
              >
                <div className="flex items-center space-x-2.5">
                  <YouTubeIcon className="h-5 w-5" />
                  <div>
                    <span className="text-xs font-bold block">YouTube</span>
                    <span className="text-[11px] opacity-80">Assistir vídeo</span>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            ) : (
              <div className="flex items-center space-x-2.5 p-3.5 theme-card-subtle border theme-border theme-text-muted rounded-xl">
                <YouTubeIcon className="h-5 w-5" />
                <span className="text-xs">Sem vídeo no YouTube</span>
              </div>
            )}
          </div>

          {/* Reportage Links (Collapsible) */}
          {job.reportage_links && job.reportage_links.length > 0 && (
            <div className="pt-2">
              <CollapsibleLinksGroup
                title="Reportagens na Mídia"
                links={job.reportage_links}
                defaultOpen={true}
              />
            </div>
          )}
        </div>

        {/* Categories & Tags */}
        <div className="space-y-4">
          {job.categories && job.categories.length > 0 && (
            <div>
              <span className="text-xs font-semibold theme-text-muted uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Folder className="h-3.5 w-3.5 text-indigo-500" />
                Categorias Comerciais
              </span>
              <div className="flex flex-wrap gap-2">
                {job.categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="text-xs font-semibold px-3 py-1 rounded-lg"
                    style={{ backgroundColor: `${cat.color}22`, color: cat.color, border: `1px solid ${cat.color}66` }}
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.tags && job.tags.length > 0 && (
            <div>
              <span className="text-xs font-semibold theme-text-muted uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-indigo-500" />
                Tags do Trabalho
              </span>
              <div className="flex flex-wrap gap-1.5">
                {job.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs theme-text theme-card-subtle border theme-border px-2.5 py-1 rounded-lg"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Custom Fields */}
        {job.custom_fields && Object.keys(job.custom_fields).length > 0 && (
          <div className="space-y-2 border-t theme-border pt-4">
            <h3 className="text-xs font-semibold theme-text-muted uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Sliders className="h-3.5 w-3.5 text-indigo-500" />
              Campos Personalizados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.entries(job.custom_fields).map(([key, val]) => {
                const def = customFields.find((f) => f.key === key);
                const label = def ? def.label : key;
                return (
                  <div key={key} className="theme-card-subtle p-3 rounded-xl border theme-border text-xs">
                    <span className="theme-text-muted block mb-0.5">{label}</span>
                    <span className="theme-text font-medium">
                      {typeof val === 'boolean' ? (val ? 'Sim' : 'Não') : String(val || '-')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Description */}
        {job.description && (
          <div className="space-y-2 border-t theme-border pt-4">
            <h3 className="text-xs font-semibold theme-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-indigo-500" />
              Descrição & Observações
            </h3>
            <div className="theme-card-subtle p-4 rounded-xl border theme-border text-xs theme-text whitespace-pre-wrap leading-relaxed">
              {job.description}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t theme-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium theme-text-muted hover:theme-text hover:bg-zinc-500/10 transition"
          >
            Fechar
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(job);
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
          >
            Editar Trabalho
          </button>
        </div>
      </div>
    </div>
  );
};
