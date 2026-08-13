import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  UserPlus, 
  LogIn, 
  RefreshCw,
  AlertCircle,
  Users
} from 'lucide-react';
import { apiSignUp, apiSignIn, apiGetUsers, setActiveUser } from '../lib/supabase';
import { UserProfile } from '../types';
import vibeLogoBlue from '../assets/icons/vibe-logo-blue.svg';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signup' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [username, setUsername] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [avatarSeed, setAvatarSeed] = useState<string>(Math.random().toString(36).substring(7));
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [existingAccounts, setExistingAccounts] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setSuccessMsg(null);
      loadAccounts();
    }
  }, [isOpen, initialMode]);

  const loadAccounts = async () => {
    try {
      const users = await apiGetUsers();
      setExistingAccounts(users);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const currentAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${username.trim() || avatarSeed}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'signup') {
      if (!username.trim() || !email.trim() || !password.trim()) {
        setErrorMsg('Por favor completa todos los campos requeridos (*).');
        return;
      }

      if (password.length < 6) {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMsg('Las contraseñas no coinciden. Por favor verifica.');
        return;
      }

      setLoading(true);
      try {
        const res = await apiSignUp(
          email.trim(), 
          password, 
          username.trim(), 
          displayName.trim() || username.trim(),
          currentAvatarUrl
        );

        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg(`¡Bienvenido a VIBE, ${res.user.display_name}! Tu cuenta se ha creado con éxito.`);
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      } catch (err: any) {
        setErrorMsg(err?.message || 'Ocurrió un error al crear la cuenta');
      } finally {
        setLoading(false);
      }
    } else {
      if (!email.trim() || !password.trim()) {
        setErrorMsg('Ingresa tu correo o usuario y tu contraseña.');
        return;
      }

      setLoading(true);
      try {
        const res = await apiSignIn(email.trim(), password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg(`¡Hola de nuevo, ${res.user.display_name}! Sesión iniciada.`);
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      } catch (err: any) {
        setErrorMsg(err?.message || 'Ocurrió un error al iniciar sesión');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleQuickSwitch = (userId: string) => {
    setActiveUser(userId);
    setSuccessMsg('Cuenta seleccionada');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0A0E14]/85 backdrop-blur-md overflow-y-auto custom-scrollbar">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-md bg-[#121824] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="text-center space-y-1 pr-6">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[#3B6FF0]/15 border border-[#3B6FF0]/30 text-[#3B6FF0] text-xs font-semibold">
              <img src={vibeLogoBlue} alt="VIBE Logo" className="w-3.5 h-3.5 object-contain" />
              <span>Autenticación de Usuarios</span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white pt-1">
              {mode === 'signup' ? 'Crear Nueva Cuenta' : 'Iniciar Sesión'}
            </h3>
            <p className="text-xs text-slate-400">
              {mode === 'signup' 
                ? 'Regístrate para publicar, comentar y enviar mensajes directos' 
                : 'Accede a tu perfil existente en la red VIBE'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-[#0A0E14] border border-white/10 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                mode === 'login'
                  ? 'bg-[#3B6FF0] text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                mode === 'signup'
                  ? 'bg-[#3B6FF0] text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Crear Cuenta</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-start space-x-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Success Message */}
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <>
                {/* Avatar Preview Selector */}
                <div className="flex items-center space-x-3 p-2.5 bg-[#0A0E14] border border-white/10 rounded-xl">
                  <div className="relative shrink-0">
                    <img 
                      src={currentAvatarUrl} 
                      alt="Avatar Preview" 
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-[#3B6FF0]/40 bg-[#121824]"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Avatar Automático</span>
                    <span className="block text-xs text-slate-200 truncate">Basado en tu usuario</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAvatarSeed(Math.random().toString(36).substring(7))}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                    title="Cambiar avatar"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#3B6FF0]" />
                  </button>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1">
                    Usuario (@username) *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="ej: alex_vibe"
                      className="w-full bg-[#0A0E14] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#3B6FF0] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1">
                    Nombre para mostrar
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="ej: Alex Rivera"
                    className="w-full bg-[#0A0E14] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#3B6FF0] transition-colors"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1">
                {mode === 'signup' ? 'Correo Electrónico *' : 'Correo o Usuario (@username) *'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={mode === 'signup' ? 'email' : 'text'}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === 'signup' ? 'tu@email.com' : 'tu@email.com o @usuario'}
                  className="w-full bg-[#0A0E14] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#3B6FF0] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1">
                Contraseña *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-[#0A0E14] border border-white/10 rounded-lg pl-9 pr-9 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#3B6FF0] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1">
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    className="w-full bg-[#0A0E14] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#3B6FF0] transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#3B6FF0] hover:bg-[#2E5EFF] text-white font-semibold text-xs transition-all shadow-md shadow-[#3B6FF0]/20 flex items-center justify-center space-x-2 mt-2"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-white" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Crear Mi Cuenta' : 'Acceder a Mi Cuenta'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Account Switcher Section */}
          {existingAccounts.length > 0 && (
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span className="flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-[#3B6FF0]" />
                  <span>Cambio Rápido de Cuenta</span>
                </span>
                <span className="text-[10px] text-slate-500">{existingAccounts.length} registradas</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                {existingAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleQuickSwitch(acc.id)}
                    className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-[#0A0E14] border border-white/10 hover:border-[#3B6FF0]/40 text-left shrink-0 transition-all group"
                  >
                    <img 
                      src={acc.avatar_url} 
                      alt={acc.display_name} 
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-white/10 group-hover:ring-[#3B6FF0]"
                    />
                    <div className="text-left">
                      <span className="block text-[11px] font-medium text-slate-200 leading-none group-hover:text-white">
                        {acc.display_name}
                      </span>
                      <span className="block text-[9px] text-slate-400">@{acc.username}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

