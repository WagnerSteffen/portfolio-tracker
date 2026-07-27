'use client';

import React from 'react';
import {
  Calendar,
  MapPin,
  FolderPlus,
  DollarSign,
  Edit2,
  Trash2,
  Eye,
  UserCheck,
} from 'lucide-react';
import { YouTubeIcon } from '@/components/icons/YouTubeIcon';
import {
  Job,
  PERFORMER_LABELS,
  STATUS_LABELS,
  getJobPerformers,
} from '@/types/database';
import { formatExternalUrl } from '@/utils/url';

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
  onViewDetails: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
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
      onClick={() => onViewDetails(job)}
      className="glass-card rounded-2xl p-5 flex flex-col justify-between space-y-4 theme-border hover:border-indigo-500/50 group transition-all cursor-pointer"
    >
      {/* Card Header: Performer Badges & Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1 items-center">
            {performers.map((pKey) => {
              const performerInfo = PERFORMER_LABELS[pKey] || PERFORMER_LABELS.wagner;
              return (
                <span
                  key={pKey}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${performerInfo.badgeColor} flex items-center space-x-1`}
                >
                  <UserCheck className="h-3 w-3" />
                  <span>{performerInfo.label}</span>
                </span>
              );
            })}
          </div>

          <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${statusInfo.color} shrink-0`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Title & Client */}
        <h3
          className="text-base font-bold theme-text group-hover:text-indigo-500 transition-colors pt-1"
        >
          {job.title}
        </h3>

        {job.client_name && (
          <p className="text-xs theme-text-muted font-medium">
            Cliente: <span className="theme-text font-semibold">{job.client_name}</span>
          </p>
        )}
      </div>

      {/* Date, Location & Value */}
      <div className="space-y-1.5 text-xs theme-text-muted">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Calendar className="h-3.5 w-3.5 text-indigo-500" />
            <span>{formattedDate}</span>
          </div>
          {job.value > 0 && (
            <div className="flex items-center space-x-1 font-semibold text-emerald-500">
              <DollarSign className="h-3.5 w-3.5" />
              <span>{formattedValue}</span>
            </div>
          )}
        </div>

        {job.location && (
          <div className="flex items-center space-x-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
        )}
      </div>

      {/* Categories & Tags */}
      <div className="space-y-2 pt-2 border-t theme-border">
        {job.categories && job.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.categories.map((cat) => (
              <span
                key={cat.id}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center space-x-1"
                style={{ backgroundColor: `${cat.color}22`, color: cat.color, border: `1px solid ${cat.color}66` }}
              >
                <span>{cat.name}</span>
              </span>
            ))}
          </div>
        )}

        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.tags.map((tag) => (
              <span key={tag.id} className="text-[10px] theme-card-subtle theme-text-muted px-2 py-0.5 rounded-md border theme-border">
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t theme-border">
        <div className="flex items-center space-x-2">
          {job.drive_url ? (
            <a
              href={formatExternalUrl(job.drive_url)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition"
              title="Abrir Pasta no Google Drive"
            >
              <FolderPlus className="h-4 w-4" />
            </a>
          ) : (
            <span className="p-1.5 theme-text-muted theme-card-subtle border theme-border rounded-lg" title="Sem Google Drive">
              <FolderPlus className="h-4 w-4" />
            </span>
          )}

          {job.youtube_url ? (
            <a
              href={formatExternalUrl(job.youtube_url)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition"
              title="Ver Vídeo no YouTube"
            >
              <YouTubeIcon className="h-4 w-4" />
            </a>
          ) : (
            <span className="p-1.5 theme-text-muted theme-card-subtle border theme-border rounded-lg" title="Sem YouTube">
              <YouTubeIcon className="h-4 w-4" />
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(job);
            }}
            className="p-1.5 theme-text-muted hover:theme-text hover:bg-zinc-500/10 rounded-lg transition"
            title="Ver Detalhes"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(job);
            }}
            className="p-1.5 theme-text-muted hover:text-indigo-500 hover:bg-zinc-500/10 rounded-lg transition"
            title="Editar Trabalho"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Tem certeza que deseja excluir "${job.title}"?`)) {
                onDelete(job.id);
              }
            }}
            className="p-1.5 theme-text-muted hover:text-red-500 hover:bg-zinc-500/10 rounded-lg transition"
            title="Excluir Trabalho"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
