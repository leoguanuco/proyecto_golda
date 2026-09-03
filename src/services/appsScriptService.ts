import { TournamentData, Match, Team, PlayoffMatch, AppsScriptApiResponse } from '../types';
import { INITIAL_TOURNAMENT_DATA } from '../data/mockData';
import { executeTournamentFixtureStep, calculateStandings } from './fixtureAlgorithm';

const STORAGE_KEY = 'LIGA_ACADEMIA_DATA_V1';
const CONFIG_URL_KEY = 'LIGA_ACADEMIA_GAS_URL';

export function sanitizeTeams(teams: Team[]): Team[] {
  if (!Array.isArray(teams)) return [];
  const seenIds = new Set<string>();
  const sanitized: Team[] = [];

  for (const t of teams) {
    if (!t || !t.id || !t.name || String(t.id).trim() === '' || String(t.name).trim() === '' || t.name === 'undefined') {
      continue;
    }
    let cleanId = String(t.id).trim();
    if (seenIds.has(cleanId)) {
      // Find a non-colliding new ID
      let counter = 1;
      let uniqueId = `${cleanId}_${counter}`;
      while (seenIds.has(uniqueId)) {
        counter++;
        uniqueId = `${cleanId}_${counter}`;
      }
      cleanId = uniqueId;
    }
    seenIds.add(cleanId);
    sanitized.push({
      ...t,
      id: cleanId,
      name: String(t.name).trim(),
      shortName: String(t.shortName || t.name.substring(0, 3)).trim().toUpperCase(),
    });
  }
  return sanitized;
}

export function sanitizeTournamentData(data: TournamentData): TournamentData {
  if (!data) return INITIAL_TOURNAMENT_DATA;
  const cleanTeams = sanitizeTeams(data.teams || []);
  const validTeamIds = new Set(cleanTeams.map((t) => t.id));

  const cleanMatches = (data.matches || []).filter(
    (m) =>
      m &&
      m.id &&
      String(m.id).trim() !== '' &&
      m.homeTeamId &&
      m.awayTeamId &&
      validTeamIds.has(m.homeTeamId) &&
      validTeamIds.has(m.awayTeamId)
  );

  return {
    ...data,
    teams: cleanTeams,
    matches: cleanMatches,
    playoffs: data.playoffs || [],
    scorers: data.scorers || [],
  };
}

/**
 * Loads cached or initial local tournament data
 */
export function getStoredTournamentData(): TournamentData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return sanitizeTournamentData(parsed);
    }
  } catch (e) {
    console.error('Error reading localStorage data', e);
  }
  return sanitizeTournamentData(INITIAL_TOURNAMENT_DATA);
}

/**
 * Persists data locally
 */
export function saveStoredTournamentData(data: TournamentData): void {
  try {
    const sanitized = sanitizeTournamentData(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
}

/**
 * Retrieves the configured Google Apps Script Web App URL
 */
export function getSavedAppsScriptUrl(): string {
  try {
    return localStorage.getItem(CONFIG_URL_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Stores the Google Apps Script Web App URL
 */
export function setSavedAppsScriptUrl(url: string): void {
  try {
    localStorage.setItem(CONFIG_URL_KEY, url.trim());
  } catch (e) {
    console.error('Error storing Apps Script URL', e);
  }
}

/**
 * Ping check for Google Apps Script Web App
 */
export async function pingAppsScript(url: string): Promise<{ success: boolean; message: string; timestamp?: string }> {
  if (!url || !url.startsWith('http')) {
    return { success: false, message: 'URL de Google Apps Script inválida' };
  }

  try {
    const pingUrl = url.includes('?') ? `${url}&action=ping` : `${url}?action=ping`;
    const response = await fetch(pingUrl, {
      method: 'GET',
      mode: 'cors',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      return { success: false, message: `Error HTTP ${response.status}: ${response.statusText}` };
    }

    const data = await response.json();
    return {
      success: !!data.success,
      message: data.message || 'Conexión exitosa con Google Apps Script',
      timestamp: data.timestamp || new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      success: false,
      message: `No se pudo conectar con el Web App. Verifica los permisos ('Cualquier usuario') o tu conexión: ${err.message}`,
    };
  }
}

/**
 * Fetches all tournament data from Google Apps Script (or fallback to local store)
 */
export async function fetchTournamentData(customUrl?: string): Promise<{ data: TournamentData; source: 'gas' | 'local'; error?: string }> {
  const url = customUrl !== undefined ? customUrl : getSavedAppsScriptUrl();

  if (url && url.startsWith('http')) {
    try {
      const getUrl = url.includes('?') ? `${url}&action=getInitialData` : `${url}?action=getInitialData`;
      const res = await fetch(getUrl, {
        method: 'GET',
        mode: 'cors',
        headers: { 'Accept': 'application/json' },
      });

      if (res.ok) {
        const json: AppsScriptApiResponse = await res.json();
        if (json.success && json.data) {
          // Filtrado estricto contra filas vacías / partidos fantasmas
          const cleanTeams = (json.data.teams || []).filter(
            (t) => t && t.id && String(t.id).trim() !== '' && t.name && String(t.name).trim() !== '' && t.name !== 'undefined'
          );

          const cleanMatches = (json.data.matches || []).filter(
            (m) =>
              m &&
              m.id &&
              String(m.id).trim() !== '' &&
              m.homeTeamId &&
              String(m.homeTeamId).trim() !== '' &&
              m.awayTeamId &&
              String(m.awayTeamId).trim() !== '' &&
              m.homeTeamName &&
              String(m.homeTeamName).trim() !== '' &&
              m.awayTeamName &&
              String(m.awayTeamName).trim() !== ''
          );

          const freshData: TournamentData = {
            config: {
              ...json.data.config,
              appsScriptUrl: url,
              lastSyncedAt: new Date().toISOString(),
            },
            teams: cleanTeams,
            matches: cleanMatches,
            playoffs: json.data.playoffs || [],
            scorers: json.data.scorers || [],
          };
          saveStoredTournamentData(freshData);
          return { data: freshData, source: 'gas' };
        }
      }
    } catch (err: any) {
      console.warn('Google Apps Script request failed, falling back to local simulation', err);
      const local = getStoredTournamentData();
      return {
        data: local,
        source: 'local',
        error: `Aviso: Conexión con Sheets no disponible (${err.message}). Usando base de datos local.`,
      };
    }
  }

  // Fallback local
  const localData = getStoredTournamentData();
  return { data: localData, source: 'local' };
}

/**
 * Saves a match score (Google Apps Script POST or local update)
 */
export async function saveMatchScore(
  match: Match,
  currentTournament: TournamentData
): Promise<{ success: boolean; data: TournamentData; message?: string }> {
  const url = currentTournament.config.appsScriptUrl || getSavedAppsScriptUrl();

  // Optimistic local update
  const updatedMatches = currentTournament.matches.map((m) => (m.id === match.id ? { ...m, ...match } : m));
  const updatedData: TournamentData = {
    ...currentTournament,
    matches: updatedMatches,
  };
  saveStoredTournamentData(updatedData);

  if (url && url.startsWith('http')) {
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors', // standard Apps Script redirect handling
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'saveMatchScore',
          match: match,
        }),
      });
      return { success: true, data: updatedData, message: 'Marcador sincronizado con Google Sheets' };
    } catch (e: any) {
      console.error('Apps Script POST failed', e);
      return { success: true, data: updatedData, message: 'Guardado en almacenamiento local (sin conexión a Sheets)' };
    }
  }

  return { success: true, data: updatedData, message: 'Marcador guardado en base de datos local' };
}

/**
 * Generates the next date using the strict fixture algorithm
 */
export async function generateNextTournamentDate(
  currentTournament: TournamentData
): Promise<{ success: boolean; data: TournamentData; result: any; message: string }> {
  const url = currentTournament.config.appsScriptUrl || getSavedAppsScriptUrl();

  // Execute algorithm locally for immediate feedback
  const algoResult = executeTournamentFixtureStep(
    currentTournament.config.currentDateNumber,
    currentTournament.teams,
    currentTournament.matches
  );

  if (!algoResult.success) {
    return {
      success: false,
      data: currentTournament,
      result: algoResult,
      message: 'No se pudo generar el fixture para la siguiente fecha.',
    };
  }

  const newCurrentDate = algoResult.isLocked
    ? (algoResult.remainingDatesGenerated?.[algoResult.remainingDatesGenerated.length - 1] || currentTournament.config.currentDateNumber + 1)
    : algoResult.dateGenerated;

  const isRegistrationStillOpen = newCurrentDate <= 5;

  const updatedData: TournamentData = {
    ...currentTournament,
    config: {
      ...currentTournament.config,
      currentDateNumber: newCurrentDate,
      isRegistrationOpen: isRegistrationStillOpen,
      lastSyncedAt: new Date().toISOString(),
    },
    matches: [...currentTournament.matches, ...algoResult.matchesCreated],
  };

  saveStoredTournamentData(updatedData);

  // Sync to Google Apps Script if configured
  if (url && url.startsWith('http')) {
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateNextFixture',
        }),
      });
    } catch (err) {
      console.warn('Failed to sync generated fixture to GAS', err);
    }
  }

  const message = algoResult.isLocked
    ? `¡Fecha 6 alcanzada! Se cerró la inscripción y se generó el cronograma completo de ${algoResult.matchesCreated.length} partidos restantes.`
    : `Fecha ${algoResult.dateGenerated} generada con éxito con ${algoResult.matchesCreated.length} partidos.`;

  return {
    success: true,
    data: updatedData,
    result: algoResult,
    message,
  };
}

/**
 * Adds a new team with strict verification of Date 5 limit
 */
export async function addTeam(
  teamData: { name: string; shortName: string; color: string; badgeEmoji: string; entryDate: number },
  currentTournament: TournamentData
): Promise<{ success: boolean; data: TournamentData; message: string; error?: string }> {
  // Check Date 5 rule
  if (currentTournament.config.currentDateNumber > 5 || !currentTournament.config.isRegistrationOpen) {
    return {
      success: false,
      data: currentTournament,
      message: 'No se pueden registrar nuevos equipos después de la Fecha 5.',
      error: 'Inscripción cerrada por reglamento en Fecha 5.',
    };
  }

  // Generate guaranteed unique ID
  let maxIdNum = 0;
  const existingIdSet = new Set(currentTournament.teams.map((t) => t.id));
  for (const t of currentTournament.teams) {
    const match = t.id.match(/^EQ_(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxIdNum) {
        maxIdNum = num;
      }
    }
  }
  let candidateNum = maxIdNum > 0 ? maxIdNum + 1 : currentTournament.teams.length + 1;
  let newTeamId = `EQ_${String(candidateNum).padStart(2, '0')}`;
  while (existingIdSet.has(newTeamId)) {
    candidateNum++;
    newTeamId = `EQ_${String(candidateNum).padStart(2, '0')}`;
  }

  const newTeam: Team = {
    id: newTeamId,
    name: teamData.name.trim(),
    shortName: teamData.shortName.trim().toUpperCase() || teamData.name.substring(0, 3).toUpperCase(),
    color: teamData.color || '#10B981',
    badgeEmoji: teamData.badgeEmoji || '⚽',
    entryDate: teamData.entryDate || currentTournament.config.currentDateNumber,
    active: true,
    pj: 0,
    pg: 0,
    pe: 0,
    pp: 0,
    gf: 0,
    gc: 0,
    dg: 0,
    pts: 0,
  };

  const updatedTeams = [...currentTournament.teams, newTeam];
  const updatedData: TournamentData = {
    ...currentTournament,
    teams: updatedTeams,
  };

  saveStoredTournamentData(updatedData);

  const url = currentTournament.config.appsScriptUrl || getSavedAppsScriptUrl();
  if (url && url.startsWith('http')) {
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addTeam',
          team: newTeam,
        }),
      });
    } catch (e) {
      console.warn('Failed to sync new team to GAS', e);
    }
  }

  return {
    success: true,
    data: updatedData,
    message: `Equipo "${newTeam.name}" registrado para debutar en Fecha ${newTeam.entryDate}.`,
  };
}

/**
 * Updates an existing team
 */
export async function updateTeam(
  team: Team,
  currentTournament: TournamentData
): Promise<{ success: boolean; data: TournamentData }> {
  const updatedTeams = currentTournament.teams.map((t) => (t.id === team.id ? { ...t, ...team } : t));
  const updatedData: TournamentData = { ...currentTournament, teams: updatedTeams };
  saveStoredTournamentData(updatedData);

  const url = currentTournament.config.appsScriptUrl || getSavedAppsScriptUrl();
  if (url && url.startsWith('http')) {
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'editTeam', team }),
      });
    } catch (e) {
      console.warn('GAS edit team failed', e);
    }
  }

  return { success: true, data: updatedData };
}

/**
 * Deletes a team and cleans up associated matches
 */
export async function deleteTeam(
  teamId: string,
  currentTournament: TournamentData
): Promise<{ success: boolean; data: TournamentData; message?: string }> {
  // Remove team from roster
  const updatedTeams = currentTournament.teams.filter((t) => t.id !== teamId);
  
  // Remove matches involving deleted team to prevent ghost matches
  const updatedMatches = currentTournament.matches.filter(
    (m) => m.homeTeamId !== teamId && m.awayTeamId !== teamId
  );

  const updatedData: TournamentData = {
    ...currentTournament,
    teams: updatedTeams,
    matches: updatedMatches,
  };
  saveStoredTournamentData(updatedData);

  const url = currentTournament.config.appsScriptUrl || getSavedAppsScriptUrl();
  if (url && url.startsWith('http')) {
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteTeam', teamId }),
      });
      return { success: true, data: updatedData, message: 'Equipo eliminado de la app y de Google Sheets.' };
    } catch (e) {
      console.warn('GAS delete team failed', e);
      return { success: true, data: updatedData, message: 'Equipo eliminado localmente (sin conexión a Sheets).' };
    }
  }

  return { success: true, data: updatedData, message: 'Equipo eliminado localmente.' };
}

/**
 * Saves a playoff match result and automatically advances the winner to next bracket
 */
export async function savePlayoffMatchResult(
  match: PlayoffMatch,
  currentTournament: TournamentData
): Promise<{ success: boolean; data: TournamentData; message: string }> {
  let updatedPlayoffs = currentTournament.playoffs.map((p) => (p.id === match.id ? { ...p, ...match } : p));

  // If winner determined and next match exists, advance winner
  if (match.winnerId && match.nextMatchId) {
    const winningTeam = currentTournament.teams.find((t) => t.id === match.winnerId) || {
      id: match.winnerId,
      name: match.homeTeam.teamId === match.winnerId ? match.homeTeam.name : match.awayTeam.name,
      color: match.homeTeam.teamId === match.winnerId ? match.homeTeam.color : match.awayTeam.color,
      badgeEmoji: match.homeTeam.teamId === match.winnerId ? match.homeTeam.badgeEmoji : match.awayTeam.badgeEmoji,
    };

    updatedPlayoffs = updatedPlayoffs.map((p) => {
      if (p.id === match.nextMatchId) {
        if (!p.homeTeam.teamId) {
          return {
            ...p,
            homeTeam: {
              teamId: winningTeam.id,
              name: winningTeam.name,
              color: (winningTeam as any).color,
              badgeEmoji: (winningTeam as any).badgeEmoji,
            },
          };
        } else if (!p.awayTeam.teamId) {
          return {
            ...p,
            awayTeam: {
              teamId: winningTeam.id,
              name: winningTeam.name,
              color: (winningTeam as any).color,
              badgeEmoji: (winningTeam as any).badgeEmoji,
            },
          };
        }
      }
      return p;
    });
  }

  const updatedData: TournamentData = {
    ...currentTournament,
    playoffs: updatedPlayoffs,
  };
  saveStoredTournamentData(updatedData);

  const url = currentTournament.config.appsScriptUrl || getSavedAppsScriptUrl();
  if (url && url.startsWith('http')) {
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'savePlayoffMatch',
          playoffMatch: match,
        }),
      });
    } catch (e) {
      console.warn('Playoff GAS save failed', e);
    }
  }

  return {
    success: true,
    data: updatedData,
    message: 'Resultado de playoffs guardado y llave actualizada.',
  };
}

/**
 * Resets tournament: clears fixture (matches & playoffs), resets stats to zero, retains registered teams
 */
export async function resetTournament(
  currentTournament: TournamentData
): Promise<{ success: boolean; data: TournamentData; message: string }> {
  // Preserve registered teams but reset their stats to 0
  const resetTeams: Team[] = currentTournament.teams.map((t) => ({
    ...t,
    entryDate: 1,
    active: true,
    pj: 0,
    pg: 0,
    pe: 0,
    pp: 0,
    gf: 0,
    gc: 0,
    dg: 0,
    pts: 0,
  }));

  const resetData: TournamentData = {
    ...currentTournament,
    config: {
      ...currentTournament.config,
      currentDateNumber: 1,
      isRegistrationOpen: true,
      lastSyncedAt: new Date().toISOString(),
    },
    teams: resetTeams,
    matches: [],
    playoffs: [],
    scorers: currentTournament.scorers || [],
  };

  saveStoredTournamentData(resetData);

  const url = currentTournament.config.appsScriptUrl || getSavedAppsScriptUrl();
  if (url && url.startsWith('http')) {
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resetTournament',
        }),
      });
      return {
        success: true,
        data: resetData,
        message: 'Torneo reiniciado exitosamente en la aplicación y en Google Sheets.',
      };
    } catch (e) {
      console.warn('GAS reset tournament failed', e);
      return {
        success: true,
        data: resetData,
        message: 'Torneo reiniciado localmente (sin conexión a Sheets).',
      };
    }
  }

  return {
    success: true,
    data: resetData,
    message: 'Torneo reiniciado localmente con estadísticas en cero.',
  };
}

/**
 * Resets tournament data to initial demo state
 */
export function resetLocalTournamentData(): TournamentData {
  localStorage.removeItem(STORAGE_KEY);
  const data = INITIAL_TOURNAMENT_DATA;
  saveStoredTournamentData(data);
  return data;
}
