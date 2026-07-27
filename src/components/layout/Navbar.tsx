'use client';

import React, { useState, useEffect } from 'react';
import {
  Camera,
  FolderKanban,
  BarChart3,
  PlusCircle,
  Settings,
  Database,
  DatabaseZap,
  Sun,
  Moon,
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export type TabType = 'novo' | 'explorar' | 'analytics' | 'metadata';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  jobsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, jobsCount }) => {
  const isConnected = isSupabaseConfigured();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = (localStorage.getItem('portfolio_db_theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('portfolio_db_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel theme-border border-b transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('explorar')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold theme-text tracking-wide">
                  Portfolio Database
                </h1>
                <span className="text-xs bg-indigo-500/20 text-indigo-500 font-medium px-2 py-0.5 rounded-full border border-indigo-500/30">
                  Wagner & Aflora
                </span>
              </div>
              <p className="text-xs theme-text-muted">Wagner • Daiana • Aflora Espaço Criativo</p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1 theme-card-subtle p-1.5 rounded-xl border theme-border">
            <button
              onClick={() => setActiveTab('explorar')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'explorar'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'theme-text-muted hover:theme-text hover:bg-zinc-500/10'
              }`}
            >
              <FolderKanban className="h-4 w-4" />
              <span>Explorar Trabalhos</span>
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full theme-card theme-text font-mono border theme-border">
                {jobsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('novo')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'novo'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'theme-text-muted hover:theme-text hover:bg-zinc-500/10'
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              <span>Novo Trabalho</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'theme-text-muted hover:theme-text hover:bg-zinc-500/10'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics & Dados</span>
            </button>

            <button
              onClick={() => setActiveTab('metadata')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'metadata'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'theme-text-muted hover:theme-text hover:bg-zinc-500/10'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Configurations</span>
            </button>
          </nav>

          {/* Right Controls: Theme Toggle & Connection Pill */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl theme-card border theme-border theme-text hover:bg-indigo-500/10 transition"
              title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-600" />
              )}
            </button>

            {/* Connection Status Pill */}
            <div className="hidden sm:flex items-center space-x-2">
              {isConnected ? (
                <div className="flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-medium">
                  <DatabaseZap className="h-3.5 w-3.5" />
                  <span>Supabase Conectado</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-medium" title="Modo fallback ativado">
                  <Database className="h-3.5 w-3.5" />
                  <span>Modo Local / Fallback</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden flex items-center justify-around theme-card border-t theme-border p-2">
        <button
          onClick={() => setActiveTab('explorar')}
          className={`flex flex-col items-center p-1.5 text-xs ${
            activeTab === 'explorar' ? 'text-indigo-600 font-semibold' : 'theme-text-muted'
          }`}
        >
          <FolderKanban className="h-4 w-4 mb-0.5" />
          <span>Trabalhos</span>
        </button>
        <button
          onClick={() => setActiveTab('novo')}
          className={`flex flex-col items-center p-1.5 text-xs ${
            activeTab === 'novo' ? 'text-indigo-600 font-semibold' : 'theme-text-muted'
          }`}
        >
          <PlusCircle className="h-4 w-4 mb-0.5" />
          <span>Novo</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center p-1.5 text-xs ${
            activeTab === 'analytics' ? 'text-indigo-600 font-semibold' : 'theme-text-muted'
          }`}
        >
          <BarChart3 className="h-4 w-4 mb-0.5" />
          <span>Analytics</span>
        </button>
        <button
          onClick={() => setActiveTab('metadata')}
          className={`flex flex-col items-center p-1.5 text-xs ${
            activeTab === 'metadata' ? 'text-indigo-600 font-semibold' : 'theme-text-muted'
          }`}
        >
          <Settings className="h-4 w-4 mb-0.5" />
          <span>Config</span>
        </button>
      </div>
    </header>
  );
};
