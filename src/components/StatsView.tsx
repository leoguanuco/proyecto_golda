import React from 'react';
import { Award, Target, Shield, Flame, Activity, Zap } from 'lucide-react';
import { TopScorer, Team, Match } from '../types';

interface StatsViewProps {
  scorers: TopScorer[];
  teams: Team[];
  matches: Match[];
}

export const StatsView: React.FC<StatsViewProps> = ({ scorers, teams, matches }) => {
  const finishedMatches = matches.filter(
    (m) => m.status === 'finished' && m.homeGoals !== null && m.awayGoals !== null
  );

  const totalGoals = finishedMatches.reduce(
    (sum, m) => sum + (m.homeGoals || 0) + (m.awayGoals || 0),
    0
  );

  const avgGoals = finishedMatches.length > 0 ? (totalGoals / finishedMatches.length).toFixed(2) : '0';

  // Best attack & defense
  const activeTeams = teams.filter((t) => t.active);
  const bestAttack = [...activeTeams].sort((a, b) => b.gf - a.gf)[0];
  const bestDefense = [...activeTeams].sort((a, b) => a.gc - b.gc)[0];
  const undefeated = activeTeams.filter((t) => t.pp === 0 && t.pj > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">
            ESTADÍSTICAS & GOLEADORES
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Líderes
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Máximos artilleros, balance goleador y récords del torneo
        </p>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Goles Totales</p>
            <p className="text-xl sm:text-2xl font-mono-score font-bold text-slate-900">{totalGoals}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Promedio / Partido</p>
            <p className="text-xl sm:text-2xl font-mono-score font-bold text-slate-900">{avgGoals}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Mejor Ataque</p>
            <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{bestAttack?.name || '-'}</p>
            <p className="text-[11px] font-mono-score text-emerald-700 font-bold">{bestAttack?.gf || 0} goles</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Valla Menos Vencida</p>
            <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{bestDefense?.name || '-'}</p>
            <p className="text-[11px] font-mono-score text-emerald-700 font-bold">{bestDefense?.gc || 0} goles</p>
          </div>
        </div>
      </div>

      {/* Top Scorers Leaderboard (Promiedos Style) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-display font-bold text-slate-900 text-lg">TABLA DE GOLEADORES</h3>
          </div>
          <span className="text-xs text-slate-500">Temporada 2025</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 tracking-wider uppercase">
                <th className="py-3 px-4 text-center w-12">#</th>
                <th className="py-3 px-4">JUGADOR</th>
                <th className="py-3 px-4">EQUIPO</th>
                <th className="py-3 px-4 text-center font-black text-emerald-700 bg-emerald-50/70">GOLES</th>
                <th className="py-3 px-4 text-center">PARTIDOS</th>
                <th className="py-3 px-4 text-center">PROMEDIO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {scorers.map((scorer, index) => {
                const ratio = (scorer.goals / scorer.matches).toFixed(2);

                return (
                  <tr
                    key={`${scorer.id}-${index}`}
                    className="hover:bg-slate-50/80 transition group"
                  >
                    <td className="py-3.5 px-4 text-center font-bold font-mono">
                      {index === 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-extrabold text-xs">
                          1
                        </span>
                      ) : (
                        <span className="text-slate-500">{index + 1}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 group-hover:text-emerald-700 transition">
                      {scorer.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs">
                        {scorer.teamName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono-score font-extrabold text-emerald-700 text-base bg-emerald-50/50">
                      {scorer.goals}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono-score text-slate-700">
                      {scorer.matches}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono-score text-slate-500">
                      {ratio}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
