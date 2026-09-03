export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string;
  badgeEmoji?: string;
  badgeUrl?: string;
  city?: string;
  entryDate: number; // Fecha en la que ingresó al torneo (1, 2, 3, 4, 5)
  active: boolean;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
  // Metadata for fixture calculation
  consecutiveDoubleDatesScheduled?: number;
}

export type MatchStatus = 'scheduled' | 'live' | 'finished';

export interface Match {
  id: string;
  dateNumber: number; // Número de fecha (1, 2, 3, etc.)
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  homeGoals: number | null;
  awayGoals: number | null;
  status: MatchStatus;
  pitch: string; // Cancha (e.g., 'Cancha 1 - Principal')
  time: string; // Horario (e.g., '19:30')
  calendarDate?: string; // e.g. '2025-05-10'
  isPlayoff?: boolean;
  playoffRound?: string;
  bracketId?: string;
}

export type FormResult = 'W' | 'D' | 'L'; // Victoria, Empate, Derrota (V, E, D)

export interface StandingsRow {
  rank: number;
  teamId: string;
  team: Team;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
  zone: 'playoff_gold' | 'playoff_silver' | 'none';
  zoneLabel: string;
  form: FormResult[];
}

export interface PlayoffTeamRef {
  teamId: string | null;
  name: string;
  color?: string;
  badgeEmoji?: string;
  seed?: number;
}

export type PlayoffRound = 'cuartos' | 'semis' | 'final' | 'tercero';

export interface PlayoffMatch {
  id: string;
  round: PlayoffRound;
  roundLabel: string;
  bracketIndex: number; // 0, 1, 2, 3...
  homeTeam: PlayoffTeamRef;
  awayTeam: PlayoffTeamRef;
  homeGoals: number | null;
  awayGoals: number | null;
  homePenalties?: number | null;
  awayPenalties?: number | null;
  winnerId: string | null;
  status: 'pending' | 'live' | 'finished';
  pitch?: string;
  time?: string;
  nextMatchId?: string;
}

export interface TournamentConfig {
  tournamentName: string;
  currentDateNumber: number;
  maxRegistrationDate: number; // 5
  isRegistrationOpen: boolean; // true si currentDateNumber <= 5
  playoffGoldSpots: number; // 8
  playoffSilverSpots: number; // 4
  adminPin: string;
  appsScriptUrl: string;
  lastSyncedAt: string | null;
  totalPlannedDates: number;
  season: string;
  category: string;
}

export interface GenerationResult {
  success: boolean;
  dateGenerated: number;
  matchesCreated: Match[];
  isLocked: boolean; // Si llegó a fecha 6 y generó todo el fixture restante
  remainingDatesGenerated?: number[];
  warnings?: string[];
  logs: string[];
}

export interface TopScorer {
  id: string;
  name: string;
  teamName: string;
  teamColor: string;
  goals: number;
  matches: number;
}

export interface TournamentData {
  config: TournamentConfig;
  teams: Team[];
  matches: Match[];
  playoffs: PlayoffMatch[];
  scorers: TopScorer[];
}

export interface AppsScriptApiResponse {
  success: boolean;
  message?: string;
  data?: TournamentData;
  error?: string;
}

export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt?: string;
  lastLoginAt?: string;
}
