'use client';

import React, { useState } from 'react';
import { Newspaper, ChevronDown, ExternalLink, Calendar } from 'lucide-react';
import { ReportageLink } from '@/types/database';
import { format, parseISO } from 'date-fns';
import { getProviderInfo } from '@/utils/url-title';
import { formatExternalUrl } from '@/utils/url';

interface CollapsibleLinksGroupProps {
  title?: string;
  links?: ReportageLink[];
  defaultOpen?: boolean;
  emptyMessage?: string;
  badgeLabel?: string;
}

export const CollapsibleLinksGroup: React.FC<CollapsibleLinksGroupProps> = ({
  title = 'Reportagens na Mídia',
  links = [],
  defaultOpen = false,
  emptyMessage = 'Nenhuma reportagem ou matéria vinculada.',
  badgeLabel,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!links || links.length === 0) {
    return (
      <div className="theme-card border theme-border rounded-2xl p-4 text-xs theme-text-muted italic">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="theme-card border theme-border rounded-2xl overflow-hidden transition-all shadow-sm">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-zinc-500/5 hover:bg-zinc-500/10 flex items-center justify-between transition border-b theme-border cursor-pointer select-none"
      >
        <div className="flex items-center space-x-2.5">
          <Newspaper className="h-4 w-4 text-indigo-500" />
          <span className="text-xs font-bold theme-text uppercase tracking-wider">
            {title} ({links.length})
          </span>
          {badgeLabel && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              {badgeLabel}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] theme-text-muted">
            {isOpen ? 'Recolher' : 'Expandir'}
          </span>
          <ChevronDown
            className={`h-4 w-4 theme-text-muted transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-indigo-400' : ''
            }`}
          />
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-3 space-y-2 animate-fadeIn">
          {links.map((link, idx) => {
            const providerInfo = getProviderInfo(link.provider || link.url);
            const formattedUrl = formatExternalUrl(link.url);
            const formattedDate = link.published_date
              ? (() => {
                  try {
                    const parsed = parseISO(link.published_date);
                    return isNaN(parsed.getTime()) ? link.published_date : format(parsed, 'dd/MM/yyyy');
                  } catch {
                    return link.published_date;
                  }
                })()
              : null;

            return (
              <a
                key={link.id || idx}
                href={formattedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl theme-card-subtle border theme-border hover:border-indigo-500/40 hover:bg-indigo-500/5 transition group gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${providerInfo.badgeColor}`}
                    >
                      {link.provider || providerInfo.name}
                    </span>
                    {formattedDate && (
                      <span className="text-[10px] theme-text-muted flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-indigo-400" />
                        <span>{formattedDate}</span>
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold theme-text group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {link.title || link.url}
                  </h4>
                </div>

                <div className="flex items-center space-x-1 text-indigo-500 shrink-0 self-end sm:self-center text-xs font-medium">
                  <span>Abrir matéria</span>
                  <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};
