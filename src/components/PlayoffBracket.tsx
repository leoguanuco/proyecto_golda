import React, { useState } from 'react';
import { Trophy, Award, Sparkles, CheckCircle2, Shield, Edit3, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlayoffMatch, PlayoffRound, TournamentConfig } from '../types';

interface PlayoffBracketProps {
  playoffs: PlayoffMatch[];
  config: TournamentConfig;
  onEditPlayoffMatch?: (match: PlayoffMatch) => void;
  isAdminLoggedIn?: boolean;
}

export const PlayoffBracket: React.FC<PlayoffBracketProps> = ({
  playoffs,
  config,
  onEditPlayoffMatch,
  isAdminLoggedIn,
}) => {
  const [celebrated, setCelebrated] = useState(false);

  // Group playoff matches by round
  const cuartos = playoffs.filter((p) => p.round === 'cuartos').sort((a, b) => a.bracketIndex - b.bracketIndex);
  const semis = playoffs.filter((p) => p.round === 'semis').sort((a, b) => a.bracketIndex - b.bracketIndex);
  const finalMatch = playoffs.find((p) => p.round === 'final');
  const tercerPuesto = playoffs.find((p) => p.round === 'tercero');

  // Determine champion if final is finished
  const championTeamName = finalMatch?.status === 'finished' && finalMatch.winnerId
    ? (finalMatch.winnerId === finalMatch.homeTeam.teamId ? finalMatch.homeTeam.name : finalMatch.awayTeam.name)
    : null;

  const triggerCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#3B82F6', '#F59E0B', '#FFFFFF'],
    });
    setCelebrated(true);
  };

  const renderMatchCard = (match: PlayoffMatch, label: string, keySuffix: string = '') => {
    const isFinished = match.status === 'finished';
    const isLive = match.status === 'live';
    const homeWon = isFinished && match.winnerId === match.homeTeam.teamId;
    const awayWon = isFinished && match.winnerId === match.awayTeam.teamId;

    return (
      <div
        key={`${match.id}-${keySuffix}`}
        className={`bg-white border rounded-xl p-4 shadow-sm relative transition duration-200 hover:border-slate-300 hover:shadow-md ${
          isFinished
            ? 'border-slate-200'
            : isLive
            ? 'border-emerald-500 ring-1 ring-emerald-500/30'
            : 'border-slate-200 bg-white'
        }`}
      >
        {/* Match Header */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pb-2.5 mb-2.5 border-b border-slate-100">
          <span className="font-bold text-slate-700">{label}</span>
          <div className="flex items-center gap-1.5">
            {isLive ? (
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] animate-pulse border border-rose-200">
                EN VIVO
              </span>
            ) : isFinished ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Finalizado
              </span>
            ) : (
              <span className="text-slate-400">{match.time || 'Por disputarse'}</span>
            )}

            {isAdminLoggedIn && onEditPlayoffMatch && (
              <button
                onClick={() => onEditPlayoffMatch(match)}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-amber-700 transition ml-1"
                title="Cargar resultado de playoff"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Teams & Scores */}
        <div className="space-y-2 text-xs sm:text-sm">
          {/* Home Team */}
          <div
            className={`flex items-center justify-between p-2 rounded-xl transition border ${
              homeWon
                ? 'bg-emerald-50 text-slate-900 font-bold border-emerald-300'
                : 'bg-slate-50 text-slate-700 border-slate-200/80'
            }`}
          >
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center text-xs shrink-0 shadow-2xs">
                {match.homeTeam.badgeEmoji || '⚽'}
              </span>
              <span className="truncate">{match.homeTeam.name || 'A definir'}</span>
            </div>
            <div className="flex items-center gap-1 font-mono font-bold shrink-0">
              {match.homeGoals !== null ? (
                <>
                  <span className={`px-2 py-0.5 rounded bg-white border border-slate-200 ${homeWon ? 'text-emerald-700 font-black' : 'text-slate-700'}`}>
                    {match.homeGoals}
                  </span>
                  {match.homePenalties !== null && match.homePenalties !== undefined && (
                    <span className="text-[10px] text-amber-700 px-1 py-0.5 bg-amber-50 rounded border border-amber-200">
                      ({match.homePenalties}p)
                    </span>
                  )}
                </>
              ) : (
                <span className="text-slate-400">-</span>
              )}
            </div>
          </div>

          {/* Away Team */}
          <div
            className={`flex items-center justify-between p-2 rounded-xl transition border ${
              awayWon
                ? 'bg-emerald-50 text-slate-900 font-bold border-emerald-300'
                : 'bg-slate-50 text-slate-700 border-slate-200/80'
            }`}
          >
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center text-xs shrink-0 shadow-2xs">
                {match.awayTeam.badgeEmoji || '⚽'}
              </span>
              <span className="truncate">{match.awayTeam.name || 'A definir'}</span>
            </div>
            <div className="flex items-center gap-1 font-mono font-bold shrink-0">
              {match.awayGoals !== null ? (
                <>
                  <span className={`px-2 py-0.5 rounded bg-white border border-slate-200 ${awayWon ? 'text-emerald-700 font-black' : 'text-slate-700'}`}>
                    {match.awayGoals}
                  </span>
                  {match.awayPenalties !== null && match.awayPenalties !== undefined && (
                    <span className="text-[10px] text-amber-700 px-1 py-0.5 bg-amber-50 rounded border border-amber-200">
                      ({match.awayPenalties}p)
                    </span>
                  )}
                </>
              ) : (
                <span className="text-slate-400">-</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">
                ORGANIGRAMA DE PLAYOFFS
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Copa Oro
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Cruces eliminatorios directos: Cuartos de final, Semifinales y Gran Final
            </p>
          </div>

          {championTeamName && (
            <button
              onClick={triggerCelebration}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:scale-105 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>¡Festejar Campeón!</span>
            </button>
          )}
        </div>
      </div>

      {/* Champion Showcase Banner (if decided) */}
      {championTeamName && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-emerald-500/30 text-white rounded-xl p-6 sm:p-8 text-center shadow-lg space-y-3 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-400" />
            CAMPEÓN LIGA ACADEMIA 2025
          </div>
          <h3 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight">
            👑 {championTeamName}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            ¡Felicitaciones al nuevo monarca del torneo tras consagrarse en la Gran Final!
          </p>
        </div>
      )}

      {/* Interactive Bracket Tree Grid */}
      <div className="overflow-x-auto pb-6">
        <div className="min-w-[900px] grid grid-cols-3 gap-6 relative">
          {/* Column 1: Cuartos de Final (4 matches) */}
          <div className="space-y-4">
            <div className="text-center pb-2 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Cuartos de Final
              </span>
              <p className="text-[11px] text-slate-400">Cruces de 8 Clasificados</p>
            </div>

            <div className="space-y-4">
              {cuartos.map((match, i) =>
                renderMatchCard(match, `Llave ${i + 1} (${match.homeTeam.seed ? `${match.homeTeam.seed}º` : ''} vs ${match.awayTeam.seed ? `${match.awayTeam.seed}º` : ''})`)
              )}
            </div>
          </div>

          {/* Column 2: Semifinales (2 matches) */}
          <div className="space-y-4 flex flex-col justify-center">
            <div className="text-center pb-2 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Semifinales
              </span>
              <p className="text-[11px] text-slate-400">Paso a la Gran Final</p>
            </div>

            <div className="space-y-16 py-8">
              {semis.map((match, i) =>
                renderMatchCard(match, `Semifinal ${i + 1}`)
              )}
            </div>
          </div>

          {/* Column 3: Gran Final & 3er Puesto */}
          <div className="space-y-4 flex flex-col justify-center">
            <div className="text-center pb-2 border-b border-amber-300">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 text-amber-600" />
                GRAN FINAL
              </span>
              <p className="text-[11px] text-slate-400">Por la Gloria Eterna</p>
            </div>

            <div className="space-y-6">
              {finalMatch && renderMatchCard(finalMatch, '🏆 PARTIDO DEFINITORIO')}
              {tercerPuesto && renderMatchCard(tercerPuesto, '🥉 3er y 4to Puesto')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
