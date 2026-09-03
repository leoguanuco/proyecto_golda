import React, { useState } from 'react';
import { Search, ChevronRight, Award, Info, Shield, CheckCircle2, XCircle, MinusCircle, Sparkles } from 'lucide-react';
import { Team, Match } from '../types';
import { calculateStandings } from '../services/fixtureAlgorithm';

interface StandingsTableProps {
  teams: Team[];
  matches: Match[];
  onSelectTeam?: (team: Team) => void;
  onGoToFixture?: (dateNumber?: number) => void;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  teams,
  matches,
  onSelectTeam,
  onGoToFixture,
}) => {
  const [search, setSearch] = useState('');
  const [selectedTeamDetails, setSelectedTeamDetails] = useState<Team | null>(null);

  const standings = calculateStandings(teams, matches);

  const filteredStandings = standings.filter((row) =>
    row.team.name.toLowerCase().includes(search.toLowerCase()) ||
    row.team.shortName.toLowerCase().includes(search.toLowerCase())
  );

  // Helper for match result icon
  const renderFormBadge = (result: 'W' | 'D' | 'L', index: number) => {
    switch (result) {
      case 'W':
        return (
          <span
            key={index}
            className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-emerald-600 text-white shadow-sm"
            title="Victoria"
          >
            V
          </span>
        );
      case 'D':
        return (
          <span
            key={index}
            className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-amber-500 text-slate-950 shadow-sm"
            title="Empate"
          >
            E
          </span>
        );
      case 'L':
        return (
          <span
            key={index}
            className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-rose-600 text-white shadow-sm"
            title="Derrota"
          >
            D
          </span>
        );
      default:
        return null;
    }
  };

  // Past and upcoming matches for selected team modal
  const teamMatches = selectedTeamDetails
    ? matches.filter(
        (m) => m.homeTeamId === selectedTeamDetails.id || m.awayTeamId === selectedTeamDetails.id
      ).sort((a, b) => a.dateNumber - b.dateNumber)
    : [];

  return (
    <div className="space-y-6">
      {/* Header with Search and Summary Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">
                TABLA DE POSICIONES
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Oficial
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Clasificación actualizada en tiempo real según resultados disputados
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar equipo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
            />
          </div>
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap items-center gap-3 pt-4 mt-4 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500"></span>
            <span className="text-slate-600 font-medium">1º al 8º: Clasifican a Copa Oro (Playoffs)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500"></span>
            <span className="text-slate-600 font-medium">9º al 12º: Copa Plata</span>
          </div>
          <div className="ml-auto text-[11px] text-slate-400 hidden lg:block">
            Criterios de desempate: Puntos &gt; Diferencia de Gol &gt; Goles a Favor
          </div>
        </div>
      </div>

      {/* Promiedos Styled Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] sm:text-xs font-bold text-slate-600 tracking-wider uppercase">
                <th className="py-3 px-3 sm:px-4 text-center w-12">#</th>
                <th className="py-3 px-3 sm:px-4">EQUIPO</th>
                <th className="py-3 px-2 sm:px-3 text-center font-black text-emerald-700 bg-emerald-50/70">PTS</th>
                <th className="py-3 px-2 sm:px-3 text-center">PJ</th>
                <th className="py-3 px-2 sm:px-3 text-center">PG</th>
                <th className="py-3 px-2 sm:px-3 text-center">PE</th>
                <th className="py-3 px-2 sm:px-3 text-center">PP</th>
                <th className="py-3 px-2 sm:px-3 text-center hidden sm:table-cell">GF</th>
                <th className="py-3 px-2 sm:px-3 text-center hidden sm:table-cell">GC</th>
                <th className="py-3 px-2 sm:px-3 text-center font-medium">DG</th>
                <th className="py-3 px-3 sm:px-4 text-center hidden md:table-cell">ÚLTIMOS 5</th>
                <th className="py-3 px-2 text-center w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredStandings.map((row, index) => {
                const isGold = row.zone === 'playoff_gold';
                const isSilver = row.zone === 'playoff_silver';

                return (
                  <tr
                    key={`${row.teamId}-${index}`}
                    onClick={() => setSelectedTeamDetails(row.team)}
                    className={`group cursor-pointer transition duration-150 hover:bg-slate-50/80 ${
                      isGold
                        ? 'border-l-4 border-l-emerald-500 bg-emerald-50/20'
                        : isSilver
                        ? 'border-l-4 border-l-blue-500 bg-blue-50/20'
                        : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    {/* Rank Badge */}
                    <td className="py-3.5 px-3 sm:px-4 text-center font-bold">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-mono text-xs ${
                          isGold
                            ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-200'
                            : isSilver
                            ? 'bg-blue-100 text-blue-800 font-bold border border-blue-200'
                            : 'text-slate-500'
                        }`}
                      >
                        {row.rank}
                      </span>
                    </td>

                    {/* Team Name + Badge */}
                    <td className="py-3.5 px-3 sm:px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-sm sm:text-base font-bold shadow-sm"
                          style={{
                            backgroundColor: row.team.color ? `${row.team.color}15` : '#f1f5f9',
                            borderColor: row.team.color || '#cbd5e1',
                            borderWidth: '1px',
                          }}
                        >
                          {row.team.badgeEmoji || '⚽'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition">
                              {row.team.name}
                            </span>
                            {row.team.entryDate > 1 && (
                              <span
                                className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200"
                                title={`Ingresó tardíamente en Fecha ${row.team.entryDate}`}
                              >
                                Debut F{row.team.entryDate}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono sm:hidden">
                            {row.team.shortName}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Points (High Contrast Pill) */}
                    <td className="py-3.5 px-2 sm:px-3 text-center bg-emerald-50/50 font-black font-mono-score text-emerald-700 text-sm sm:text-base">
                      {row.pts}
                    </td>

                    {/* Match Stats */}
                    <td className="py-3.5 px-2 sm:px-3 text-center font-mono-score text-slate-700">
                      {row.pj}
                    </td>
                    <td className="py-3.5 px-2 sm:px-3 text-center font-mono-score text-slate-700">
                      {row.pg}
                    </td>
                    <td className="py-3.5 px-2 sm:px-3 text-center font-mono-score text-slate-700">
                      {row.pe}
                    </td>
                    <td className="py-3.5 px-2 sm:px-3 text-center font-mono-score text-slate-700">
                      {row.pp}
                    </td>
                    <td className="py-3.5 px-2 sm:px-3 text-center font-mono-score text-slate-500 hidden sm:table-cell">
                      {row.gf}
                    </td>
                    <td className="py-3.5 px-2 sm:px-3 text-center font-mono-score text-slate-500 hidden sm:table-cell">
                      {row.gc}
                    </td>

                    {/* Goal Difference */}
                    <td className="py-3.5 px-2 sm:px-3 text-center font-mono-score font-semibold">
                      <span
                        className={
                          row.dg > 0
                            ? 'text-emerald-600 font-bold'
                            : row.dg < 0
                            ? 'text-rose-600 font-bold'
                            : 'text-slate-500'
                        }
                      >
                        {row.dg > 0 ? `+${row.dg}` : row.dg}
                      </span>
                    </td>

                    {/* Form Streak */}
                    <td className="py-3.5 px-3 sm:px-4 text-center hidden md:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        {row.form.length > 0 ? (
                          row.form.map((res, i) => renderFormBadge(res, i))
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </div>
                    </td>

                    {/* Action Arrow */}
                    <td className="py-3.5 px-2 text-center text-slate-400 group-hover:text-emerald-600 transition">
                      <ChevronRight className="w-4 h-4 inline" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Details Modal / Drawer */}
      {selectedTeamDetails && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedTeamDetails(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border"
                  style={{
                    backgroundColor: `${selectedTeamDetails.color}15`,
                    borderColor: selectedTeamDetails.color,
                  }}
                >
                  {selectedTeamDetails.badgeEmoji || '⚽'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedTeamDetails.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{selectedTeamDetails.shortName}</span>
                    <span>•</span>
                    <span>Ingreso en Fecha {selectedTeamDetails.entryDate}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeamDetails(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] uppercase font-semibold text-slate-500">Puntos</p>
                <p className="text-xl font-mono-score font-bold text-emerald-700">{selectedTeamDetails.pts}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] uppercase font-semibold text-slate-500">PJ</p>
                <p className="text-xl font-mono-score font-bold text-slate-900">{selectedTeamDetails.pj}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] uppercase font-semibold text-slate-500">DG</p>
                <p className={`text-xl font-mono-score font-bold ${selectedTeamDetails.dg >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedTeamDetails.dg > 0 ? `+${selectedTeamDetails.dg}` : selectedTeamDetails.dg}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] uppercase font-semibold text-slate-500">Goles</p>
                <p className="text-xl font-mono-score font-bold text-blue-600">{selectedTeamDetails.gf}:{selectedTeamDetails.gc}</p>
              </div>
            </div>

            {/* Matches list for this team */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Historial de Partidos en el Torneo
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {teamMatches.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">Sin partidos registrados aún</p>
                ) : (
                  teamMatches.map((m) => {
                    const isHome = m.homeTeamId === selectedTeamDetails.id;
                    const opponent = isHome ? m.awayTeamName : m.homeTeamName;
                    const myGoals = isHome ? m.homeGoals : m.awayGoals;
                    const oppGoals = isHome ? m.awayGoals : m.homeGoals;
                    const isDone = m.status === 'finished';

                    let outcome: 'W' | 'D' | 'L' | 'P' = 'P';
                    if (isDone && myGoals !== null && oppGoals !== null) {
                      if (myGoals > oppGoals) outcome = 'W';
                      else if (myGoals < oppGoals) outcome = 'L';
                      else outcome = 'D';
                    }

                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                            F{m.dateNumber}
                          </span>
                          <span className="text-slate-800">
                            {isHome ? 'vs' : '@'} <span className="font-semibold">{opponent}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isDone ? (
                            <span className="font-mono font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded">
                              {m.homeGoals} - {m.awayGoals}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">{m.time || 'Programado'}</span>
                          )}

                          {outcome === 'W' && (
                            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-emerald-600 text-white">V</span>
                          )}
                          {outcome === 'D' && (
                            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-amber-400 text-slate-900">E</span>
                          )}
                          {outcome === 'L' && (
                            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-rose-600 text-white">D</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTeamDetails(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
