import React, { useState, useMemo } from 'react';
import { Calendar, Clock, MapPin, CheckCircle, Radio, Sparkles, ChevronLeft, ChevronRight, Edit3, ShieldAlert } from 'lucide-react';
import { Match, Team, TournamentConfig } from '../types';

interface FixtureViewerProps {
  matches: Match[];
  teams: Team[];
  config: TournamentConfig;
  onEditMatch?: (match: Match) => void;
  isAdminLoggedIn?: boolean;
}

export const FixtureViewer: React.FC<FixtureViewerProps> = ({
  matches,
  teams,
  config,
  onEditMatch,
  isAdminLoggedIn,
}) => {
  // Extract all distinct date numbers available
  const availableDates = useMemo(() => {
    const dates: number[] = Array.from(new Set(matches.filter((m) => !m.isPlayoff).map((m) => m.dateNumber)));
    return dates.sort((a: number, b: number) => a - b);
  }, [matches]);

  const defaultDate = availableDates.length > 0
    ? (availableDates.includes(config.currentDateNumber) ? config.currentDateNumber : availableDates[availableDates.length - 1])
    : 1;

  const [selectedDate, setSelectedDate] = useState<number>(defaultDate);
  const [statusFilter, setStatusFilter] = useState<'all' | 'finished' | 'live' | 'scheduled'>('all');

  // Filter matches for current selected date
  const dateMatches = useMemo(() => {
    return matches.filter((m) => !m.isPlayoff && m.dateNumber === selectedDate);
  }, [matches, selectedDate]);

  const filteredMatches = useMemo(() => {
    if (statusFilter === 'all') return dateMatches;
    return dateMatches.filter((m) => m.status === statusFilter);
  }, [dateMatches, statusFilter]);

  // Check double matches in this date (teams appearing > 1 time)
  const teamMatchCountsThisDate = useMemo(() => {
    const counts: Record<string, number> = {};
    dateMatches.forEach((m) => {
      counts[m.homeTeamId] = (counts[m.homeTeamId] || 0) + 1;
      counts[m.awayTeamId] = (counts[m.awayTeamId] || 0) + 1;
    });
    return counts;
  }, [dateMatches]);

  const getTeamObj = (teamId: string): Team | undefined => {
    return teams.find((t) => t.id === teamId);
  };

  const handlePrevDate = () => {
    const currentIndex = availableDates.indexOf(selectedDate);
    if (currentIndex > 0) {
      setSelectedDate(availableDates[currentIndex - 1]);
    }
  };

  const handleNextDate = () => {
    const currentIndex = availableDates.indexOf(selectedDate);
    if (currentIndex < availableDates.length - 1) {
      setSelectedDate(availableDates[currentIndex + 1]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Switcher Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">
                CRONOGRAMA DE PARTIDOS
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Fixture
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Resultados, horarios y canchas asignadas fecha por fecha
            </p>
          </div>

          {/* Quick Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs self-start md:self-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({dateMatches.length})
            </button>
            <button
              onClick={() => setStatusFilter('finished')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                statusFilter === 'finished' ? 'bg-white text-emerald-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Jugados
            </button>
            <button
              onClick={() => setStatusFilter('scheduled')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                statusFilter === 'scheduled' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendientes
            </button>
          </div>
        </div>

        {/* Date Selector Carousel / Tabs (Promiedos Style) */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={handlePrevDate}
            disabled={availableDates.indexOf(selectedDate) <= 0}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:hover:bg-slate-100 transition border border-slate-200"
            title="Fecha anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 overflow-x-auto py-1 px-2 scrollbar-none max-w-full">
            {availableDates.map((dateNum) => {
              const isSelected = dateNum === selectedDate;
              const isCurrent = dateNum === config.currentDateNumber;
              const matchesCount = matches.filter((m) => m.dateNumber === dateNum).length;

              return (
                <button
                  key={dateNum}
                  onClick={() => setSelectedDate(dateNum)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 whitespace-nowrap shadow-sm ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-400/40 shadow-emerald-500/20'
                      : isCurrent
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>Fecha {dateNum}</span>
                  {isCurrent && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-emerald-200 text-emerald-900">
                      Actual
                    </span>
                  )}
                  <span className={`text-[10px] opacity-70 ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                    ({matchesCount})
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNextDate}
            disabled={availableDates.indexOf(selectedDate) >= availableDates.length - 1}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:hover:bg-slate-100 transition border border-slate-200"
            title="Siguiente fecha"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Matches Grid (Promiedos Style Match Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMatches.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 shadow-sm">
            <Calendar className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <p className="font-semibold text-slate-800">No hay partidos para los filtros seleccionados</p>
            <p className="text-xs text-slate-400 mt-1">
              Prueba cambiando a otra fecha o restableciendo los filtros
            </p>
          </div>
        ) : (
          filteredMatches.map((match, idx) => {
            const homeTeam = getTeamObj(match.homeTeamId);
            const awayTeam = getTeamObj(match.awayTeamId);
            const isFinished = match.status === 'finished';
            const isLive = match.status === 'live';

            const homePlaysDouble = (teamMatchCountsThisDate[match.homeTeamId] || 0) > 1;
            const awayPlaysDouble = (teamMatchCountsThisDate[match.awayTeamId] || 0) > 1;

            return (
              <div
                key={`${match.id}-${idx}`}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition duration-200 group flex flex-col justify-between"
              >
                {/* Match Header: Time & Pitch */}
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100 mb-3.5">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="flex items-center gap-1 font-mono-score font-medium text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {match.time || '19:00'}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500 truncate max-w-[150px] sm:max-w-[200px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {match.pitch || 'Cancha Principal'}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {isLive ? (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold animate-pulse">
                        <Radio className="w-3 h-3" />
                        EN VIVO
                      </span>
                    ) : isFinished ? (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1 border border-slate-200">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Finalizado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
                        Programado
                      </span>
                    )}

                    {isAdminLoggedIn && onEditMatch && (
                      <button
                        onClick={() => onEditMatch(match)}
                        className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-amber-700 transition ml-1"
                        title="Editar marcador"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Scoreboard Card (Promiedos Style Center Display) */}
                <div className="grid grid-cols-7 items-center gap-2 py-1">
                  {/* Home Team */}
                  <div className="col-span-3 flex items-center gap-2 sm:gap-3 text-left">
                    <div
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base sm:text-lg font-bold shadow-sm shrink-0 border"
                      style={{
                        backgroundColor: homeTeam?.color ? `${homeTeam.color}15` : '#f1f5f9',
                        borderColor: homeTeam?.color || '#cbd5e1',
                      }}
                    >
                      {homeTeam?.badgeEmoji || '⚽'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs sm:text-sm truncate group-hover:text-emerald-700 transition">
                        {match.homeTeamName}
                      </p>
                      {homePlaysDouble && (
                        <span className="inline-block text-[9px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          Fecha Doble
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score Box in Center */}
                  <div className="col-span-1 flex flex-col items-center justify-center">
                    {isFinished ? (
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-inner font-mono-score font-extrabold text-base sm:text-xl text-emerald-700">
                        <span>{match.homeGoals}</span>
                        <span className="text-slate-400 text-sm">-</span>
                        <span>{match.awayGoals}</span>
                      </div>
                    ) : (
                      <div className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl text-slate-500 font-mono text-xs font-bold">
                        VS
                      </div>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="col-span-3 flex items-center justify-end gap-2 sm:gap-3 text-right">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs sm:text-sm truncate group-hover:text-emerald-700 transition">
                        {match.awayTeamName}
                      </p>
                      {awayPlaysDouble && (
                        <span className="inline-block text-[9px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          Fecha Doble
                        </span>
                      )}
                    </div>
                    <div
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base sm:text-lg font-bold shadow-sm shrink-0 border"
                      style={{
                        backgroundColor: awayTeam?.color ? `${awayTeam.color}15` : '#f1f5f9',
                        borderColor: awayTeam?.color || '#cbd5e1',
                      }}
                    >
                      {awayTeam?.badgeEmoji || '⚽'}
                    </div>
                  </div>
                </div>

                {/* Match Footer Details */}
                <div className="mt-3 pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100">
                  <span>Fecha {match.dateNumber} de {config.totalPlannedDates}</span>
                  {match.calendarDate && <span>{match.calendarDate}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
