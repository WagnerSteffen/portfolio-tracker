'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  FolderKanban,
  DollarSign,
  User,
  Users,
  FolderPlus,
  TrendingUp,
  Award,
} from 'lucide-react';
import { Job, CommercialCategory, JobTag, PERFORMER_LABELS, getJobPerformers } from '@/types/database';

interface AnalyticsDashboardProps {
  jobs: Job[];
  categories: CommercialCategory[];
  tags: JobTag[];
}

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  jobs,
  categories,
  tags,
}) => {
  const totalJobs = jobs.length;
  const totalValue = jobs.reduce((acc, j) => acc + (j.value || 0), 0);

  const wagnerCount = jobs.filter((j) => getJobPerformers(j.performer).includes('wagner')).length;
  const daianaCount = jobs.filter((j) => getJobPerformers(j.performer).includes('daiana')).length;
  const afloraCount = jobs.filter((j) => getJobPerformers(j.performer).includes('aflora')).length;
  const jointCount = jobs.filter((j) => getJobPerformers(j.performer).includes('joint')).length;

  const driveCount = jobs.filter((j) => Boolean(j.drive_url)).length;
  const drivePercentage = totalJobs > 0 ? Math.round((driveCount / totalJobs) * 100) : 0;

  const performerData = [
    { name: 'Wagner', value: wagnerCount, color: '#6366f1' },
    { name: 'Daiana', value: daianaCount, color: '#f43f5e' },
    { name: 'Aflora', value: afloraCount, color: '#10b981' },
    { name: 'Parceria', value: jointCount, color: '#f59e0b' },
  ].filter((item) => item.value > 0);

  const categoryDataMap: Record<string, number> = {};
  categories.forEach((c) => (categoryDataMap[c.name] = 0));
  jobs.forEach((job) => {
    job.categories?.forEach((cat) => {
      categoryDataMap[cat.name] = (categoryDataMap[cat.name] || 0) + 1;
    });
  });
  const categoryChartData = Object.entries(categoryDataMap).map(([name, count]) => ({
    name,
    Trabalhos: count,
  }));

  const tagDataMap: Record<string, number> = {};
  tags.forEach((t) => (tagDataMap[t.name] = 0));
  jobs.forEach((job) => {
    job.tags?.forEach((t) => {
      tagDataMap[t.name] = (tagDataMap[t.name] || 0) + 1;
    });
  });
  const tagChartData = Object.entries(tagDataMap)
    .map(([name, count]) => ({ name: `#${name}`, Trabalhos: count }))
    .sort((a, b) => b.Trabalhos - a.Trabalhos)
    .slice(0, 8);

  const timelineMap: Record<string, { month: string; value: number; jobs: number }> = {};
  jobs.forEach((job) => {
    if (!job.job_date) return;
    const dateObj = new Date(job.job_date + 'T00:00:00');
    const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = dateObj.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    if (!timelineMap[monthKey]) {
      timelineMap[monthKey] = { month: monthLabel, value: 0, jobs: 0 };
    }
    timelineMap[monthKey].value += job.value || 0;
    timelineMap[monthKey].jobs += 1;
  });
  const timelineChartData = Object.keys(timelineMap)
    .sort()
    .map((k) => timelineMap[k]);

  const formattedTotalValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(totalValue);

  // Dynamic tooltip style using CSS vars
  const tooltipStyle = {
    backgroundColor: 'var(--bg-card)',
    borderColor: 'var(--border-color)',
    borderRadius: '12px',
    color: 'var(--text-main)',
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border theme-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold theme-text-muted uppercase tracking-wider">
              Total de Trabalhos
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <FolderKanban className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold theme-text">{totalJobs}</div>
          <p className="text-[11px] theme-text-muted">Cadastrados na base de dados</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border theme-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold theme-text-muted uppercase tracking-wider">
              Valor Acumulado R$
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-500">{formattedTotalValue}</div>
          <p className="text-[11px] theme-text-muted">Soma de orçamentos e contratos</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border theme-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold theme-text-muted uppercase tracking-wider">
              Divisão de Execução
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-medium pt-1">
            <span className="text-indigo-500">W: {wagnerCount}</span>
            <span className="theme-text-muted">•</span>
            <span className="text-rose-500">D: {daianaCount}</span>
            <span className="theme-text-muted">•</span>
            <span className="text-emerald-500">Aflora: {afloraCount}</span>
          </div>
          <p className="text-[11px] theme-text-muted">Projetos individuais e em parceria ({jointCount})</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border theme-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold theme-text-muted uppercase tracking-wider">
              Acervo no Drive
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <FolderPlus className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold theme-text">{drivePercentage}%</div>
          <p className="text-[11px] theme-text-muted">
            {driveCount} de {totalJobs} projetos com link do Drive
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performers Distribution Pie */}
        <div className="glass-panel p-6 rounded-2xl border theme-border space-y-4">
          <h3 className="text-sm font-bold theme-text flex items-center gap-2 border-b theme-border pb-3">
            <User className="h-4 w-4 text-indigo-500" />
            Distribuição por Profissional / Empresa
          </h3>
          <div className="h-64 w-full">
            {performerData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performerData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {performerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs theme-text-muted">
                Sem dados suficientes para gráfico
              </div>
            )}
          </div>
        </div>

        {/* Timeline Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border theme-border space-y-4">
          <h3 className="text-sm font-bold theme-text flex items-center gap-2 border-b theme-border pb-3">
            <TrendingUp className="h-4 w-4 text-indigo-500" />
            Evolução de Projetos por Mês
          </h3>
          <div className="h-64 w-full">
            {timelineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="jobs" name="Qtd. Trabalhos" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs theme-text-muted">
                Sem histórico temporal cadastrado
              </div>
            )}
          </div>
        </div>

        {/* Categories Horizontal Bar */}
        <div className="glass-panel p-6 rounded-2xl border theme-border space-y-4">
          <h3 className="text-sm font-bold theme-text flex items-center gap-2 border-b theme-border pb-3">
            <Award className="h-4 w-4 text-indigo-500" />
            Volume por Categoria Comercial
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} width={100} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="Trabalhos" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Tags Bar */}
        <div className="glass-panel p-6 rounded-2xl border theme-border space-y-4">
          <h3 className="text-sm font-bold theme-text flex items-center gap-2 border-b theme-border pb-3">
            <Award className="h-4 w-4 text-purple-500" />
            Tags Mais Frequentes
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tagChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} interval={0} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="Trabalhos" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
