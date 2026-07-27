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
import { YouTubeIcon } from '@/components/icons/YouTubeIcon';
import { Job, CommercialCategory, JobTag, PERFORMER_LABELS } from '@/types/database';

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
  // 1. KPI Aggregations
  const totalJobs = jobs.length;
  const totalValue = jobs.reduce((acc, j) => acc + (j.value || 0), 0);

  const wagnerCount = jobs.filter((j) => j.performer === 'wagner').length;
  const daianaCount = jobs.filter((j) => j.performer === 'daiana').length;
  const afloraCount = jobs.filter((j) => j.performer === 'aflora').length;
  const jointCount = jobs.filter((j) => j.performer === 'joint').length;

  const driveCount = jobs.filter((j) => Boolean(j.drive_url)).length;
  const drivePercentage = totalJobs > 0 ? Math.round((driveCount / totalJobs) * 100) : 0;

  const youtubeCount = jobs.filter((j) => Boolean(j.youtube_url)).length;

  // 2. Performers Pie Chart Data
  const performerData = [
    { name: 'Wagner', value: wagnerCount, color: '#6366f1' },
    { name: 'Daiana', value: daianaCount, color: '#f43f5e' },
    { name: 'Aflora Espaço Criativo', value: afloraCount, color: '#10b981' },
    { name: 'Parceria / Conjunto', value: jointCount, color: '#f59e0b' },
  ].filter((item) => item.value > 0);

  // 3. Categories Data
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

  // 4. Tags Data
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

  // 5. Timeline Data (Grouped by Month)
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

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Jobs */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Total de Trabalhos
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <FolderKanban className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{totalJobs}</div>
          <p className="text-[11px] text-zinc-500">Cadastrados na base de dados</p>
        </div>

        {/* Total Revenue */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Valor Acumulado R$
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{formattedTotalValue}</div>
          <p className="text-[11px] text-zinc-500">Soma de orçamentos e contratos</p>
        </div>

        {/* Performers breakdown count */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Divisão de Execução
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-medium pt-1">
            <span className="text-indigo-400">W: {wagnerCount}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-rose-400">D: {daianaCount}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-emerald-400">Aflora: {afloraCount}</span>
          </div>
          <p className="text-[11px] text-zinc-500">Projetos individuais e em parceria ({jointCount})</p>
        </div>

        {/* Google Drive Backup rate */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Acervo no Drive
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <FolderPlus className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{drivePercentage}%</div>
          <p className="text-[11px] text-zinc-500">
            {driveCount} de {totalJobs} projetos possuem link da pasta no Google Drive
          </p>
        </div>
      </div>

      {/* Grid of Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Performers Distribution (Pie Chart) */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <User className="h-4 w-4 text-indigo-400" />
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
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-zinc-500">
                Sem dados suficientes para gráfico
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Timeline of Jobs & Revenue */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <TrendingUp className="h-4 w-4 text-indigo-400" />
            Evolução de Projetos por Mês
          </h3>

          <div className="h-64 w-full">
            {timelineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" stroke="#a1a1aa" fontSize={11} />
                  <YAxis stroke="#a1a1aa" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="jobs" name="Qtd. Trabalhos" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-zinc-500">
                Sem histórico temporal cadastrado
              </div>
            )}
          </div>
        </div>

        {/* Chart 3: Commercial Categories Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Award className="h-4 w-4 text-indigo-400" />
            Volume por Categoria Comercial (B2C, B2B, Edital...)
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis type="number" stroke="#a1a1aa" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={11} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="Trabalhos" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Top Job Tags Cloud */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Award className="h-4 w-4 text-purple-400" />
            Tags Mais Frequentes (Tipo de Serviço)
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tagChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} interval={0} />
                <YAxis stroke="#a1a1aa" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="Trabalhos" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
