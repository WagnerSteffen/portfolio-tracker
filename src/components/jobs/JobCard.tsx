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
} from '@/types/database';

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
  const performerInfo = PERFORMER_LABELS[job.performer] || PERFORMER_LABELS.wagner;
  const statusInfo = STATUS_LABELS[job.status] || STATUS_LABELS.completed;

  // Format currency
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(job.value || 0);

  // Format date
  const formattedDate = job.job_date
    ? new Date(job.job_date + 'T00:00:00').toLocaleDateString('pt-BR')
    : '';

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between space-y-4 border border-zinc-800/80 hover:border-indigo-500/40 group transition-all">
      {/* Card Header: Performer Badge & Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${performerInfo.badgeColor} flex items-center space-x-1`}
          >
            <UserCheck className="h-3 w-3" />
            <span>{performerInfo.label}</span>
          </span>

          <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Title & Client */}
        <h3
          onClick={() => onViewDetails(job)}
          className="text-base font-bold text-white group-hover:text-indigo-400 cursor-pointer line-clamp-2 transition-colors pt-1"
        >
          {job.title}
        </h3>

        {job.client_name && (
          <p className="text-xs text-zinc-400 font-medium">
            Cliente: <span className="text-zinc-200">{job.client_name}</span>
          </p>
        )}
      </div>

      {/* Date, Location & Value */}
      <div className="space-y-1.5 text-xs text-zinc-400">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Calendar className="h-3.5 w-3.5 text-zinc-500" />
            <span>{formattedDate}</span>
          </div>
          {job.value > 0 && (
            <div className="flex items-center space-x-1 font-semibold text-emerald-400">
              <DollarSign className="h-3.5 w-3.5" />
              <span>{formattedValue}</span>
            </div>
          )}
        </div>

        {job.location && (
          <div className="flex items-center space-x-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
        )}
      </div>

      {/* Categories & Tags */}
      <div className="space-y-2 pt-2 border-t border-zinc-800/60">
        {/* Categories */}
        {job.categories && job.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.categories.map((cat) => (
              <span
                key={cat.id}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md text-white flex items-center space-x-1"
                style={{ backgroundColor: `${cat.color}33`, color: cat.color, border: `1px solid ${cat.color}66` }}
              >
                <span>{cat.name}</span>
              </span>
            ))}
          </div>
        )}

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.tags.map((tag) => (
              <span key={tag.id} className="text-[10px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-md">
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Portfolio Links & Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
        <div className="flex items-center space-x-2">
          {job.drive_url ? (
            <a
              href={job.drive_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition"
              title="Abrir Pasta no Google Drive"
            >
              <FolderPlus className="h-4 w-4" />
            </a>
          ) : (
            <span className="p-1.5 text-zinc-600 bg-zinc-900 border border-zinc-800 rounded-lg" title="Sem Google Drive">
              <FolderPlus className="h-4 w-4" />
            </span>
          )}

          {job.youtube_url ? (
            <a
              href={job.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition"
              title="Ver Vídeo no YouTube"
            >
              <YouTubeIcon className="h-4 w-4" />
            </a>
          ) : (
            <span className="p-1.5 text-zinc-600 bg-zinc-900 border border-zinc-800 rounded-lg" title="Sem YouTube">
              <YouTubeIcon className="h-4 w-4" />
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onViewDetails(job)}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
            title="Ver Detalhes"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(job)}
            className="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 rounded-lg transition"
            title="Editar Trabalho"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Tem certeza que deseja excluir "${job.title}"?`)) {
                onDelete(job.id);
              }
            }}
            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition"
            title="Excluir Trabalho"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
