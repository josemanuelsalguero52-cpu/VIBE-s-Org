import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Lock, Sparkles, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { apiSignUp, apiSignIn } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [username, setUsername] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!username.trim() || !email.trim() || !password.trim()) {
          setErrorMsg('Por favor completa todos los campos mínimos.');
          setLoading(false);
          return;
        }

        const res = await apiSignUp(
          email, 
          password, 
          username, 
          displayName || username
        );

        if (res.error) {
          setErrorMsg(res.error);
        } else {
          onClose();
        }
      } else {
        if (!email.trim() || !password.trim()) {
          setErrorMsg('Por favor ingresa usuario/email y contraseña.');
          setLoading(false);
          return;
        }

        const res = await apiSignIn(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-slate-900 border border-violet-500/30 rounded-3xl p-6 shadow-2xl shadow-violet-950/50 space-y-5"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Red Social VIBE</span>
            </div>
            <h3 className="text-xl font-bold text-white pt-2">
              {mode === 'signup' ? 'Crear tu cuenta en VIBE' : 'Iniciar Sesión en VIBE'}
            </h3>
            <p className="text-xs text-slate-400">
              Formulario mínimo vía Supabase Auth. Sin pasos extra ni verificaciones complejas.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {errorMsg && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            {mode === 'signup' && (
              <>
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
                      className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
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
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1">
                Correo Electrónico *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
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
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-violet-600/30 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Procesando en Supabase...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Completar Registro' : 'Iniciar Sesión'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switcher */}
          <div className="text-center pt-2 border-t border-white/10">
            {mode === 'signup' ? (
              <p className="text-xs text-slate-400">
                ¿Ya tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-violet-400 hover:text-violet-300 font-semibold underline"
                >
                  Inicia sesión aquí
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                ¿No tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-violet-400 hover:text-violet-300 font-semibold underline"
                >
                  Regístrate en 5 segundos
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
