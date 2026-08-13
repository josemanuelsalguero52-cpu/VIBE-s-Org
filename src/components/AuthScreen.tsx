import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
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
  Database,
  Radio,
  Camera
} from 'lucide-react';
import { apiSignUp, apiSignIn, isSupabaseConfigured, supabaseUrl } from '../lib/supabase';
import { UserProfile } from '../types';
import vibeLogoWhite from '../assets/icons/vibe-logo-white.svg';

interface AuthScreenProps {
  onSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [username, setUsername] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [avatarSeed, setAvatarSeed] = useState<string>(Math.random().toString(36).substring(7));
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const currentAvatarUrl = customAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username.trim() || avatarSeed}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'signup') {
      if (!username.trim() || !email.trim() || !password.trim()) {
        setErrorMsg('Por favor completa todos los campos obligatorios (*).');
        return;
      }

      if (password.length < 6) {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMsg('Las contraseñas no coinciden. Revisa los datos.');
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
          setSuccessMsg(`¡Registro exitoso! Bienvenido a VIBE, ${res.user.display_name}.`);
          setTimeout(() => {
            onSuccess(res.user);
          }, 800);
        }
      } catch (err: any) {
        setErrorMsg(err?.message || 'Error al completar el registro.');
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
          setSuccessMsg(`¡Sesión iniciada! Hola de nuevo, ${res.user.display_name}.`);
          setTimeout(() => {
            onSuccess(res.user);
          }, 600);
        }
      } catch (err: any) {
        setErrorMsg(err?.message || 'Error al iniciar sesión.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCustomAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0A0E14] text-slate-100 font-sans flex flex-col justify-center items-center p-4 overflow-x-hidden selection:bg-[#3B6FF0] selection:text-white">
      {/* Ambient background glow & radial pattern */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,111,240,0.22),rgba(255,255,255,0))]" />
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Floating Island Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative w-full max-w-md z-10 my-auto"
      >
        {/* Main Card */}
        <div className="bg-[#121824]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-[#3B6FF0]/10 space-y-6">
          
          {/* Top Brand Header */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#3B6FF0] flex items-center justify-center shadow-lg shadow-[#3B6FF0]/30 ring-4 ring-[#3B6FF0]/20 mb-1">
              <img src={vibeLogoWhite} alt="VIBE Logo" className="w-6 h-6 object-contain" />
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#3B6FF0]/15 border border-[#3B6FF0]/30 text-[#3B6FF0] text-[11px] font-semibold tracking-wide">
              <Radio className="w-3 h-3 text-[#3B6FF0] animate-pulse" />
              <span>Autenticación Obligatoria</span>
            </div>

            <h1 className="font-display font-extrabold text-2xl text-white tracking-tight">
              {mode === 'login' ? 'Iniciar Sesión en VIBE' : 'Crear Cuenta en VIBE'}
            </h1>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              {mode === 'login'
                ? 'Ingresa tus credenciales para acceder al ecosistema de Islas'
                : 'Regístrate con tu email para crear tu perfil e interactuar en tiempo real'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#0A0E14] border border-white/10 rounded-2xl text-xs font-semibold relative">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all relative z-10 ${
                mode === 'login'
                  ? 'bg-[#3B6FF0] text-white shadow-lg shadow-[#3B6FF0]/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all relative z-10 ${
                mode === 'signup'
                  ? 'bg-[#3B6FF0] text-white shadow-lg shadow-[#3B6FF0]/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Registrarse</span>
            </button>
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-start space-x-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Banner */}
          <AnimatePresence>
            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center space-x-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                {/* Avatar Preview Customizer */}
                <div className="flex items-center space-x-3 p-3 bg-[#0A0E14] border border-white/10 rounded-2xl">
                  <div className="relative shrink-0">
                    <img 
                      src={currentAvatarUrl} 
                      alt="Avatar Preview" 
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#3B6FF0] bg-[#121824]"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Avatar de Perfil</span>
                    <span className="block text-xs text-slate-200 truncate">
                      {customAvatar ? 'Imagen personalizada' : 'Generado automáticamente'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <label 
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer transition-colors"
                      title="Subir foto de perfil"
                    >
                      <Camera className="w-4 h-4 text-[#3B6FF0]" />
                      <input type="file" accept="image/*" onChange={handleAvatarFileUpload} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomAvatar(null);
                        setAvatarSeed(Math.random().toString(36).substring(7));
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                      title="Cambiar avatar generado"
                    >
                      <RefreshCw className="w-4 h-4 text-[#3B6FF0]" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1.5">
                    Usuario (@username) *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="ej: usuario_vibe"
                      className="w-full bg-[#0A0E14] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#3B6FF0] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1.5">
                    Nombre Visible
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="ej: Alex Rivera"
                    className="w-full bg-[#0A0E14] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#3B6FF0] transition-colors"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1.5">
                {mode === 'signup' ? 'Correo Electrónico *' : 'Correo Electrónico o @Usuario *'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={mode === 'signup' ? 'email' : 'text'}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === 'signup' ? 'tu@email.com' : 'tu@email.com o @usuario'}
                  className="w-full bg-[#0A0E14] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#3B6FF0] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1.5">
                Contraseña *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-[#0A0E14] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#3B6FF0] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1.5">
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    className="w-full bg-[#0A0E14] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#3B6FF0] transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#3B6FF0] hover:bg-[#2E5EFF] text-white font-semibold text-xs transition-all shadow-lg shadow-[#3B6FF0]/25 flex items-center justify-center space-x-2 mt-3 hover:scale-[1.01]"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-white" />
                  <span>Procesando solicitud...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Crear Mi Cuenta Supabase' : 'Ingresar a VIBE'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Badge */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-[#3B6FF0]" />
              <span>{isSupabaseConfigured ? 'Supabase Conectado' : 'Supabase Sync Engine'}</span>
            </span>

            {isSupabaseConfigured && (
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Live Backend
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
