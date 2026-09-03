import React from 'react';
import {
  Trophy,
  Calendar,
  Table2,
  Award,
  ShieldAlert,
  FileCode2,
  RefreshCw,
  Radio,
  UserCheck,
  ShieldCheck,
  LogOut,
  LogIn,
} from 'lucide-react';
import { TournamentConfig } from '../types';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: 'standings' | 'fixture' | 'playoffs' | 'stats' | 'admin' | 'setup';
  setActiveTab: (tab: 'standings' | 'fixture' | 'playoffs' | 'stats' | 'admin' | 'setup') => void;
  config: TournamentConfig;
  onRefresh: () => void;
  isSyncing: boolean;
  syncSource: 'gas' | 'local';
  syncError?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  config,
  onRefresh,
  isSyncing,
  syncSource,
  syncError,
}) => {
  const { user, userProfile, isAdmin, isUser, logout } = useAuth();

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl backdrop-blur-md bg-slate-900/95">
      {/* Top Banner with League Info & Connection Status */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>EN VIVO</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="hidden sm:inline font-medium text-slate-300">{config.season}</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-slate-300 font-semibold">{config.category}</span>
          </div>

          {config.isRegistrationOpen ? (
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px]">
              Inscripción abierta (hasta F5)
            </span>
          ) : (
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px]">
              Inscripciones cerradas (F6+)
            </span>
          )}
        </div>

        {/* Sync Status, User Auth state and GAS connection */}
        <div className="flex items-center gap-2.5 ml-auto">
          {/* User Account / Role Pill */}
          {isUser ? (
            <div className="flex items-center gap-2">
              <div
                onClick={() => setActiveTab('admin')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 hover:border-slate-600 cursor-pointer transition text-[11px]"
                title="Administrar cuenta"
              >
                {isAdmin ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className="text-slate-200 font-medium max-w-[100px] sm:max-w-[140px] truncate">
                  {userProfile?.displayName || user?.email?.split('@')[0]}
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                    isAdmin
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {isAdmin ? 'ADMIN' : 'USUARIO'}
                </span>
              </div>

              <button
                onClick={() => logout()}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 transition border border-slate-700"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('admin')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition text-[11px] font-semibold"
            >
              <LogIn className="w-3 h-3" />
              <span>Acceso Admin</span>
            </button>
          )}

          {/* Sync status */}
          {syncSource === 'gas' ? (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-semibold">Google Sheets</span>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('setup')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition"
              title="Haz clic para vincular tu Google Sheets"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Modo Local</span>
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={isSyncing}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition disabled:opacity-50"
            title="Sincronizar datos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('standings')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
            <Trophy className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-white group-hover:text-emerald-400 transition">
                LIGA ACADEMIA
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-emerald-500 text-slate-950 rounded">
                OFICIAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Torneo de Fútbol & Gestión Integral</p>
          </div>
        </div>

        {/* Navigation Tabs (Promiedos Style) */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full md:w-auto">
          <button
            onClick={() => setActiveTab('standings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'standings'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Table2 className="w-4 h-4" />
            <span>Posiciones</span>
          </button>

          <button
            onClick={() => setActiveTab('fixture')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'fixture'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Fixture</span>
            <span className="px-1.5 py-0.2 rounded text-[11px] bg-slate-950/40 text-slate-200">
              F{config.currentDateNumber}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('playoffs')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'playoffs'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Playoffs</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'stats'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Goleadores</span>
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block"></div>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'admin'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-amber-400 hover:bg-amber-500/10 border border-amber-500/30'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Admin</span>
            {isAdmin && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('setup')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'setup'
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Código de Apps Script y Estructura de Hojas"
          >
            <FileCode2 className="w-4 h-4" />
            <span className="hidden xl:inline">Google Apps Script</span>
            <span className="xl:hidden">.GS</span>
          </button>
        </nav>
      </div>

      {syncError && (
        <div className="bg-amber-950/60 border-t border-amber-800/50 px-4 py-1.5 text-xs text-amber-300 flex items-center justify-between">
          <span>{syncError}</span>
          <button
            onClick={() => setActiveTab('setup')}
            className="underline font-semibold hover:text-white"
          >
            Ver configuración
          </button>
        </div>
      )}
    </header>
  );
};
