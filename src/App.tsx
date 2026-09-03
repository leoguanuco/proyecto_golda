import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StandingsTable } from './components/StandingsTable';
import { FixtureViewer } from './components/FixtureViewer';
import { PlayoffBracket } from './components/PlayoffBracket';
import { StatsView } from './components/StatsView';
import { AdminPanel } from './components/AdminPanel';
import { AppsScriptSetupModal } from './components/AppsScriptSetupModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  getStoredTournamentData,
  saveStoredTournamentData,
  fetchTournamentData,
  saveMatchScore,
  generateNextTournamentDate,
  addTeam,
  updateTeam,
  deleteTeam,
  savePlayoffMatchResult,
  pingAppsScript,
  resetTournament,
  resetLocalTournamentData,
  setSavedAppsScriptUrl,
} from './services/appsScriptService';
import { TournamentData, Match, Team, PlayoffMatch, TournamentConfig } from './types';

function AppContent() {
  const [tournamentData, setTournamentData] = useState<TournamentData>(getStoredTournamentData);
  const [activeTab, setActiveTab] = useState<'standings' | 'fixture' | 'playoffs' | 'stats' | 'admin' | 'setup'>('standings');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSource, setSyncSource] = useState<'gas' | 'local'>('local');
  const [syncError, setSyncError] = useState<string | undefined>(undefined);

  const { isAdmin, isUser } = useAuth();

  // Selected Match for Rapid Admin Editing
  const [selectedMatchForEdit, setSelectedMatchForEdit] = useState<Match | null>(null);

  // Sync with Google Apps Script
  const syncData = useCallback(async (customUrl?: string) => {
    setIsSyncing(true);
    setSyncError(undefined);
    try {
      const res = await fetchTournamentData(customUrl);
      setTournamentData(res.data);
      setSyncSource(res.source);
      if (res.error) setSyncError(res.error);
    } catch (err: any) {
      setSyncError('Error de red al sincronizar con Google Sheets');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Initial Sync
  useEffect(() => {
    syncData();
  }, [syncData]);

  // Match Score Save Handler
  const handleSaveMatchScore = async (match: Match) => {
    const res = await saveMatchScore(match, tournamentData);
    if (res.success) {
      setTournamentData(res.data);
    }
    return res;
  };

  // Fixture Generator Handler
  const handleGenerateNextDate = async () => {
    const res = await generateNextTournamentDate(tournamentData);
    if (res.success) {
      setTournamentData(res.data);
    }
    return res;
  };

  // Team Management Handlers
  const handleAddTeam = async (teamInfo: {
    name: string;
    shortName: string;
    color: string;
    badgeEmoji: string;
    entryDate: number;
  }) => {
    const res = await addTeam(teamInfo, tournamentData);
    if (res.success) {
      setTournamentData(res.data);
    }
    return res;
  };

  const handleUpdateTeam = async (team: Team) => {
    const res = await updateTeam(team, tournamentData);
    if (res.success) {
      setTournamentData(res.data);
    }
    return res;
  };

  const handleDeleteTeam = async (teamId: string) => {
    const res = await deleteTeam(teamId, tournamentData);
    if (res.success) {
      setTournamentData(res.data);
    }
    return res;
  };

  // Playoff Match Handler
  const handleSavePlayoffMatch = async (match: PlayoffMatch) => {
    const res = await savePlayoffMatchResult(match, tournamentData);
    if (res.success) {
      setTournamentData(res.data);
    }
    return res;
  };

  // Config Update Handler
  const handleUpdateConfig = (newConfig: Partial<TournamentConfig>) => {
    const updated: TournamentData = {
      ...tournamentData,
      config: {
        ...tournamentData.config,
        ...newConfig,
      },
    };
    setTournamentData(updated);
    saveStoredTournamentData(updated);
    if (newConfig.appsScriptUrl !== undefined) {
      setSavedAppsScriptUrl(newConfig.appsScriptUrl);
    }
  };

  // Ping GAS Handler
  const handlePingGas = async (url: string) => {
    const res = await pingAppsScript(url);
    if (res.success) {
      setSyncSource('gas');
      syncData(url);
    }
    return res;
  };

  // Reset Handler (Dispatches POST to GAS and resets local state keeping enrolled teams with 0 stats)
  const handleResetTournament = async () => {
    setIsSyncing(true);
    try {
      const res = await resetTournament(tournamentData);
      setTournamentData(res.data);
    } catch (err: any) {
      console.error('Error resetting tournament', err);
      const fresh = resetLocalTournamentData();
      setTournamentData(fresh);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Promiedos-Style Sports League Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        config={tournamentData.config}
        onRefresh={() => syncData()}
        isSyncing={isSyncing}
        syncSource={syncSource}
        syncError={syncError}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-8">
        {activeTab === 'standings' && (
          <StandingsTable
            teams={tournamentData.teams}
            matches={tournamentData.matches}
            onGoToFixture={(d) => {
              setActiveTab('fixture');
            }}
          />
        )}

        {activeTab === 'fixture' && (
          <FixtureViewer
            matches={tournamentData.matches}
            teams={tournamentData.teams}
            config={tournamentData.config}
            isAdminLoggedIn={isAdmin}
            onEditMatch={(m) => {
              setSelectedMatchForEdit(m);
              setActiveTab('admin');
            }}
          />
        )}

        {activeTab === 'playoffs' && (
          <PlayoffBracket
            playoffs={tournamentData.playoffs}
            config={tournamentData.config}
            isAdminLoggedIn={isAdmin}
            onEditPlayoffMatch={(m) => {
              setActiveTab('admin');
            }}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            scorers={tournamentData.scorers}
            teams={tournamentData.teams}
            matches={tournamentData.matches}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            tournamentData={tournamentData}
            onSaveMatchScore={handleSaveMatchScore}
            onGenerateNextDate={handleGenerateNextDate}
            onAddTeam={handleAddTeam}
            onUpdateTeam={handleUpdateTeam}
            onDeleteTeam={handleDeleteTeam}
            onSavePlayoffMatch={handleSavePlayoffMatch}
            onUpdateConfig={handleUpdateConfig}
            onPingGas={handlePingGas}
            onResetTournament={handleResetTournament}
            selectedMatchForEdit={selectedMatchForEdit}
            onClearSelectedMatch={() => setSelectedMatchForEdit(null)}
          />
        )}

        {activeTab === 'setup' && <AppsScriptSetupModal tournamentData={tournamentData} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2025 LIGA ACADEMIA — Sistema de Gestión Deportiva & Google Apps Script API</p>
          <div className="flex items-center gap-4 text-slate-500">
            <button onClick={() => setActiveTab('setup')} className="hover:text-emerald-600 font-medium transition">
              Estructura Google Sheets
            </button>
            <span>•</span>
            <button onClick={() => setActiveTab('admin')} className="hover:text-amber-600 font-medium transition">
              Panel Admin
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
