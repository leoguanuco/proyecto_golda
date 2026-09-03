import React, { useState } from 'react';
import {
  FileCode2,
  Copy,
  Check,
  Database,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  CloudUpload,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Layers,
  TableProperties,
} from 'lucide-react';
import { GOOGLE_SHEETS_STRUCTURE, GOOGLE_APPS_SCRIPT_CODE } from '../data/appsScriptCode';
import { TournamentData } from '../types';
import { downloadTournamentSpreadsheet } from '../services/sheetsExportService';
import { getStoredTournamentData } from '../services/appsScriptService';

interface AppsScriptSetupModalProps {
  tournamentData?: TournamentData;
}

export const AppsScriptSetupModal: React.FC<AppsScriptSetupModalProps> = ({ tournamentData }) => {
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'download' | 'steps' | 'code' | 'structure'>('download');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const currentData = tournamentData || getStoredTournamentData();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([GOOGLE_APPS_SCRIPT_CODE], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Code.gs';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadSpreadsheet = () => {
    const sanitizedName = (currentData.config.tournamentName || 'TORNEO')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toUpperCase();
    downloadTournamentSpreadsheet(currentData, `${sanitizedName}_GOOGLE_SHEETS.xlsx`);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 border border-emerald-800/40 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Compatibilidad 100% Google Sheets & Google Drive</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">
              Google Sheets para {currentData.config.tournamentName}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Descarga la planilla de cálculo oficial estructurada con 5 pestañas (<span className="text-emerald-400 font-mono">Equipos</span>, <span className="text-emerald-400 font-mono">Partidos</span>, <span className="text-emerald-400 font-mono">Tabla_Posiciones</span>, <span className="text-emerald-400 font-mono">Playoffs</span> y <span className="text-emerald-400 font-mono">Configuracion</span>). Súbela a tu Google Drive para editarla y sincronizarla en vivo con esta plataforma.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={handleDownloadSpreadsheet}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition transform active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>{downloadSuccess ? '¡Archivo Descargado!' : 'Descargar Google Sheets (.xlsx)'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '¡Code.gs Copiado!' : 'Copiar Code.gs'}</span>
              </button>

              <button
                onClick={handleDownloadCode}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition cursor-pointer"
                title="Descargar archivo Code.gs"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('download')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
            activeSubTab === 'download'
              ? 'bg-emerald-600 text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Descargar & Subir a Google Drive</span>
        </button>

        <button
          onClick={() => setActiveSubTab('steps')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
            activeSubTab === 'steps'
              ? 'bg-emerald-600 text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Guía Paso a Paso (Drive & Web App)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('structure')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
            activeSubTab === 'structure'
              ? 'bg-emerald-600 text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Estructura de las 5 Hojas</span>
        </button>

        <button
          onClick={() => setActiveSubTab('code')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
            activeSubTab === 'code'
              ? 'bg-emerald-600 text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          <span>Código Backend (Code.gs)</span>
        </button>
      </div>

      {/* TAB 1: DOWNLOAD & DRIVE UPLOAD HUB */}
      {activeSubTab === 'download' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <h3 className="font-display font-bold text-slate-900 text-lg">
                  Descargar Archivo XLSX
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Genera la planilla con todas las {currentData.teams.length} escuadras, los {currentData.matches.length} partidos programados y jugados, la tabla de posiciones y los playoffs.
                </p>
              </div>

              <button
                onClick={handleDownloadSpreadsheet}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Planilla (.xlsx)</span>
              </button>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <h3 className="font-display font-bold text-slate-900 text-lg">
                  Subir a Google Drive
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Entra a Google Drive (<a href="https://drive.google.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">drive.google.com</a>) y arrastra el archivo descargado. Al hacer doble clic, Google Drive lo abrirá automáticamente en Google Sheets.
                </p>
              </div>

              <a
                href="https://drive.google.com"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow transition"
              >
                <CloudUpload className="w-4 h-4" />
                <span>Abrir Google Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <h3 className="font-display font-bold text-slate-900 text-lg">
                  Vincular API Apps Script
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pega el código <code>Code.gs</code> en <span className="font-semibold">Extensiones &gt; Apps Script</span> de tu hoja en Google Sheets, implementa como Web App y conecta la URL en el panel de Administrador.
                </p>
              </div>

              <button
                onClick={() => setActiveSubTab('steps')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow transition cursor-pointer"
              >
                <span>Ver Guía Completa</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Summary of Included Data */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
            <h4 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
              <TableProperties className="w-5 h-5 text-emerald-600" />
              <span>Contenido incluido en el archivo de Google Sheets:</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="font-bold text-emerald-700 font-mono">1. Equipos</span>
                <p className="text-slate-500">{currentData.teams.length} equipos registrados</p>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="font-bold text-emerald-700 font-mono">2. Partidos</span>
                <p className="text-slate-500">{currentData.matches.length} partidos y fechas</p>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="font-bold text-emerald-700 font-mono">3. Tabla_Posiciones</span>
                <p className="text-slate-500">Puntos, DG, GF, GC, Zonas</p>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="font-bold text-emerald-700 font-mono">4. Playoffs</span>
                <p className="text-slate-500">{currentData.playoffs.length} llaves y cruces</p>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="font-bold text-emerald-700 font-mono">5. Configuracion</span>
                <p className="text-slate-500">Parámetros del torneo</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STEP BY STEP GUIDE */}
      {activeSubTab === 'steps' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-display font-bold text-slate-900">
              Guía de Despliegue e Integración con Google Drive & Google Sheets
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Sigue estos 5 sencillos pasos para tener tu torneo funcionando con Google Sheets como base de datos en la nube.
            </p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-slate-700">
            {/* Step 1 */}
            <div className="flex gap-4 items-start">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-sm">
                1
              </span>
              <div className="space-y-2 flex-1">
                <p className="font-bold text-slate-900 text-base">Descarga el archivo del torneo (.xlsx)</p>
                <p className="text-slate-600">
                  Haz clic en el botón de abajo para generar la planilla de cálculo con todos los datos preconfigurados y compatibles con la API:
                </p>
                <button
                  onClick={handleDownloadSpreadsheet}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-bold text-xs transition cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Descargar {currentData.config.tournamentName}.xlsx</span>
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 items-start">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-sm">
                2
              </span>
              <div className="space-y-2 flex-1">
                <p className="font-bold text-slate-900 text-base">Sube el archivo a tu Google Drive</p>
                <p className="text-slate-600">
                  Abre <a href="https://drive.google.com" target="_blank" rel="noreferrer" className="text-emerald-700 font-semibold underline">drive.google.com</a>, arrastra el archivo descargado dentro de tu unidad y ábrelo con doble clic. Si lo deseas, puedes ir a <strong className="text-slate-900">Archivo &gt; Guardar como hoja de cálculo de Google</strong>.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 items-start">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-sm">
                3
              </span>
              <div className="space-y-2 flex-1">
                <p className="font-bold text-slate-900 text-base">Abre Extensiones &gt; Apps Script</p>
                <p className="text-slate-600">
                  En el menú superior de Google Sheets, ve a <strong className="text-slate-900">Extensiones &gt; Apps Script</strong>. Borra cualquier código existente en <code>Code.gs</code> y pega el código completo generado en la pestaña <strong className="text-slate-900">"Código Backend (Code.gs)"</strong>. Guarda los cambios con <kbd className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px]">Ctrl + S</kbd>.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4 items-start">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-sm">
                4
              </span>
              <div className="space-y-2 flex-1">
                <p className="font-bold text-slate-900 text-base">Publica la Aplicación Web (Web App)</p>
                <p className="text-slate-600">
                  Haz clic en el botón azul superior <strong className="text-slate-900">Implementar (Deploy)</strong> &gt; <strong className="text-slate-900">Nueva implementación</strong>. Selecciona tipo <strong className="text-slate-900">Aplicación web</strong> y establece:
                </p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span><strong>Ejecutar como:</strong> Yo (tu cuenta de Google)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span><strong>Quién tiene acceso:</strong> Cualquier usuario (Anyone) — <em>Permite que la app web envíe y reciba los goles y fixture en tiempo real</em></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4 items-start">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-sm">
                5
              </span>
              <div className="space-y-2 flex-1">
                <p className="font-bold text-slate-900 text-base">Conecta la URL en el Panel de Administrador</p>
                <p className="text-slate-600">
                  Copia la URL proporcionada (termina en <code>/exec</code>) y pégala en la pestaña <strong className="text-slate-900">Panel Admin &gt; Configuración & Google Sheets</strong>. Presiona "Probar Conexión (Ping)" y tendrás sincronización bidireccional inmediata.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SHEETS STRUCTURE */}
      {activeSubTab === 'structure' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {GOOGLE_SHEETS_STRUCTURE.sheets.map((sh, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center justify-center text-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base font-display">
                      Pestaña: <code className="text-emerald-700 font-mono">'{sh.name}'</code>
                    </h3>
                    <p className="text-xs text-slate-500">{sh.description}</p>
                  </div>
                </div>

                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                        <th className="py-2.5 px-3">Columna (Encabezado)</th>
                        <th className="py-2.5 px-3">Tipo / Descripción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sh.columns.map((col, cIdx) => (
                        <tr key={cIdx} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-mono font-semibold text-emerald-700">
                            {col.key}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">
                            {col.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CODE.GS VIEWER */}
      {activeSubTab === 'code' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
          <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono font-semibold text-slate-200">Code.gs — Google Apps Script</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 max-h-[600px] overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed select-all">
            <pre>{GOOGLE_APPS_SCRIPT_CODE}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
