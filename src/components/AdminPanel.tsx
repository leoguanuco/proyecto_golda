import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  KeyRound,
  PlusCircle,
  Play,
  Save,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  RefreshCw,
  Trash2,
  Edit2,
  Terminal,
  Trophy,
  Calendar,
  Layers,
  Settings,
  Link,
  Check,
  UserPlus,
  LogIn,
  LogOut,
  Users,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Info,
  Shield,
  FileSpreadsheet,
  Download,
  ExternalLink,
} from 'lucide-react';
import { Match, Team, TournamentConfig, PlayoffMatch, TournamentData, UserProfile, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { ADMIN_INVITE_CODE } from '../services/authService';
import { downloadTournamentSpreadsheet } from '../services/sheetsExportService';

interface AdminPanelProps {
  tournamentData: TournamentData;
  onSaveMatchScore: (match: Match) => Promise<any>;
  onGenerateNextDate: () => Promise<any>;
  onAddTeam: (team: { name: string; shortName: string; color: string; badgeEmoji: string; entryDate: number }) => Promise<any>;
  onUpdateTeam: (team: Team) => Promise<any>;
  onDeleteTeam: (teamId: string) => Promise<any>;
  onSavePlayoffMatch: (match: PlayoffMatch) => Promise<any>;
  onUpdateConfig: (config: Partial<TournamentConfig>) => void;
  onPingGas: (url: string) => Promise<any>;
  onResetTournament: () => void;
  selectedMatchForEdit?: Match | null;
  onClearSelectedMatch?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  tournamentData,
  onSaveMatchScore,
  onGenerateNextDate,
  onAddTeam,
  onUpdateTeam,
  onDeleteTeam,
  onSavePlayoffMatch,
  onUpdateConfig,
  onPingGas,
  onResetTournament,
  selectedMatchForEdit,
  onClearSelectedMatch,
}) => {
  const {
    user,
    userProfile,
    isAdmin,
    isUser,
    loading: authLoading,
    login,
    register,
    logout,
    promoteWithCode,
    getAllUsers,
    changeUserRole,
  } = useAuth();

  const { config, teams, matches, playoffs } = tournamentData;

  // Auth Form State (Login / Register)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [adminCodeInput, setAdminCodeInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Elevation PIN State for standard user
  const [elevationCode, setElevationCode] = useState('');
  const [elevationError, setElevationError] = useState('');
  const [elevationSuccess, setElevationSuccess] = useState('');

  // Admin Subtabs
  const [adminTab, setAdminTab] = useState<'matches' | 'fixture_gen' | 'teams' | 'playoffs' | 'users' | 'config'>('matches');

  // Match Editor State
  const [selectedDateForEdit, setSelectedDateForEdit] = useState<number>(config.currentDateNumber || 1);
  const [editingMatch, setEditingMatch] = useState<Match | null>(selectedMatchForEdit || null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // New Team Form State
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamShort, setNewTeamShort] = useState('');
  const [newTeamColor, setNewTeamColor] = useState('#10B981');
  const [newTeamEmoji, setNewTeamEmoji] = useState('⚽');
  const [newTeamEntryDate, setNewTeamEntryDate] = useState<number>(config.currentDateNumber || 1);
  const [teamFormError, setTeamFormError] = useState('');
  const [teamFormSuccess, setTeamFormSuccess] = useState('');

  // Fixture Generator Preview State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatorLogs, setGeneratorLogs] = useState<string[]>([]);
  const [generatorResultMsg, setGeneratorResultMsg] = useState('');

  // Users Management State
  const [userList, setUserList] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userActionMsg, setUserActionMsg] = useState('');

  // GAS URL Config State
  const [gasUrlInput, setGasUrlInput] = useState(config.appsScriptUrl || '');
  const [pingStatus, setPingStatus] = useState<{ testing: boolean; result?: string; success?: boolean }>({ testing: false });

  // Update editingMatch when selectedMatchForEdit changes
  useEffect(() => {
    if (selectedMatchForEdit) {
      setEditingMatch(selectedMatchForEdit);
      setSelectedDateForEdit(selectedMatchForEdit.dateNumber);
      setAdminTab('matches');
    }
  }, [selectedMatchForEdit]);

  // Load registered users when admin opens Users tab
  useEffect(() => {
    if (isAdmin && adminTab === 'users') {
      loadRegisteredUsers();
    }
  }, [isAdmin, adminTab]);

  const loadRegisteredUsers = async () => {
    setLoadingUsers(true);
    try {
      const list = await getAllUsers();
      setUserList(list);
    } catch (e) {
      console.error('Error loading users:', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Handle Login & Register submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setIsSubmittingAuth(true);

    if (!emailInput || !passwordInput) {
      setAuthError('Por favor completa todos los campos requeridos.');
      setIsSubmittingAuth(false);
      return;
    }

    try {
      if (authMode === 'login') {
        const res = await login(emailInput, passwordInput);
        if (!res.success) {
          setAuthError(res.error || 'Error al iniciar sesión.');
        } else {
          setAuthSuccess('¡Sesión iniciada con éxito!');
        }
      } else {
        if (passwordInput.length < 6) {
          setAuthError('La contraseña debe contener al menos 6 caracteres.');
          setIsSubmittingAuth(false);
          return;
        }
        const res = await register(emailInput, passwordInput, displayNameInput, adminCodeInput);
        if (!res.success) {
          setAuthError(res.error || 'Error al registrar usuario.');
        } else {
          setAuthSuccess('¡Cuenta creada e iniciada con éxito!');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Quick Demo Login Helper
  const handleQuickDemo = async (roleType: 'admin' | 'user') => {
    setAuthError('');
    setIsSubmittingAuth(true);
    const demoEmail = roleType === 'admin' ? 'admin@ligaacademia.com' : 'espectador@ligaacademia.com';
    const demoPass = roleType === 'admin' ? 'Academia2025!Admin' : 'academia2025';
    const demoName = roleType === 'admin' ? 'Admin Liga Academia' : 'Usuario Aficionado';
    const demoCode = roleType === 'admin' ? ADMIN_INVITE_CODE : '';

    try {
      // Try login first
      let loginRes = await login(demoEmail, demoPass);
      if (!loginRes.success && roleType === 'admin') {
        // Also try fallback legacy pass if existed
        loginRes = await login(demoEmail, 'academia2025');
      }

      if (!loginRes.success) {
        // If not registered yet, register automatically
        const regRes = await register(demoEmail, demoPass, demoName, demoCode);
        if (!regRes.success) {
          setAuthError(regRes.error || 'No se pudo iniciar cuenta demo.');
        }
      }
    } catch (e: any) {
      setAuthError('Error en autenticación: ' + e.message);
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Handle Elevate to Admin with PIN
  const handleElevateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setElevationError('');
    setElevationSuccess('');
    if (!elevationCode.trim()) {
      setElevationError('Ingresa el código de administrador.');
      return;
    }

    const res = await promoteWithCode(elevationCode);
    if (res.success) {
      setElevationSuccess('¡Privilegios de Administrador activados correctamente!');
      setElevationCode('');
    } else {
      setElevationError(res.error || 'Código incorrecto. (Prueba con: 1234)');
    }
  };

  // Handle User Role Change in Admin
  const handleRoleChange = async (targetUid: string, newRole: UserRole) => {
    setUserActionMsg('');
    const res = await changeUserRole(targetUid, newRole);
    if (res.success) {
      setUserActionMsg(`Rol actualizado a "${newRole}" con éxito.`);
      loadRegisteredUsers();
      setTimeout(() => setUserActionMsg(''), 4000);
    } else {
      setUserActionMsg('Error al actualizar rol: ' + res.error);
    }
  };

  // --- SUB-HANDLERS ---
  const handleSaveScore = async (match: Match) => {
    const res = await onSaveMatchScore(match);
    setSaveSuccessMsg(`¡Marcador guardado con éxito para ${match.homeTeamName} vs ${match.awayTeamName}!`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
    setEditingMatch(null);
    if (onClearSelectedMatch) onClearSelectedMatch();
  };

  const handleGenerateNextDateClick = async () => {
    setIsGenerating(true);
    setGeneratorResultMsg('');
    setGeneratorLogs(['Iniciando algoritmo de fixture...']);

    try {
      const res = await onGenerateNextDate();
      if (res.result && res.result.logs) {
        setGeneratorLogs(res.result.logs);
      }
      setGeneratorResultMsg(res.message || 'Fecha generada correctamente.');
    } catch (err: any) {
      setGeneratorResultMsg(`Error al generar fecha: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamFormError('');
    setTeamFormSuccess('');

    if (!newTeamName.trim()) {
      setTeamFormError('El nombre del equipo es obligatorio');
      return;
    }

    if (config.currentDateNumber > 5) {
      setTeamFormError('Reglamento: No se permiten inscripciones luego de la Fecha 5.');
      return;
    }

    const res = await onAddTeam({
      name: newTeamName.trim(),
      shortName: newTeamShort.trim().toUpperCase() || newTeamName.substring(0, 3).toUpperCase(),
      color: newTeamColor,
      badgeEmoji: newTeamEmoji,
      entryDate: newTeamEntryDate,
    });

    if (res.success) {
      setTeamFormSuccess(res.message);
      setNewTeamName('');
      setNewTeamShort('');
      setTimeout(() => setTeamFormSuccess(''), 4000);
    } else {
      setTeamFormError(res.message || res.error || 'Error al crear equipo');
    }
  };

  const handlePing = async () => {
    setPingStatus({ testing: true });
    const res = await onPingGas(gasUrlInput);
    setPingStatus({
      testing: false,
      result: res.message,
      success: res.success,
    });
    if (res.success) {
      onUpdateConfig({ appsScriptUrl: gasUrlInput });
    }
  };

  // Filter matches for editor
  const dateMatchesToEdit = matches.filter((m) => !m.isPlayoff && m.dateNumber === selectedDateForEdit);

  // 1. Loading auth state
  if (authLoading) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-700">Verificando credenciales de seguridad...</p>
      </div>
    );
  }

  // 2. UNATHENTICATED VIEW: Login / Register Form
  if (!isUser) {
    return (
      <div className="max-w-lg mx-auto py-10 px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          {/* Header Icon & Title */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
              AUTENTICACIÓN LIGA ACADEMIA
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Ingresa o regístrate con Firebase Auth para acceder al panel de control y gestión de torneos.
            </p>
          </div>

          {/* Master Admin Credentials Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-50 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Credenciales Oficiales de Administrador</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 uppercase">
                Único & Seguro
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white/80 p-2.5 rounded-lg border border-amber-200/60">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Correo:</span>
                <code className="text-slate-800 font-mono font-semibold select-all">admin@ligaacademia.com</code>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Contraseña:</span>
                <code className="text-slate-800 font-mono font-semibold select-all">Academia2025!Admin</code>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">PIN Elevación: <strong className="text-amber-800 font-mono">1234</strong></span>
              <button
                type="button"
                onClick={() => {
                  setEmailInput('admin@ligaacademia.com');
                  setPasswordInput('Academia2025!Admin');
                  setAuthMode('login');
                  setAuthError('');
                }}
                className="text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer"
              >
                Autocompletar en el formulario
              </button>
            </div>
          </div>

          {/* Login / Register Tab Switch */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setAuthError('');
              }}
              className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                authMode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setAuthError('');
              }}
              className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                authMode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Crear Cuenta</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre Completo / Apodo
                </label>
                <input
                  type="text"
                  placeholder="ej. Franco Guari"
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="admin@ligaacademia.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                required
                minLength={6}
              />
            </div>

            {authMode === 'register' && (
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-amber-900">
                    Código de Invitación de Administrador (Opcional)
                  </label>
                  <span className="text-[10px] text-amber-700 font-semibold">PIN: 1234</span>
                </div>
                <input
                  type="text"
                  placeholder="Ingresa '1234' para rol de Administrador"
                  value={adminCodeInput}
                  onChange={(e) => setAdminCodeInput(e.target.value)}
                  className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-amber-500 placeholder-slate-400"
                />
                <p className="text-[11px] text-amber-800">
                  Si dejas este campo vacío, tu cuenta se creará con el rol de <strong>Usuario Estándar</strong>.
                </p>
              </div>
            )}

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{authSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmittingAuth}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmittingAuth && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>{authMode === 'login' ? 'Iniciar Sesión en el Panel' : 'Registrar y Acceder'}</span>
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
              Acceso Rápido de Prueba (1 Clic)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                disabled={isSubmittingAuth}
                className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Demo Administrador</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('user')}
                disabled={isSubmittingAuth}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <UserCheck className="w-4 h-4 text-slate-500" />
                <span>Demo Usuario Estándar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. AUTHENTICATED BUT STANDARD USER VIEW (ROLE: 'user')
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-lg">
                {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{userProfile?.displayName || user?.email}</h3>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Usuario Estándar</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Acceso Restringido a Funciones de Administrador</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Tu cuenta tiene rol de <strong>Usuario Estándar (Lectura)</strong>. Puedes consultar tablas, fixtures, playoffs y goleadores en las secciones públicas. Las acciones de <em>carga de resultados, gestión de equipos y generación de fixture</em> están reservadas a Administradores.
            </p>
          </div>

          {/* Elevate with PIN form */}
          <form onSubmit={handleElevateSubmit} className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <label className="block text-xs font-bold text-slate-800">
              ¿Eres Organizador o Administrador de la Liga?
            </label>
            <p className="text-xs text-slate-500">
              Ingresa el código o PIN de administración (predeterminado: <code className="font-mono font-bold text-slate-700">1234</code>) para elevar tu cuenta al rol de Administrador.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Código de Administrador (ej: 1234)"
                value={elevationCode}
                onChange={(e) => setElevationCode(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 font-mono focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition shrink-0"
              >
                Activar Admin
              </button>
            </div>

            {elevationError && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {elevationError}
              </p>
            )}

            {elevationSuccess && (
              <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {elevationSuccess}
              </p>
            )}
          </form>

          {/* Logout button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. AUTHENTICATED AS ADMINISTRATOR: FULL ACCESS VIEW
  return (
    <div className="space-y-6">
      {/* Admin Header with User info & logout */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shadow-sm">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">
                PANEL DE ADMINISTRACIÓN
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>ADMIN</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Sesión activa como: <strong className="text-slate-800">{userProfile?.displayName || user?.email}</strong> ({user?.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs transition border border-slate-200 hover:border-rose-200"
            title="Cerrar sesión de Administrador"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2 text-xs sm:text-sm">
        <button
          onClick={() => setAdminTab('matches')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${
            adminTab === 'matches'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Edit2 className="w-4 h-4" />
          <span>Partidos & Marcadores</span>
        </button>

        <button
          onClick={() => setAdminTab('fixture_gen')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${
            adminTab === 'fixture_gen'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Motor Fixture</span>
        </button>

        <button
          onClick={() => setAdminTab('teams')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${
            adminTab === 'teams'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Clubes & Equipos</span>
        </button>

        <button
          onClick={() => setAdminTab('playoffs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${
            adminTab === 'playoffs'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Playoffs</span>
        </button>

        <button
          onClick={() => setAdminTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${
            adminTab === 'users'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuarios & Roles</span>
        </button>

        <button
          onClick={() => setAdminTab('config')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${
            adminTab === 'config'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configuración & Sheets</span>
        </button>
      </div>

      {saveSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* --- TAB 1: MATCHES & SCORES ADMIN --- */}
      {adminTab === 'matches' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-base sm:text-lg">
                CARGA RÁPIDA DE RESULTADOS Y HORARIOS
              </h3>
              <p className="text-xs text-slate-500">
                Selecciona la fecha para cargar goles en vivo o finales, canchas y horarios asignados.
              </p>
            </div>

            {/* Date Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Fecha:</span>
              <div className="flex gap-1 overflow-x-auto">
                {Array.from(new Set(matches.map((m) => m.dateNumber))).sort((a: number, b: number) => a - b).map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setSelectedDateForEdit(d);
                      setEditingMatch(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      selectedDateForEdit === d
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    F{d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Edit Modal / Section if a match is selected */}
          {editingMatch && (
            <div className="bg-white border-2 border-emerald-500/40 rounded-xl p-5 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900 text-sm">
                    Editando Partido — Fecha {editingMatch.dateNumber}
                  </span>
                </div>
                <button
                  onClick={() => setEditingMatch(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                >
                  Cerrar Editor
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-center">
                {/* Home Team Input */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-display font-bold text-slate-900 text-base block truncate">
                    {editingMatch.homeTeamName}
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <label className="text-xs text-slate-500 font-semibold">Goles:</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={editingMatch.homeGoals !== null ? editingMatch.homeGoals : ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : parseInt(e.target.value);
                        setEditingMatch({ ...editingMatch, homeGoals: val });
                      }}
                      className="w-16 h-12 text-center text-xl font-bold bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Status and Details */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Estado</label>
                    <select
                      value={editingMatch.status}
                      onChange={(e) => setEditingMatch({ ...editingMatch, status: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="scheduled">Programado</option>
                      <option value="live">En Vivo (Jugando)</option>
                      <option value="finished">Finalizado</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cancha</label>
                      <input
                        type="text"
                        value={editingMatch.pitch}
                        onChange={(e) => setEditingMatch({ ...editingMatch, pitch: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Horario</label>
                      <input
                        type="text"
                        value={editingMatch.time}
                        onChange={(e) => setEditingMatch({ ...editingMatch, time: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Away Team Input */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-display font-bold text-slate-900 text-base block truncate">
                    {editingMatch.awayTeamName}
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <label className="text-xs text-slate-500 font-semibold">Goles:</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={editingMatch.awayGoals !== null ? editingMatch.awayGoals : ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : parseInt(e.target.value);
                        setEditingMatch({ ...editingMatch, awayGoals: val });
                      }}
                      className="w-16 h-12 text-center text-xl font-bold bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMatch(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveScore(editingMatch)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Marcador</span>
                </button>
              </div>
            </div>
          )}

          {/* Matches List in selected Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dateMatchesToEdit.map((m, mIdx) => (
              <div
                key={`${m.id}-${mIdx}`}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition flex items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-semibold">{m.pitch}</span>
                    <span>•</span>
                    <span className="font-mono">{m.time} hs</span>
                    {m.status === 'live' && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px]">
                        EN VIVO
                      </span>
                    )}
                    {m.status === 'finished' && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
                        FINAL
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-900 truncate">{m.homeTeamName}</span>
                    <span className="font-mono font-bold text-base px-2 py-0.5 rounded bg-slate-50 text-slate-900 border border-slate-200">
                      {m.homeGoals !== null ? m.homeGoals : '-'} : {m.awayGoals !== null ? m.awayGoals : '-'}
                    </span>
                    <span className="font-bold text-slate-900 truncate text-right">{m.awayTeamName}</span>
                  </div>
                </div>

                <button
                  onClick={() => setEditingMatch(m)}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 transition border border-slate-200 shrink-0"
                  title="Cargar marcador"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 2: FIXTURE GENERATOR ENGINE --- */}
      {adminTab === 'fixture_gen' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-emerald-600" />
              <h3 className="font-display font-bold text-slate-900 text-lg">
                MOTOR AUTOMÁTICO DE FIXTURE
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              El motor genera la siguiente fecha del torneo aplicando el balance de localías, emparejamiento de equipos activos y resolución de dobles fechas para equipos con partidos pendientes (hasta Fecha 5). Al alcanzar la Fecha 6, el fixture se bloquea y calcula el calendario completo.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleGenerateNextDateClick}
                disabled={isGenerating}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>Generar Próxima Fecha (Fecha {config.currentDateNumber + 1})</span>
              </button>
            </div>

            {generatorResultMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{generatorResultMsg}</span>
              </div>
            )}
          </div>

          {/* Execution Logs */}
          {generatorLogs.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Logs de Ejecución del Algoritmo:</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-emerald-400 max-h-48 overflow-y-auto space-y-1">
                {generatorLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: TEAMS MANAGEMENT --- */}
      {adminTab === 'teams' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-900 text-lg">Inscribir Nuevo Club</h3>
            {config.currentDateNumber <= 5 ? (
              <form onSubmit={handleCreateTeamSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Nombre del Equipo</label>
                    <input
                      type="text"
                      placeholder="ej: Belgrano FC"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Sigla / Abreviatura</label>
                    <input
                      type="text"
                      placeholder="ej: BEL"
                      maxLength={4}
                      value={newTeamShort}
                      onChange={(e) => setNewTeamShort(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-emerald-500 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Emoji / Escudo</label>
                    <input
                      type="text"
                      value={newTeamEmoji}
                      onChange={(e) => setNewTeamEmoji(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-center text-base focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Debut en Fecha</label>
                    <select
                      value={newTeamEntryDate}
                      onChange={(e) => setNewTeamEntryDate(parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    >
                      {[1, 2, 3, 4, 5].map((d) => (
                        <option key={d} value={d}>
                          Fecha {d} {d === config.currentDateNumber ? '(Fecha Actual)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs">
                    {teamFormError && <p className="text-rose-600">{teamFormError}</p>}
                    {teamFormSuccess && <p className="text-emerald-600 font-semibold">{teamFormSuccess}</p>}
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition"
                  >
                    Agregar Equipo al Torneo
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                ⚠️ Por regla de torneo, al haber comenzado la Fecha 6, no se admiten nuevos equipos para garantizar la paridad del fixture Round-Robin completo.
              </div>
            )}
          </div>

          {/* Teams Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h4 className="font-display font-bold text-slate-900 text-base">Clubes Inscriptos</h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold">
                    <th className="py-3 px-4">Equipo</th>
                    <th className="py-3 px-4 text-center">Sigla</th>
                    <th className="py-3 px-4 text-center">Fecha Ingreso</th>
                    <th className="py-3 px-4 text-center">PJ</th>
                    <th className="py-3 px-4 text-center">Puntos</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teams.map((team, idx) => (
                    <tr key={`${team.id}-${idx}`} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 flex items-center gap-2 font-bold text-slate-900">
                        <span>{team.badgeEmoji}</span>
                        <span>{team.name}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-500">{team.shortName}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                          Fecha {team.entryDate}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-700">{team.pj}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">{team.pts}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`¿Estás seguro de eliminar el equipo "${team.name}"?`)) {
                              onDeleteTeam(team.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition border border-rose-200"
                          title="Eliminar equipo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: PLAYOFFS ADMIN --- */}
      {adminTab === 'playoffs' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="font-display font-bold text-slate-900 text-lg">
                  ADMINISTRACIÓN DE CRUCES DE PLAYOFFS
                </h3>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Carga marcadores de Cuartos, Semifinales, Final y define la definición por penales en caso de empate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {playoffs.map((pl, pIdx) => (
              <div
                key={`${pl.id}-${pIdx}`}
                className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-100">
                  <span>{pl.roundLabel}</span>
                  <span className="text-[11px] text-amber-700 capitalize font-bold">{pl.round}</span>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Home */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-semibold text-slate-900 truncate">{pl.homeTeam.name}</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        placeholder="Goles"
                        value={pl.homeGoals !== null ? pl.homeGoals : ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : parseInt(e.target.value);
                          onSavePlayoffMatch({ ...pl, homeGoals: val });
                        }}
                        className="w-12 text-center bg-white border border-slate-200 rounded-lg p-1 text-slate-900 font-bold focus:border-emerald-500"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Pen."
                        value={pl.homePenalties !== null && pl.homePenalties !== undefined ? pl.homePenalties : ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : parseInt(e.target.value);
                          onSavePlayoffMatch({ ...pl, homePenalties: val });
                        }}
                        className="w-12 text-center bg-white border border-slate-200 rounded-lg p-1 text-amber-700 font-bold focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Away */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-semibold text-slate-900 truncate">{pl.awayTeam.name}</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        placeholder="Goles"
                        value={pl.awayGoals !== null ? pl.awayGoals : ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : parseInt(e.target.value);
                          onSavePlayoffMatch({ ...pl, awayGoals: val });
                        }}
                        className="w-12 text-center bg-white border border-slate-200 rounded-lg p-1 text-slate-900 font-bold focus:border-emerald-500"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Pen."
                        value={pl.awayPenalties !== null && pl.awayPenalties !== undefined ? pl.awayPenalties : ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : parseInt(e.target.value);
                          onSavePlayoffMatch({ ...pl, awayPenalties: val });
                        }}
                        className="w-12 text-center bg-white border border-slate-200 rounded-lg p-1 text-amber-700 font-bold focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Winner selection */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">Ganador clasificado:</span>
                  <select
                    value={pl.winnerId || ''}
                    onChange={(e) => {
                      const wId = e.target.value || null;
                      onSavePlayoffMatch({ ...pl, winnerId: wId, status: wId ? 'finished' : 'pending' });
                    }}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-900 font-medium"
                  >
                    <option value="">(Sin definir)</option>
                    {pl.homeTeam.teamId && <option value={pl.homeTeam.teamId}>{pl.homeTeam.name}</option>}
                    {pl.awayTeam.teamId && <option value={pl.awayTeam.teamId}>{pl.awayTeam.name}</option>}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 5: USERS & ROLES MANAGEMENT (NEW FIREBASE AUTH ROLES) --- */}
      {adminTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="font-display font-bold text-slate-900 text-lg">
                  USUARIOS REGISTRADOS & CONTROL DE ROLES (FIREBASE)
                </h3>
              </div>
              <button
                onClick={loadRegisteredUsers}
                disabled={loadingUsers}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                <span>Actualizar Lista</span>
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Administra los permisos de acceso a la plataforma. Los usuarios con rol <strong>Administrador</strong> tienen permisos de edición y generación; los usuarios con rol <strong>Usuario</strong> tienen acceso de solo lectura.
            </p>

            {userActionMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{userActionMsg}</span>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                Total de Cuentas: {userList.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                    <th className="py-3 px-4">Usuario / Nombre</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4 text-center">Rol Asignado</th>
                    <th className="py-3 px-4 text-center">Registrado</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userList.map((u) => {
                    const isSelf = u.uid === user?.uid;
                    return (
                      <tr key={u.uid} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-xs">
                              {u.displayName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{u.displayName || 'Sin nombre'}</span>
                                {isSelf && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                                    Tú
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">{u.email}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              u.role === 'admin'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {u.role === 'admin' ? (
                              <ShieldCheck className="w-3 h-3 text-amber-600" />
                            ) : (
                              <UserCheck className="w-3 h-3 text-slate-500" />
                            )}
                            <span className="capitalize">{u.role === 'admin' ? 'Administrador' : 'Usuario'}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                          >
                            <option value="admin">Administrador</option>
                            <option value="user">Usuario (Lectura)</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 6: CONFIGURACIÓN & GOOGLE SHEETS --- */}
      {adminTab === 'config' && (
        <div className="space-y-6">
          {/* Download Google Sheets Card */}
          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 border border-emerald-800/50 rounded-xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h4 className="font-display font-bold text-base text-white">
                  DESCARGAR PLANILLA PARA GOOGLE DRIVE / GOOGLE SHEETS
                </h4>
              </div>
              <p className="text-xs text-slate-300">
                Descarga el archivo <code>.xlsx</code> estructurado con 5 hojas (Equipos, Partidos, Tabla_Posiciones, Playoffs, Configuración) listo para subir a Google Drive.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  const sanitizedName = (tournamentData.config.tournamentName || 'TORNEO')
                    .replace(/[^a-zA-Z0-9_-]/g, '_')
                    .toUpperCase();
                  downloadTournamentSpreadsheet(tournamentData, `${sanitizedName}_GOOGLE_SHEETS.xlsx`);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Google Sheets (.xlsx)</span>
              </button>

              <a
                href="https://drive.google.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition"
              >
                <span>Ir a Google Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Link className="w-5 h-5 text-emerald-600" />
              <h3 className="font-display font-bold text-slate-900 text-lg">
                VINCULACIÓN CON GOOGLE APPS SCRIPT WEB APP
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Ingresa la URL del despliegue de tu Google Apps Script para sincronizar partidos, posiciones y fixture en tiempo real directamente con tu Google Sheets.
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                URL del Web App (doGet / doPost)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={gasUrlInput}
                  onChange={(e) => setGasUrlInput(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 font-mono placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handlePing}
                  disabled={pingStatus.testing || !gasUrlInput}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${pingStatus.testing ? 'animate-spin' : ''}`} />
                  <span>Probar Conexión (Ping)</span>
                </button>
              </div>

              {pingStatus.result && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    pingStatus.success
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium'
                      : 'bg-rose-50 border border-rose-200 text-rose-700'
                  }`}
                >
                  {pingStatus.success ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                  <span>{pingStatus.result}</span>
                </div>
              )}
            </div>
          </div>

          {/* Reset Tournament */}
          <div className="bg-white border border-rose-200 rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="font-display font-bold text-rose-600 text-base">
              Zona de Peligro / Reiniciar Torneo
            </h4>
            <p className="text-xs text-slate-500">
              Limpia la hoja de <strong>Partidos</strong> (borrando el fixture) y restablece a <strong>cero todas las estadísticas</strong> de la Tabla de Posiciones en Google Sheets y en la app, conservando únicamente los equipos inscriptos.
            </p>
            <button
              onClick={() => {
                if (
                  confirm(
                    '¿Estás seguro de reiniciar el torneo? Se limpiará el fixture y se reiniciarán las estadísticas a cero en Google Sheets y en la app, manteniendo los clubes inscriptos.'
                  )
                ) {
                  onResetTournament();
                }
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition shadow-sm"
            >
              Reiniciar Torneo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
