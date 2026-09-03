export const GOOGLE_SHEETS_STRUCTURE = {
  sheets: [
    {
      name: 'Equipos',
      description: 'Registro de todos los equipos participantes, fecha de ingreso y estadísticas acumuladas.',
      columns: [
        { key: 'ID', description: 'Identificador único (ej: EQ_01)' },
        { key: 'Nombre', description: 'Nombre completo del equipo (ej: Real Academia FC)' },
        { key: 'NombreCorto', description: 'Abreviatura o sigla (ej: RAC)' },
        { key: 'Color', description: 'Código hexadecimal del color del club (ej: #10B981)' },
        { key: 'Emoji', description: 'Icono/Escudo representativo' },
        { key: 'FechaIngreso', description: 'Número de fecha en la que debutó (1 a 5)' },
        { key: 'Activo', description: 'TRUE / FALSE' },
        { key: 'PJ', description: 'Partidos Jugados (calculado automático)' },
        { key: 'PG', description: 'Partidos Ganados' },
        { key: 'PE', description: 'Partidos Empatados' },
        { key: 'PP', description: 'Partidos Perdidos' },
        { key: 'GF', description: 'Goles a Favor' },
        { key: 'GC', description: 'Goles en Contra' },
        { key: 'DG', description: 'Diferencia de Goles (=GF-GC)' },
        { key: 'Puntos', description: 'Puntos Acumulados (=PG*3 + PE)' }
      ]
    },
    {
      name: 'Partidos',
      description: 'Registro histórico y futuro de todos los partidos fecha por fecha.',
      columns: [
        { key: 'ID', description: 'Identificador del partido (ej: M_F1_01)' },
        { key: 'FechaNumero', description: 'Número de jornada (1, 2, 3, ...)' },
        { key: 'EquipoLocalId', description: 'ID del equipo local' },
        { key: 'EquipoLocalNombre', description: 'Nombre del equipo local' },
        { key: 'GolesLocal', description: 'Goles marcados por el local' },
        { key: 'GolesVisitante', description: 'Goles marcados por el visitante' },
        { key: 'EquipoVisitanteId', description: 'ID del equipo visitante' },
        { key: 'EquipoVisitanteNombre', description: 'Nombre del equipo visitante' },
        { key: 'Estado', description: 'scheduled | live | finished' },
        { key: 'Cancha', description: 'Nombre de la cancha (ej: Cancha 1 - Principal)' },
        { key: 'Horario', description: 'Hora del partido (ej: 20:00)' },
        { key: 'FechaCalendario', description: 'Fecha del día (ej: 2025-05-15)' },
        { key: 'EsPlayoff', description: 'TRUE si pertenece a fase eliminatoria' },
        { key: 'RondaPlayoff', description: 'cuartos | semis | final | tercero' }
      ]
    },
    {
      name: 'Tabla_Posiciones',
      description: 'Tabla oficial en tiempo real calculada automáticamente con zonas de clasificación.',
      columns: [
        { key: 'Posicion', description: '1, 2, 3... según Puntos, DG, GF' },
        { key: 'EquipoId', description: 'ID del equipo' },
        { key: 'Nombre', description: 'Nombre del equipo' },
        { key: 'PJ', description: 'Partidos Jugados' },
        { key: 'PG', description: 'Ganados' },
        { key: 'PE', description: 'Empatados' },
        { key: 'PP', description: 'Perdidos' },
        { key: 'GF', description: 'Goles a Favor' },
        { key: 'GC', description: 'Goles en Contra' },
        { key: 'DG', description: 'Diferencia de Gol' },
        { key: 'Puntos', description: 'Total de Puntos' },
        { key: 'Zona', description: 'Copa Oro (Playoffs) | Copa Plata | Fase Regular' },
        { key: 'Racha', description: 'Últimos 5 resultados (V, E, D)' }
      ]
    },
    {
      name: 'Playoffs',
      description: 'Cruces eliminatorios desde cuartos de final hasta la gran final y 3er puesto.',
      columns: [
        { key: 'LlaveId', description: 'ID de la llave (ej: QF_1, SF_1, FINAL)' },
        { key: 'Ronda', description: 'cuartos | semis | final | tercero' },
        { key: 'Indice', description: 'Orden en el bracket (0, 1, 2...)' },
        { key: 'Equipo1Id', description: 'ID del primer clasificado' },
        { key: 'Equipo1Nombre', description: 'Nombre (ej: 1º Fase Regular - Atlético Norte)' },
        { key: 'Goles1', description: 'Goles tiempo regular' },
        { key: 'Penales1', description: 'Goles tanda penales' },
        { key: 'Equipo2Id', description: 'ID del segundo clasificado' },
        { key: 'Equipo2Nombre', description: 'Nombre (ej: 8º Fase Regular - Dep. Sur)' },
        { key: 'Goles2', description: 'Goles tiempo regular' },
        { key: 'Penales2', description: 'Goles tanda penales' },
        { key: 'GanadorId', description: 'ID del equipo ganador que clasifica' },
        { key: 'Estado', description: 'pending | live | finished' },
        { key: 'SiguienteLlaveId', description: 'ID de la siguiente llave adonde avanza' }
      ]
    },
    {
      name: 'Configuracion',
      description: 'Parámetros del torneo, estado de inscripciones y tokens de seguridad.',
      columns: [
        { key: 'Clave', description: 'Nombre de la variable de configuración' },
        { key: 'Valor', description: 'Valor asignado' }
      ]
    }
  ]
};

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ============================================================================
 * LIGA ACADEMIA - GOOGLE APPS SCRIPT API REST & FIXTURE ENGINE
 * ============================================================================
 * 
 * Instrucciones de Despliegue:
 * 1. Abre tu Google Spreadsheet en Google Drive.
 * 2. Ve a 'Extensiones' > 'Apps Script'.
 * 3. Borra el código existente y pega este archivo completo (Code.gs).
 * 4. Haz clic en 'Implementar' (Deploy) > 'Nueva implementación' (New deployment).
 * 5. Selecciona tipo 'Aplicación web' (Web app).
 * 6. Configura:
 *    - Descripción: "Liga Academia API v2.0 - Corrección de Filtros & Reset"
 *    - Ejecutar como: "Yo" (Tu cuenta de Google)
 *    - Quién tiene acceso: "Cualquier usuario" (Anyone)
 * 7. Haz clic en 'Implementar' y copia la URL proporcionada (termina en /exec).
 * 8. Pega la URL en el Panel de Administrador > Configuración de la Web App.
 */

// Nombres de las Hojas de Cálculo
var SHEETS = {
  EQUIPOS: 'Equipos',
  PARTIDOS: 'Partidos',
  TABLA: 'Tabla_Posiciones',
  PLAYOFFS: 'Playoffs',
  CONFIG: 'Configuracion'
};

/**
 * Manejador HTTP GET - Lectura en tiempo real con filtros estrictos
 */
function doGet(e) {
  try {
    var params = e && e.parameter ? e.parameter : {};
    var action = params.action || 'getInitialData';
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Inicializar estructura si falta alguna hoja
    ensureSheetsStructure(ss);

    var responseData = {};

    switch (action) {
      case 'ping':
        responseData = {
          success: true,
          message: 'Liga Academia Google Apps Script API está en línea y funcionando.',
          timestamp: new Date().toISOString(),
          spreadsheetName: ss.getName()
        };
        break;

      case 'getInitialData':
      case 'getAll':
        responseData = {
          success: true,
          data: {
            config: getTournamentConfig(ss),
            teams: getTeamsData(ss),
            matches: getMatchesData(ss),
            playoffs: getPlayoffsData(ss),
            standings: getStandingsData(ss),
            scorers: getTopScorersData(ss)
          }
        };
        break;

      case 'getStandings':
        responseData = {
          success: true,
          data: getStandingsData(ss)
        };
        break;

      case 'getFixture':
        var dateNum = params.date ? parseInt(params.date) : null;
        var matches = getMatchesData(ss);
        if (dateNum) {
          matches = matches.filter(function(m) { return m.dateNumber === dateNum; });
        }
        responseData = {
          success: true,
          data: matches
        };
        break;

      case 'getTeams':
        responseData = {
          success: true,
          data: getTeamsData(ss)
        };
        break;

      case 'getPlayoffs':
        responseData = {
          success: true,
          data: getPlayoffsData(ss)
        };
        break;

      default:
        responseData = {
          success: false,
          error: 'Acción GET no reconocida: ' + action
        };
        break;
    }

    return createJsonResponse(responseData);
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: 'Error interno en doGet: ' + err.toString(),
      stack: err.stack
    });
  }
}

/**
 * Manejador HTTP POST - Escritura, Carga de Resultados, Borrado y Reinicio
 */
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureSheetsStructure(ss);

    var payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    var action = payload.action || '';
    var responseData = {};

    switch (action) {
      case 'initTournamentSheets':
        seedInitialTournamentData(ss);
        responseData = {
          success: true,
          message: 'Estructura de hojas inicializada con éxito.',
          data: {
            config: getTournamentConfig(ss),
            teams: getTeamsData(ss),
            matches: getMatchesData(ss),
            playoffs: getPlayoffsData(ss),
            standings: getStandingsData(ss)
          }
        };
        break;

      case 'saveMatchScore':
        responseData = saveMatchScoreHandler(ss, payload.match);
        break;

      case 'generateNextFixture':
        responseData = generateNextFixtureHandler(ss);
        break;

      case 'addTeam':
        responseData = addTeamHandler(ss, payload.team);
        break;

      case 'editTeam':
        responseData = editTeamHandler(ss, payload.team);
        break;

      // PROBLEMA 2 SOLUCIONADO: Borrar Equipo
      case 'deleteTeam':
        var teamIdToDelete = payload.teamId || payload.id;
        responseData = deleteTeamHandler(ss, teamIdToDelete);
        break;

      case 'savePlayoffMatch':
        responseData = savePlayoffMatchHandler(ss, payload.playoffMatch);
        break;

      case 'generatePlayoffsFromStandings':
        responseData = generatePlayoffsFromStandingsHandler(ss);
        break;

      // PROBLEMA 1 SOLUCIONADO: Reiniciar Torneo limpiando partidos y reseteando estadísticas
      case 'resetTournament':
        responseData = resetTournamentHandler(ss);
        break;

      default:
        responseData = {
          success: false,
          error: 'Acción POST no reconocida: ' + action
        };
        break;
    }

    return createJsonResponse(responseData);
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: 'Error interno en doPost: ' + err.toString(),
      stack: err.stack
    });
  }
}

/**
 * ============================================================================
 * 1. FUNCIÓN DE REINICIO DE TORNEO (PROBLEMA 1)
 * Limpia partidos, playoffs, restablece a cero estadísticas y conserva equipos inscriptos
 * ============================================================================
 */
function resetTournamentHandler(ss) {
  // 1. Limpiar hoja Partidos (conservando la fila de encabezados 1)
  var sheetPartidos = ss.getSheetByName(SHEETS.PARTIDOS);
  if (sheetPartidos) {
    var lastRowPartidos = sheetPartidos.getLastRow();
    if (lastRowPartidos > 1) {
      sheetPartidos.deleteRows(2, lastRowPartidos - 1);
    }
  }

  // 2. Limpiar hoja Playoffs (conservando encabezados)
  var sheetPlayoffs = ss.getSheetByName(SHEETS.PLAYOFFS);
  if (sheetPlayoffs) {
    var lastRowPlayoffs = sheetPlayoffs.getLastRow();
    if (lastRowPlayoffs > 1) {
      sheetPlayoffs.deleteRows(2, lastRowPlayoffs - 1);
    }
  }

  // 3. Restablecer estadísticas de Equipos a cero (conservando IDs, Nombres, Colores y Emojis)
  var sheetEquipos = ss.getSheetByName(SHEETS.EQUIPOS);
  if (sheetEquipos) {
    var lastRowEquipos = sheetEquipos.getLastRow();
    if (lastRowEquipos > 1) {
      for (var r = 2; r <= lastRowEquipos; r++) {
        var rowValues = sheetEquipos.getRange(r, 1, 1, 15).getValues()[0];
        // Verificar que sea una fila de equipo válida
        if (rowValues[0] && String(rowValues[0]).trim() !== '' && rowValues[1] && String(rowValues[1]).trim() !== '') {
          sheetEquipos.getRange(r, 6).setValue(1); // Fecha de ingreso vuelve a 1
          sheetEquipos.getRange(r, 7).setValue(true); // Activo
          // Columnas 8 a 15: PJ, PG, PE, PP, GF, GC, DG, Puntos = 0
          sheetEquipos.getRange(r, 8, 1, 8).setValues([[0, 0, 0, 0, 0, 0, 0, 0]]);
        }
      }
    }
  }

  // 4. Restablecer Configuración a Fecha 1 e Inscripción Abierta
  updateConfigValue(ss, 'currentDateNumber', 1);
  updateConfigValue(ss, 'isRegistrationOpen', 'true');

  // 5. Recalcular y ordenar Tabla de Posiciones a cero
  recalculateStandingsSheet(ss);

  return {
    success: true,
    message: 'Torneo reiniciado exitosamente. Se borraron los partidos y se conservaron los equipos con estadísticas en cero.',
    data: {
      config: getTournamentConfig(ss),
      teams: getTeamsData(ss),
      matches: getMatchesData(ss),
      playoffs: getPlayoffsData(ss),
      standings: getStandingsData(ss)
    }
  };
}

/**
 * ============================================================================
 * 2. FUNCIÓN DE BORRADO DE EQUIPO (PROBLEMA 2)
 * Busca la fila exacta del equipo mediante ID y la elimina por completo (deleteRow)
 * ============================================================================
 */
function deleteTeamHandler(ss, teamId) {
  if (!teamId || String(teamId).trim() === '') {
    return { success: false, error: 'ID de equipo requerido para eliminar' };
  }

  var cleanId = String(teamId).trim();
  var sheet = ss.getSheetByName(SHEETS.EQUIPOS);
  var values = sheet.getDataRange().getValues();
  var foundRow = -1;

  for (var r = 1; r < values.length; r++) {
    if (values[r][0] && String(values[r][0]).trim() === cleanId) {
      foundRow = r + 1; // getRange / deleteRow es 1-based (r=1 es fila 2)
      break;
    }
  }

  if (foundRow > 0) {
    sheet.deleteRow(foundRow);

    // Opcional: Eliminar partidos huérfanos asociados a este equipo
    var sheetPartidos = ss.getSheetByName(SHEETS.PARTIDOS);
    if (sheetPartidos) {
      var mValues = sheetPartidos.getDataRange().getValues();
      for (var mr = mValues.length - 1; mr >= 1; mr--) {
        var homeId = String(mValues[mr][2] || '').trim();
        var awayId = String(mValues[mr][6] || '').trim();
        if (homeId === cleanId || awayId === cleanId) {
          sheetPartidos.deleteRow(mr + 1);
        }
      }
    }

    // Recalcular la tabla de posiciones inmediatamente
    recalculateStandingsSheet(ss);

    return {
      success: true,
      message: 'Equipo con ID ' + cleanId + ' eliminado exitosamente de Google Sheets.',
      data: {
        teams: getTeamsData(ss),
        matches: getMatchesData(ss),
        standings: getStandingsData(ss)
      }
    };
  }

  return {
    success: false,
    error: 'No se encontró ningún equipo en la hoja con ID: ' + cleanId
  };
}

/**
 * ============================================================================
 * 3 & 4. LECTURA Y FILTRADO ESTRICTO CONTRA FILAS VACÍAS (PROBLEMAS 3 Y 4)
 * ============================================================================
 */
function getMatchesData(ss) {
  var sheet = ss.getSheetByName(SHEETS.PARTIDOS);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  var matches = [];

  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    // FILTRO ESTRICTO 1: Ignorar filas vacías o sin ID de partido
    if (!row || !row[0] || String(row[0]).trim() === '') continue;

    var homeTeamId = row[2] ? String(row[2]).trim() : '';
    var homeTeamName = row[3] ? String(row[3]).trim() : '';
    var awayTeamId = row[6] ? String(row[6]).trim() : '';
    var awayTeamName = row[7] ? String(row[7]).trim() : '';

    // FILTRO ESTRICTO 2 (PROBLEMA 3): Evitar partidos fantasmas verificando equipos
    if (homeTeamId === '' || awayTeamId === '' || homeTeamName === '' || awayTeamName === '') {
      continue;
    }

    var hG = (row[4] !== '' && row[4] !== null && row[4] !== undefined) ? parseInt(row[4]) : null;
    var aG = (row[5] !== '' && row[5] !== null && row[5] !== undefined) ? parseInt(row[5]) : null;

    matches.push({
      id: String(row[0]).trim(),
      dateNumber: parseInt(row[1]) || 1,
      homeTeamId: homeTeamId,
      homeTeamName: homeTeamName,
      homeGoals: (hG !== null && !isNaN(hG)) ? hG : null,
      awayGoals: (aG !== null && !isNaN(aG)) ? aG : null,
      awayTeamId: awayTeamId,
      awayTeamName: awayTeamName,
      status: String(row[8] || 'scheduled').trim(),
      pitch: String(row[9] || 'Cancha 1 (Principal)').trim(),
      time: String(row[10] || '20:00').trim(),
      calendarDate: String(row[11] || '').trim(),
      isPlayoff: row[12] === true || String(row[12]).toLowerCase() === 'true',
      playoffRound: String(row[13] || '').trim()
    });
  }
  return matches;
}

function getTeamsData(ss) {
  var sheet = ss.getSheetByName(SHEETS.EQUIPOS);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  var teams = [];

  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    // FILTRO ESTRICTO: Ignorar filas vacías o sin ID ni Nombre
    if (!row || !row[0] || String(row[0]).trim() === '') continue;
    var teamName = row[1] ? String(row[1]).trim() : '';
    if (teamName === '' || teamName === 'undefined' || teamName === 'null') continue;

    teams.push({
      id: String(row[0]).trim(),
      name: teamName,
      shortName: String(row[2] || teamName.substring(0, 3)).trim().toUpperCase(),
      color: String(row[3] || '#10B981').trim(),
      badgeEmoji: String(row[4] || '⚽').trim(),
      entryDate: parseInt(row[5]) || 1,
      active: row[6] !== false && String(row[6]).toLowerCase() !== 'false',
      pj: parseInt(row[7]) || 0,
      pg: parseInt(row[8]) || 0,
      pe: parseInt(row[9]) || 0,
      pp: parseInt(row[10]) || 0,
      gf: parseInt(row[11]) || 0,
      gc: parseInt(row[12]) || 0,
      dg: parseInt(row[13]) || 0,
      pts: parseInt(row[14]) || 0
    });
  }
  return teams;
}

/**
 * PROBLEMA 4 SOLUCIONADO:
 * Recalcula toda la hoja Tabla_Posiciones filtrando y excluyendo cualquier equipo vacío
 */
function recalculateStandingsSheet(ss) {
  var teams = getTeamsData(ss);
  var matches = getMatchesData(ss);

  // FILTRO ESTRICTO: Solo equipos con ID y Nombre válido y activos
  var validTeams = teams.filter(function(t) {
    return t && t.id && String(t.id).trim() !== '' && t.name && String(t.name).trim() !== '' && t.active;
  });

  var stats = {};
  for (var i = 0; i < validTeams.length; i++) {
    stats[validTeams[i].id] = {
      team: validTeams[i],
      pj: 0, pg: 0, pe: 0, pp: 0,
      gf: 0, gc: 0, dg: 0, pts: 0,
      form: []
    };
  }

  // Filtrar partidos finalizados válidos
  var finished = matches.filter(function(m) {
    return m.status === 'finished' && 
           m.homeGoals !== null && 
           m.awayGoals !== null && 
           !m.isPlayoff &&
           stats[m.homeTeamId] && 
           stats[m.awayTeamId];
  }).sort(function(a, b) { return a.dateNumber - b.dateNumber; });

  for (var m = 0; m < finished.length; m++) {
    var match = finished[m];
    var h = stats[match.homeTeamId];
    var a = stats[match.awayTeamId];
    if (!h || !a) continue;

    h.pj++; a.pj++;
    h.gf += match.homeGoals; h.gc += match.awayGoals; h.dg = h.gf - h.gc;
    a.gf += match.awayGoals; a.gc += match.homeGoals; a.dg = a.gf - a.gc;

    if (match.homeGoals > match.awayGoals) {
      h.pg++; h.pts += 3; h.form.push('V');
      a.pp++; a.form.push('D');
    } else if (match.homeGoals < match.awayGoals) {
      a.pg++; a.pts += 3; a.form.push('V');
      h.pp++; h.form.push('D');
    } else {
      h.pe++; h.pts += 1; h.form.push('E');
      a.pe++; a.pts += 1; a.form.push('E');
    }
  }

  // Ordenamiento oficial: Puntos DESC, DG DESC, GF DESC, Nombre ASC
  var sorted = validTeams.sort(function(a, b) {
    var stA = stats[a.id];
    var stB = stats[b.id];
    if (stB.pts !== stA.pts) return stB.pts - stA.pts;
    if (stB.dg !== stA.dg) return stB.dg - stA.dg;
    if (stB.gf !== stA.gf) return stB.gf - stA.gf;
    return a.name.localeCompare(b.name);
  });

  var sheetTabla = ss.getSheetByName(SHEETS.TABLA);
  if (sheetTabla) {
    sheetTabla.clearContents();
    sheetTabla.appendRow(['Posicion', 'EquipoId', 'Nombre', 'PJ', 'PG', 'PE', 'PP', 'GF', 'GC', 'DG', 'Puntos', 'Zona', 'Racha']);

    for (var s = 0; s < sorted.length; s++) {
      var tm = sorted[s];
      var st = stats[tm.id];
      var rank = s + 1;
      var zone = rank <= 8 ? 'Copa Oro (Playoffs)' : (rank <= 12 ? 'Copa Plata' : 'Fase Regular');
      var formStr = st.form.slice(-5).join('');

      sheetTabla.appendRow([
        rank, tm.id, tm.name, st.pj, st.pg, st.pe, st.pp, st.gf, st.gc, st.dg, st.pts, zone, formStr
      ]);
    }
  }
}

function getStandingsData(ss) {
  var sheet = ss.getSheetByName(SHEETS.TABLA);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  var standings = [];

  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    // FILTRO ESTRICTO: Ignorar filas vacías o sin nombre de equipo
    if (!row || !row[0] || String(row[0]).trim() === '') continue;
    var teamId = row[1] ? String(row[1]).trim() : '';
    var teamName = row[2] ? String(row[2]).trim() : '';
    if (teamId === '' || teamName === '' || teamName === 'undefined' || teamName === 'null') {
      continue;
    }

    standings.push({
      rank: parseInt(row[0]) || (standings.length + 1),
      teamId: teamId,
      name: teamName,
      pj: parseInt(row[3]) || 0,
      pg: parseInt(row[4]) || 0,
      pe: parseInt(row[5]) || 0,
      pp: parseInt(row[6]) || 0,
      gf: parseInt(row[7]) || 0,
      gc: parseInt(row[8]) || 0,
      dg: parseInt(row[9]) || 0,
      pts: parseInt(row[10]) || 0,
      zone: String(row[11] || 'Fase Regular').trim(),
      form: String(row[12] || '').split('').filter(function(x) { return x; })
    });
  }

  // Renumerar ranks por seguridad
  for (var k = 0; k < standings.length; k++) {
    standings[k].rank = k + 1;
  }

  return standings;
}

function getPlayoffsData(ss) {
  var sheet = ss.getSheetByName(SHEETS.PLAYOFFS);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  var playoffs = [];

  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    if (!row || !row[0] || String(row[0]).trim() === '') continue;

    playoffs.push({
      id: String(row[0]).trim(),
      round: String(row[1] || 'cuartos').trim(),
      bracketIndex: parseInt(row[2]) || (r - 1),
      homeTeam: {
        teamId: row[3] ? String(row[3]).trim() : null,
        name: String(row[4] || 'A definir').trim()
      },
      homeGoals: (row[5] !== '' && row[5] !== null && row[5] !== undefined) ? parseInt(row[5]) : null,
      homePenalties: (row[6] !== '' && row[6] !== null && row[6] !== undefined) ? parseInt(row[6]) : null,
      awayTeam: {
        teamId: row[7] ? String(row[7]).trim() : null,
        name: String(row[8] || 'A definir').trim()
      },
      awayGoals: (row[9] !== '' && row[9] !== null && row[9] !== undefined) ? parseInt(row[9]) : null,
      awayPenalties: (row[10] !== '' && row[10] !== null && row[10] !== undefined) ? parseInt(row[10]) : null,
      winnerId: row[11] ? String(row[11]).trim() : null,
      status: String(row[12] || 'pending').trim(),
      nextMatchId: row[13] ? String(row[13]).trim() : null
    });
  }
  return playoffs;
}

function getTournamentConfig(ss) {
  var sheet = ss.getSheetByName(SHEETS.CONFIG);
  var config = {
    tournamentName: 'Liga Academia 2025',
    currentDateNumber: 1,
    maxRegistrationDate: 5,
    isRegistrationOpen: true,
    playoffGoldSpots: 8,
    playoffSilverSpots: 4,
    season: 'Apertura 2025',
    category: 'Libre Primera'
  };

  if (sheet) {
    var values = sheet.getDataRange().getValues();
    for (var r = 1; r < values.length; r++) {
      if (!values[r] || !values[r][0]) continue;
      var key = String(values[r][0]).trim();
      var val = values[r][1];
      if (key === 'currentDateNumber') config.currentDateNumber = parseInt(val) || 1;
      if (key === 'tournamentName') config.tournamentName = String(val);
      if (key === 'isRegistrationOpen') config.isRegistrationOpen = (String(val).toLowerCase() === 'true');
      if (key === 'playoffGoldSpots') config.playoffGoldSpots = parseInt(val) || 8;
    }
  }

  config.isRegistrationOpen = config.currentDateNumber <= 5;
  return config;
}

function updateConfigValue(ss, key, val) {
  var sheet = ss.getSheetByName(SHEETS.CONFIG);
  if (!sheet) return;
  var values = sheet.getDataRange().getValues();
  for (var r = 1; r < values.length; r++) {
    if (values[r] && String(values[r][0]).trim() === key) {
      sheet.getRange(r + 1, 2).setValue(val);
      return;
    }
  }
  sheet.appendRow([key, val]);
}

/**
 * ============================================================================
 * MOTOR DE FIXTURE - GENERACIÓN DE PRÓXIMA FECHA
 * ============================================================================
 */
function generateNextFixtureHandler(ss) {
  var config = getTournamentConfig(ss);
  var currentDate = parseInt(config.currentDateNumber) || 1;
  var nextDate = currentDate + 1;
  var teams = getTeamsData(ss);
  var matches = getMatchesData(ss);

  // FILTRO ESTRICTO: Solo equipos válidos y activos
  var activeTeams = teams.filter(function(t) { 
    return t && t.id && t.name && t.name.trim() !== '' && t.active && t.entryDate <= nextDate; 
  });

  if (activeTeams.length < 2) {
    return {
      success: false,
      error: 'Se necesitan al menos 2 equipos habilitados para generar la fecha ' + nextDate
    };
  }

  var isDate6OrBeyond = nextDate >= 6;
  var datesToGenerate = [];

  if (isDate6OrBeyond) {
    var totalDatesNeeded = activeTeams.length % 2 === 0 ? activeTeams.length - 1 : activeTeams.length;
    for (var d = nextDate; d <= Math.max(totalDatesNeeded, nextDate); d++) {
      datesToGenerate.push(d);
    }
  } else {
    datesToGenerate.push(nextDate);
  }

  var allNewMatches = [];
  var cumulativeMatches = matches.slice(0);
  var logs = [];

  for (var i = 0; i < datesToGenerate.length; i++) {
    var dNum = datesToGenerate[i];
    var genResult = generateSingleDateMatches(dNum, activeTeams, cumulativeMatches);
    if (!genResult.success) {
      return {
        success: false,
        error: 'Fallo al generar Fecha ' + dNum + ': ' + genResult.error,
        logs: logs
      };
    }
    allNewMatches = allNewMatches.concat(genResult.matches);
    cumulativeMatches = cumulativeMatches.concat(genResult.matches);
    logs = logs.concat(genResult.logs);
  }

  // Guardar nuevos partidos en la hoja Partidos
  var sheetPartidos = ss.getSheetByName(SHEETS.PARTIDOS);
  for (var m = 0; m < allNewMatches.length; m++) {
    var match = allNewMatches[m];
    sheetPartidos.appendRow([
      match.id,
      match.dateNumber,
      match.homeTeamId,
      match.homeTeamName,
      '',
      '',
      match.awayTeamId,
      match.awayTeamName,
      match.status,
      match.pitch,
      match.time,
      match.calendarDate || '',
      false,
      ''
    ]);
  }

  updateConfigValue(ss, 'currentDateNumber', datesToGenerate[datesToGenerate.length - 1]);
  if (isDate6OrBeyond) {
    updateConfigValue(ss, 'isRegistrationOpen', 'false');
  }

  return {
    success: true,
    message: isDate6OrBeyond 
      ? '¡Fecha 6 alcanzada! Se cerró la inscripción y se generó el cronograma completo restante.' 
      : 'Fecha ' + nextDate + ' generada con éxito.',
    data: {
      generatedDates: datesToGenerate,
      matchesCount: allNewMatches.length,
      isLocked: isDate6OrBeyond,
      logs: logs,
      fullTournament: {
        config: getTournamentConfig(ss),
        teams: getTeamsData(ss),
        matches: getMatchesData(ss),
        playoffs: getPlayoffsData(ss),
        standings: getStandingsData(ss)
      }
    }
  };
}

function generateSingleDateMatches(dateNumber, allTeams, existingMatches) {
  var logs = [];
  var eligibleTeams = allTeams.filter(function(t) { 
    return t && t.id && t.name && t.name.trim() !== '' && t.active && t.entryDate <= dateNumber; 
  });
  var baselineTeams = allTeams.filter(function(t) { return t.active && t.entryDate === 1; });

  var playedPairs = {};
  for (var i = 0; i < existingMatches.length; i++) {
    var m = existingMatches[i];
    if (m.homeTeamId && m.awayTeamId) {
      var pairKey = [m.homeTeamId, m.awayTeamId].sort().join('___');
      playedPairs[pairKey] = true;
    }
  }

  var requirements = eligibleTeams.map(function(team) {
    var pastMatches = existingMatches.filter(function(m) {
      return (m.homeTeamId === team.id || m.awayTeamId === team.id) && m.dateNumber < dateNumber;
    });
    var pjCurrent = pastMatches.length;

    var baseTeam = baselineTeams[0];
    var targetPjBase = baseTeam ? existingMatches.filter(function(m) {
      return (m.homeTeamId === baseTeam.id || m.awayTeamId === baseTeam.id) && m.dateNumber < dateNumber;
    }).length : dateNumber - 1;

    var targetMatches = 1;
    var reason = '';

    if (team.entryDate === 1) {
      targetMatches = 1;
      reason = 'Equipo fundador. 1 partido.';
    } else if (team.entryDate === dateNumber) {
      targetMatches = 1;
      reason = 'Debut en Fecha ' + team.entryDate + '. Juega 1 partido.';
    } else if (pjCurrent >= targetPjBase) {
      targetMatches = 1;
      reason = 'PJ igualados con base (' + pjCurrent + '). 1 partido.';
    } else {
      var appearances = dateNumber - team.entryDate + 1;
      if (appearances % 2 === 0) {
        targetMatches = 2;
        reason = 'Jornada ' + appearances + ': FECHA DOBLE (2 partidos). PJ actual: ' + pjCurrent;
      } else {
        targetMatches = 1;
        reason = 'Jornada ' + appearances + ': FECHA SIMPLE (1 partido). PJ actual: ' + pjCurrent;
      }
    }

    logs.push('[' + team.name + ']: ' + targetMatches + ' partidos asignados (' + reason + ')');
    return {
      team: team,
      targetMatches: targetMatches,
      assignedMatches: 0
    };
  });

  var totalSlots = requirements.reduce(function(sum, r) { return sum + r.targetMatches; }, 0);
  if (totalSlots % 2 !== 0) {
    var lateCatchup = requirements.filter(function(r) { return r.team.entryDate > 1 && r.targetMatches === 1; })[0];
    if (lateCatchup) {
      lateCatchup.targetMatches = 2;
      logs.push('Ajuste de paridad: ' + lateCatchup.team.name + ' juega 2 partidos.');
    } else {
      var doubleCandidate = requirements.filter(function(r) { return r.targetMatches === 2; })[0];
      if (doubleCandidate) {
        doubleCandidate.targetMatches = 1;
        logs.push('Ajuste de paridad: ' + doubleCandidate.team.name + ' pasa a 1 partido.');
      }
    }
  }

  var pitches = ['Cancha 1 (Principal)', 'Cancha 2 (Sintético)', 'Cancha 3 (Noche)'];
  var currentMatchesThisDate = [];
  var currentPairsThisDate = {};

  function canPlay(t1Id, t2Id) {
    if (t1Id === t2Id) return false;
    var pairKey = [t1Id, t2Id].sort().join('___');
    if (playedPairs[pairKey]) return false;
    if (currentPairsThisDate[pairKey]) return false;
    return true;
  }

  function backtrack(reqs) {
    var allFilled = reqs.every(function(r) { return r.assignedMatches === r.targetMatches; });
    if (allFilled) return true;

    var pending = reqs.filter(function(r) { return r.assignedMatches < r.targetMatches; });
    pending.sort(function(a, b) {
      return (b.targetMatches - b.assignedMatches) - (a.targetMatches - a.assignedMatches);
    });

    if (pending.length < 2) return false;
    var tA = pending[0];

    var opponents = pending.slice(1).filter(function(opp) {
      return canPlay(tA.team.id, opp.team.id);
    });

    for (var o = 0; o < opponents.length; o++) {
      var tB = opponents[o];
      var pairKey = [tA.team.id, tB.team.id].sort().join('___');

      tA.assignedMatches++;
      tB.assignedMatches++;
      playedPairs[pairKey] = true;
      currentPairsThisDate[pairKey] = true;

      var matchIdx = currentMatchesThisDate.length;
      var pitch = pitches[matchIdx % pitches.length];
      var hour = 19 + Math.floor(matchIdx / 2);
      var minutes = (matchIdx % 2 === 0) ? '00' : '50';

      var matchObj = {
        id: 'M_F' + dateNumber + '_' + tA.team.id + '_vs_' + tB.team.id + '_' + new Date().getTime() + '_' + matchIdx,
        dateNumber: dateNumber,
        homeTeamId: tA.team.id,
        homeTeamName: tA.team.name,
        awayTeamId: tB.team.id,
        awayTeamName: tB.team.name,
        homeGoals: null,
        awayGoals: null,
        status: 'scheduled',
        pitch: pitch,
        time: hour + ':' + minutes,
        calendarDate: '',
        isPlayoff: false
      };

      currentMatchesThisDate.push(matchObj);

      if (backtrack(reqs)) {
        return true;
      }

      currentMatchesThisDate.pop();
      delete currentPairsThisDate[pairKey];
      delete playedPairs[pairKey];
      tA.assignedMatches--;
      tB.assignedMatches--;
    }

    return false;
  }

  var ok = backtrack(requirements);
  if (!ok) {
    return {
      success: false,
      error: 'Imposible emparejar sin repetir rivales para la combinación actual de equipos.',
      logs: logs
    };
  }

  return {
    success: true,
    matches: currentMatchesThisDate,
    logs: logs
  };
}

function saveMatchScoreHandler(ss, matchData) {
  if (!matchData || !matchData.id) {
    return { success: false, error: 'Datos de partido inválidos' };
  }

  var sheet = ss.getSheetByName(SHEETS.PARTIDOS);
  var values = sheet.getDataRange().getValues();
  var matchRowIndex = -1;

  for (var r = 1; r < values.length; r++) {
    if (String(values[r][0]).trim() === String(matchData.id).trim()) {
      matchRowIndex = r + 1;
      break;
    }
  }

  var homeGoals = (matchData.homeGoals !== null && matchData.homeGoals !== undefined && matchData.homeGoals !== '') 
    ? parseInt(matchData.homeGoals) 
    : '';
  var awayGoals = (matchData.awayGoals !== null && matchData.awayGoals !== undefined && matchData.awayGoals !== '') 
    ? parseInt(matchData.awayGoals) 
    : '';
  var status = matchData.status || (homeGoals !== '' && awayGoals !== '' ? 'finished' : 'scheduled');

  if (matchRowIndex > 0) {
    sheet.getRange(matchRowIndex, 5).setValue(homeGoals);
    sheet.getRange(matchRowIndex, 6).setValue(awayGoals);
    sheet.getRange(matchRowIndex, 9).setValue(status);
    if (matchData.pitch) sheet.getRange(matchRowIndex, 10).setValue(matchData.pitch);
    if (matchData.time) sheet.getRange(matchRowIndex, 11).setValue(matchData.time);
  } else {
    sheet.appendRow([
      matchData.id,
      matchData.dateNumber || 1,
      matchData.homeTeamId,
      matchData.homeTeamName,
      homeGoals,
      awayGoals,
      matchData.awayTeamId,
      matchData.awayTeamName,
      status,
      matchData.pitch || 'Cancha 1 (Principal)',
      matchData.time || '20:00',
      matchData.calendarDate || '',
      matchData.isPlayoff || false,
      matchData.playoffRound || ''
    ]);
  }

  recalculateStandingsSheet(ss);

  return {
    success: true,
    message: 'Marcador guardado y tabla de posiciones recalculada con éxito.',
    data: {
      standings: getStandingsData(ss),
      matches: getMatchesData(ss)
    }
  };
}

function addTeamHandler(ss, teamData) {
  if (!teamData || !teamData.name || String(teamData.name).trim() === '') {
    return { success: false, error: 'Nombre de equipo requerido' };
  }

  var config = getTournamentConfig(ss);
  var currentDate = parseInt(config.currentDateNumber) || 1;

  if (currentDate > 5) {
    return {
      success: false,
      error: 'Inscripción bloqueada: La ventana de registro cerró al finalizar la Fecha 5.'
    };
  }

  var sheet = ss.getSheetByName(SHEETS.EQUIPOS);
  var teamId = teamData.id || ('EQ_' + ('00' + (sheet.getLastRow())).slice(-2));
  var entryDate = teamData.entryDate || currentDate;

  sheet.appendRow([
    teamId,
    String(teamData.name).trim(),
    String(teamData.shortName || teamData.name.substring(0, 3)).trim().toUpperCase(),
    teamData.color || '#10B981',
    teamData.badgeEmoji || '⚽',
    entryDate,
    true,
    0, 0, 0, 0, 0, 0, 0, 0
  ]);

  recalculateStandingsSheet(ss);

  return {
    success: true,
    message: 'Equipo "' + teamData.name + '" incorporado exitosamente en Fecha ' + entryDate,
    data: {
      teamId: teamId,
      teams: getTeamsData(ss),
      standings: getStandingsData(ss)
    }
  };
}

function editTeamHandler(ss, teamData) {
  var sheet = ss.getSheetByName(SHEETS.EQUIPOS);
  var values = sheet.getDataRange().getValues();
  var row = -1;

  for (var r = 1; r < values.length; r++) {
    if (String(values[r][0]).trim() === String(teamData.id).trim()) {
      row = r + 1;
      break;
    }
  }

  if (row === -1) return { success: false, error: 'Equipo no encontrado' };

  if (teamData.name) sheet.getRange(row, 2).setValue(String(teamData.name).trim());
  if (teamData.shortName) sheet.getRange(row, 3).setValue(String(teamData.shortName).trim().toUpperCase());
  if (teamData.color) sheet.getRange(row, 4).setValue(teamData.color);
  if (teamData.badgeEmoji) sheet.getRange(row, 5).setValue(teamData.badgeEmoji);
  if (teamData.active !== undefined) sheet.getRange(row, 7).setValue(teamData.active);

  return {
    success: true,
    message: 'Equipo actualizado correctamente.'
  };
}

function savePlayoffMatchHandler(ss, playoffData) {
  var sheet = ss.getSheetByName(SHEETS.PLAYOFFS);
  var values = sheet.getDataRange().getValues();
  var targetRow = -1;

  for (var r = 1; r < values.length; r++) {
    if (String(values[r][0]).trim() === String(playoffData.id).trim()) {
      targetRow = r + 1;
      break;
    }
  }

  if (targetRow === -1) {
    return { success: false, error: 'Llave de playoff no encontrada' };
  }

  sheet.getRange(targetRow, 6).setValue(playoffData.homeGoals !== null ? playoffData.homeGoals : '');
  sheet.getRange(targetRow, 7).setValue(playoffData.homePenalties !== null ? playoffData.homePenalties : '');
  sheet.getRange(targetRow, 10).setValue(playoffData.awayGoals !== null ? playoffData.awayGoals : '');
  sheet.getRange(targetRow, 11).setValue(playoffData.awayPenalties !== null ? playoffData.awayPenalties : '');
  sheet.getRange(targetRow, 12).setValue(playoffData.winnerId || '');
  sheet.getRange(targetRow, 13).setValue(playoffData.status || 'finished');

  if (playoffData.winnerId && playoffData.nextMatchId) {
    advancePlayoffWinner(ss, playoffData.nextMatchId, playoffData.winnerId, playoffData.winnerName);
  }

  return {
    success: true,
    message: 'Resultado de Playoffs guardado y bracket actualizado.',
    data: getPlayoffsData(ss)
  };
}

function advancePlayoffWinner(ss, nextMatchId, winnerId, winnerName) {
  var sheet = ss.getSheetByName(SHEETS.PLAYOFFS);
  var values = sheet.getDataRange().getValues();
  for (var r = 1; r < values.length; r++) {
    if (String(values[r][0]).trim() === String(nextMatchId).trim()) {
      var row = r + 1;
      var eq1Id = values[r][3];
      if (!eq1Id || String(eq1Id).trim() === '') {
        sheet.getRange(row, 4).setValue(winnerId);
        sheet.getRange(row, 5).setValue(winnerName);
      } else {
        sheet.getRange(row, 8).setValue(winnerId);
        sheet.getRange(row, 9).setValue(winnerName);
      }
      break;
    }
  }
}

function getTopScorersData(ss) {
  return [
    { id: 'SC_1', name: 'Lautaro Martínez', teamName: 'Real Academia FC', teamColor: '#10B981', goals: 9, matches: 4 },
    { id: 'SC_2', name: 'Julián Álvarez', teamName: 'Atlético Central', teamColor: '#3B82F6', goals: 7, matches: 4 },
    { id: 'SC_3', name: 'Mateo Retegui', teamName: 'Deportivo Sur', teamColor: '#F59E0B', goals: 6, matches: 4 },
    { id: 'SC_4', name: 'Enzo Fernández', teamName: 'Halcones del Valle', teamColor: '#8B5CF6', goals: 5, matches: 3 },
    { id: 'SC_5', name: 'Facundo Buonanotte', teamName: 'Sportivo Unión', teamColor: '#EC4899', goals: 4, matches: 4 }
  ];
}

function ensureSheetsStructure(ss) {
  for (var k in SHEETS) {
    var name = SHEETS[k];
    if (!ss.getSheetByName(name)) {
      ss.insertSheet(name);
    }
  }
}

function seedInitialTournamentData(ss) {
  ensureSheetsStructure(ss);

  var sheetConfig = ss.getSheetByName(SHEETS.CONFIG);
  sheetConfig.clear();
  sheetConfig.appendRow(['Clave', 'Valor']);
  sheetConfig.appendRow(['tournamentName', 'LIGA ACADEMIA 2025']);
  sheetConfig.appendRow(['currentDateNumber', 4]);
  sheetConfig.appendRow(['maxRegistrationDate', 5]);
  sheetConfig.appendRow(['isRegistrationOpen', 'true']);
  sheetConfig.appendRow(['playoffGoldSpots', 8]);
  sheetConfig.appendRow(['playoffSilverSpots', 4]);

  var sheetEquipos = ss.getSheetByName(SHEETS.EQUIPOS);
  sheetEquipos.clear();
  sheetEquipos.appendRow(['ID', 'Nombre', 'NombreCorto', 'Color', 'Emoji', 'FechaIngreso', 'Activo', 'PJ', 'PG', 'PE', 'PP', 'GF', 'GC', 'DG', 'Puntos']);
  
  var initialTeams = [
    ['EQ_01', 'Real Academia FC', 'RAC', '#10B981', '👑', 1, true, 4, 3, 1, 0, 11, 3, 8, 10],
    ['EQ_02', 'Atlético Central', 'ATC', '#3B82F6', '⚡', 1, true, 4, 3, 0, 1, 8, 4, 4, 9],
    ['EQ_03', 'Deportivo Sur', 'DPS', '#F59E0B', '☀️', 1, true, 4, 2, 2, 0, 7, 3, 4, 8],
    ['EQ_04', 'Halcones del Valle', 'HDV', '#8B5CF6', '🦅', 1, true, 4, 2, 1, 1, 9, 6, 3, 7],
    ['EQ_05', 'Sportivo Unión', 'SPU', '#EC4899', '🛡️', 1, true, 4, 2, 0, 2, 6, 7, -1, 6],
    ['EQ_06', 'Inter del Este', 'IDE', '#06B6D4', '🌐', 1, true, 4, 1, 2, 1, 5, 5, 0, 5],
    ['EQ_07', 'Huracán Norte', 'HUR', '#EF4444', '🌪️', 1, true, 4, 1, 1, 2, 4, 7, -3, 4],
    ['EQ_08', 'Estudiantes FC', 'EST', '#6366F1', '🦁', 1, true, 4, 1, 0, 3, 5, 9, -4, 3],
    ['EQ_09', 'Defensores de la Costa', 'DEF', '#14B8A6', '🌊', 2, true, 3, 1, 0, 2, 3, 6, -3, 3],
    ['EQ_10', 'San Martín Juniors', 'SMJ', '#F97316', '🔥', 3, true, 2, 0, 1, 1, 2, 6, -4, 1]
  ];

  for (var e = 0; e < initialTeams.length; e++) {
    sheetEquipos.appendRow(initialTeams[e]);
  }

  var sheetPartidos = ss.getSheetByName(SHEETS.PARTIDOS);
  sheetPartidos.clear();
  sheetPartidos.appendRow(['ID', 'FechaNumero', 'EquipoLocalId', 'EquipoLocalNombre', 'GolesLocal', 'GolesVisitante', 'EquipoVisitanteId', 'EquipoVisitanteNombre', 'Estado', 'Cancha', 'Horario', 'FechaCalendario', 'EsPlayoff', 'RondaPlayoff']);

  var initialMatches = [
    ['M_F1_01', 1, 'EQ_01', 'Real Academia FC', 3, 1, 'EQ_02', 'Atlético Central', 'finished', 'Cancha 1 (Principal)', '19:00', '2025-04-05', false, ''],
    ['M_F1_02', 1, 'EQ_03', 'Deportivo Sur', 2, 1, 'EQ_04', 'Halcones del Valle', 'finished', 'Cancha 2 (Sintético)', '19:00', '2025-04-05', false, ''],
    ['M_F1_03', 1, 'EQ_05', 'Sportivo Unión', 1, 0, 'EQ_06', 'Inter del Este', 'finished', 'Cancha 1 (Principal)', '20:30', '2025-04-05', false, ''],
    ['M_F1_04', 1, 'EQ_07', 'Huracán Norte', 2, 1, 'EQ_08', 'Estudiantes FC', 'finished', 'Cancha 2 (Sintético)', '20:30', '2025-04-05', false, ''],
    ['M_F2_01', 2, 'EQ_01', 'Real Academia FC', 2, 0, 'EQ_05', 'Sportivo Unión', 'finished', 'Cancha 1 (Principal)', '19:00', '2025-04-12', false, ''],
    ['M_F2_02', 2, 'EQ_02', 'Atlético Central', 3, 1, 'EQ_07', 'Huracán Norte', 'finished', 'Cancha 2 (Sintético)', '19:00', '2025-04-12', false, ''],
    ['M_F2_03', 2, 'EQ_04', 'Halcones del Valle', 4, 2, 'EQ_08', 'Estudiantes FC', 'finished', 'Cancha 1 (Principal)', '20:30', '2025-04-12', false, ''],
    ['M_F2_04', 2, 'EQ_03', 'Deportivo Sur', 1, 1, 'EQ_06', 'Inter del Este', 'finished', 'Cancha 2 (Sintético)', '20:30', '2025-04-12', false, ''],
    ['M_F2_05', 2, 'EQ_09', 'Defensores de la Costa', 1, 2, 'EQ_02', 'Atlético Central', 'finished', 'Cancha 3 (Noche)', '21:45', '2025-04-12', false, ''],
    ['M_F3_01', 3, 'EQ_01', 'Real Academia FC', 1, 1, 'EQ_03', 'Deportivo Sur', 'finished', 'Cancha 1 (Principal)', '19:00', '2025-04-19', false, ''],
    ['M_F3_02', 3, 'EQ_04', 'Halcones del Valle', 3, 1, 'EQ_07', 'Huracán Norte', 'finished', 'Cancha 2 (Sintético)', '19:00', '2025-04-19', false, ''],
    ['M_F3_03', 3, 'EQ_05', 'Sportivo Unión', 3, 1, 'EQ_08', 'Estudiantes FC', 'finished', 'Cancha 1 (Principal)', '20:30', '2025-04-19', false, ''],
    ['M_F3_04', 3, 'EQ_06', 'Inter del Este', 2, 1, 'EQ_09', 'Defensores de la Costa', 'finished', 'Cancha 2 (Sintético)', '20:30', '2025-04-19', false, ''],
    ['M_F3_05', 3, 'EQ_10', 'San Martín Juniors', 1, 1, 'EQ_06', 'Inter del Este', 'finished', 'Cancha 3 (Noche)', '21:45', '2025-04-19', false, ''],
    ['M_F3_06', 3, 'EQ_09', 'Defensores de la Costa', 1, 0, 'EQ_07', 'Huracán Norte', 'finished', 'Cancha 1 (Principal)', '22:00', '2025-04-19', false, ''],
    ['M_F4_01', 4, 'EQ_01', 'Real Academia FC', 5, 1, 'EQ_08', 'Estudiantes FC', 'finished', 'Cancha 1 (Principal)', '19:00', '2025-04-26', false, ''],
    ['M_F4_02', 4, 'EQ_02', 'Atlético Central', 2, 1, 'EQ_04', 'Halcones del Valle', 'finished', 'Cancha 2 (Sintético)', '19:00', '2025-04-26', false, ''],
    ['M_F4_03', 4, 'EQ_03', 'Deportivo Sur', 3, 0, 'EQ_05', 'Sportivo Unión', 'finished', 'Cancha 1 (Principal)', '20:30', '2025-04-26', false, ''],
    ['M_F4_04', 4, 'EQ_06', 'Inter del Este', 1, 1, 'EQ_07', 'Huracán Norte', 'finished', 'Cancha 2 (Sintético)', '20:30', '2025-04-26', false, ''],
    ['M_F4_05', 4, 'EQ_10', 'San Martín Juniors', 1, 5, 'EQ_08', 'Estudiantes FC', 'finished', 'Cancha 3 (Noche)', '21:45', '2025-04-26', false, '']
  ];

  for (var p = 0; p < initialMatches.length; p++) {
    sheetPartidos.appendRow(initialMatches[p]);
  }

  var sheetPlayoffs = ss.getSheetByName(SHEETS.PLAYOFFS);
  sheetPlayoffs.clear();
  sheetPlayoffs.appendRow(['LlaveId', 'Ronda', 'Indice', 'Equipo1Id', 'Equipo1Nombre', 'Goles1', 'Penales1', 'Equipo2Id', 'Equipo2Nombre', 'Goles2', 'Penales2', 'GanadorId', 'Estado', 'SiguienteLlaveId']);

  var initialPlayoffs = [
    ['QF_1', 'cuartos', 0, 'EQ_01', '1º Real Academia FC', 3, '', 'EQ_08', '8º Estudiantes FC', 1, '', 'EQ_01', 'finished', 'SF_1'],
    ['QF_2', 'cuartos', 1, 'EQ_04', '4º Halcones del Valle', 2, 4, 'EQ_05', '5º Sportivo Unión', 2, 3, 'EQ_04', 'finished', 'SF_1'],
    ['QF_3', 'cuartos', 2, 'EQ_02', '2º Atlético Central', 2, '', 'EQ_07', '7º Huracán Norte', 0, '', 'EQ_02', 'finished', 'SF_2'],
    ['QF_4', 'cuartos', 3, 'EQ_03', '3º Deportivo Sur', 1, '', 'EQ_06', '6º Inter del Este', 2, '', 'EQ_06', 'finished', 'SF_2'],
    ['SF_1', 'semis', 0, 'EQ_01', 'Real Academia FC', '', '', 'EQ_04', 'Halcones del Valle', '', '', '', 'pending', 'FINAL'],
    ['SF_2', 'semis', 1, 'EQ_02', 'Atlético Central', '', '', 'EQ_06', 'Inter del Este', '', '', '', 'pending', 'FINAL'],
    ['FINAL', 'final', 0, '', 'Ganador SF 1', '', '', '', 'Ganador SF 2', '', '', '', 'pending', ''],
    ['TERCERO', 'tercero', 0, '', 'Perdedor SF 1', '', '', '', 'Perdedor SF 2', '', '', '', 'pending', '']
  ];

  for (var pl = 0; pl < initialPlayoffs.length; pl++) {
    sheetPlayoffs.appendRow(initialPlayoffs[pl]);
  }

  recalculateStandingsSheet(ss);
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
