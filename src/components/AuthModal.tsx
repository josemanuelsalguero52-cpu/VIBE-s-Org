import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { apiSignUp, apiSignIn } from '../lib/supabase';
import vibeLogoBlue from '../assets/icons/vibe-logo-blue.svg';

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0E14]/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-md bg-[#121824] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[#3B6FF0]/15 border border-[#3B6FF0]/30 text-[#3B6FF0] text-xs font-semibold">
              <img src={vibeLogoBlue} alt="VIBE Logo" className="w-3.5 h-3.5 object-contain" />
              <span>Red Social VIBE</span>
            </div>
            <h3 className="font-display text-xl font-bold text-white pt-2">
              {mode === 'signup' ? 'Crear tu cuenta en VIBE' : 'Iniciar Sesión en VIBE'}
            </h3>
            <p className="text-xs text-slate-400">
              Formulario mínimo vía Supabase Auth. Sin pasos extra ni verificaciones complejas.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {errorMsg && (
              <div className="p-3 bg-[#0A0E14] border border-white/15 text-slate-200 text-xs rounded-lg">
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
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0A0E14] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#3B6FF0] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#3B6FF0] hover:bg-[#2E5EFF] text-white font-semibold text-xs transition-all shadow-md shadow-[#3B6FF0]/20 flex items-center justify-center space-x-2"
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
                  className="text-[#3B6FF0] hover:text-[#2E5EFF] font-semibold underline"
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
                  className="text-[#3B6FF0] hover:text-[#2E5EFF] font-semibold underline"
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
