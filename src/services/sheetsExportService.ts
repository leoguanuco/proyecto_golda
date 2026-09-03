import * as XLSX from 'xlsx';
import { TournamentData } from '../types';
import { calculateStandings } from './fixtureAlgorithm';

/**
 * Generates and downloads a complete, 100% compatible multi-sheet workbook (.xlsx)
 * designed specifically for Google Drive and Google Sheets.
 */
export function downloadTournamentSpreadsheet(
  tournamentData: TournamentData,
  fileName: string = 'LIGA_ACADEMIA_TORNEO_2025.xlsx'
): void {
  const wb = XLSX.utils.book_new();

  // 1. Sheet: Equipos
  const equiposRows = [
    [
      'ID',
      'Nombre',
      'NombreCorto',
      'Color',
      'Emoji',
      'FechaIngreso',
      'Activo',
      'PJ',
      'PG',
      'PE',
      'PP',
      'GF',
      'GC',
      'DG',
      'Puntos',
    ],
    ...tournamentData.teams.map((t) => [
      t.id,
      t.name,
      t.shortName,
      t.color,
      t.badgeEmoji || '⚽',
      t.entryDate || 1,
      t.active ? true : false,
      t.pj || 0,
      t.pg || 0,
      t.pe || 0,
      t.pp || 0,
      t.gf || 0,
      t.gc || 0,
      t.dg || 0,
      t.pts || 0,
    ]),
  ];
  const wsEquipos = XLSX.utils.aoa_to_sheet(equiposRows);
  XLSX.utils.book_append_sheet(wb, wsEquipos, 'Equipos');

  // 2. Sheet: Partidos
  const partidosRows = [
    [
      'ID',
      'FechaNumero',
      'EquipoLocalId',
      'EquipoLocalNombre',
      'GolesLocal',
      'GolesVisitante',
      'EquipoVisitanteId',
      'EquipoVisitanteNombre',
      'Estado',
      'Cancha',
      'Horario',
      'FechaCalendario',
      'EsPlayoff',
      'RondaPlayoff',
    ],
    ...tournamentData.matches.map((m) => [
      m.id,
      m.dateNumber,
      m.homeTeamId,
      m.homeTeamName,
      m.homeGoals !== null && m.homeGoals !== undefined ? m.homeGoals : '',
      m.awayGoals !== null && m.awayGoals !== undefined ? m.awayGoals : '',
      m.awayTeamId,
      m.awayTeamName,
      m.status,
      m.pitch || 'Cancha 1 (Principal)',
      m.time || '20:00',
      m.calendarDate || '',
      m.isPlayoff ? true : false,
      m.playoffRound || '',
    ]),
  ];
  const wsPartidos = XLSX.utils.aoa_to_sheet(partidosRows);
  XLSX.utils.book_append_sheet(wb, wsPartidos, 'Partidos');

  // 3. Sheet: Tabla_Posiciones
  const standings = calculateStandings(tournamentData.teams, tournamentData.matches);
  const tablaRows = [
    [
      'Posicion',
      'EquipoId',
      'Nombre',
      'PJ',
      'PG',
      'PE',
      'PP',
      'GF',
      'GC',
      'DG',
      'Puntos',
      'Zona',
      'Racha',
    ],
    ...standings.map((st) => [
      st.rank,
      st.teamId,
      st.team.name,
      st.pj,
      st.pg,
      st.pe,
      st.pp,
      st.gf,
      st.gc,
      st.dg,
      st.pts,
      st.zoneLabel,
      st.form ? st.form.join('') : '',
    ]),
  ];
  const wsTabla = XLSX.utils.aoa_to_sheet(tablaRows);
  XLSX.utils.book_append_sheet(wb, wsTabla, 'Tabla_Posiciones');

  // 4. Sheet: Playoffs
  const playoffsRows = [
    [
      'LlaveId',
      'Ronda',
      'Indice',
      'Equipo1Id',
      'Equipo1Nombre',
      'Goles1',
      'Penales1',
      'Equipo2Id',
      'Equipo2Nombre',
      'Goles2',
      'Penales2',
      'GanadorId',
      'Estado',
      'SiguienteLlaveId',
    ],
    ...tournamentData.playoffs.map((pl) => [
      pl.id,
      pl.round,
      pl.bracketIndex ?? 0,
      pl.homeTeam.teamId || '',
      pl.homeTeam.name || '',
      pl.homeGoals !== null && pl.homeGoals !== undefined ? pl.homeGoals : '',
      pl.homePenalties !== null && pl.homePenalties !== undefined ? pl.homePenalties : '',
      pl.awayTeam.teamId || '',
      pl.awayTeam.name || '',
      pl.awayGoals !== null && pl.awayGoals !== undefined ? pl.awayGoals : '',
      pl.awayPenalties !== null && pl.awayPenalties !== undefined ? pl.awayPenalties : '',
      pl.winnerId || '',
      pl.status || 'pending',
      pl.nextMatchId || '',
    ]),
  ];
  const wsPlayoffs = XLSX.utils.aoa_to_sheet(playoffsRows);
  XLSX.utils.book_append_sheet(wb, wsPlayoffs, 'Playoffs');

  // 5. Sheet: Configuracion
  const configRows = [
    ['Clave', 'Valor'],
    ['tournamentName', tournamentData.config.tournamentName],
    ['currentDateNumber', tournamentData.config.currentDateNumber],
    ['maxRegistrationDate', tournamentData.config.maxRegistrationDate],
    ['isRegistrationOpen', tournamentData.config.isRegistrationOpen ? 'true' : 'false'],
    ['playoffGoldSpots', tournamentData.config.playoffGoldSpots],
    ['playoffSilverSpots', tournamentData.config.playoffSilverSpots],
    ['season', tournamentData.config.season],
    ['category', tournamentData.config.category],
  ];
  const wsConfig = XLSX.utils.aoa_to_sheet(configRows);
  XLSX.utils.book_append_sheet(wb, wsConfig, 'Configuracion');

  // Write and trigger download in browser
  XLSX.writeFile(wb, fileName);
}
