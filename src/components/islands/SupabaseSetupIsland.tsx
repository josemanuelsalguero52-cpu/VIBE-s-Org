import React, { useState } from 'react';
import { Database, CheckCircle2, Copy, Code, Sparkles, Terminal } from 'lucide-react';
import { 
  isSupabaseConfigured, 
  supabaseUrl, 
  saveCustomSupabaseConfig, 
  clearCustomSupabaseConfig, 
  getSupabaseSQLScript 
} from '../../lib/supabase';

export const SupabaseSetupIsland: React.FC = () => {
  const [urlInput, setUrlInput] = useState<string>(supabaseUrl || '');
  const [keyInput, setKeyInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [showSql, setShowSql] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput && keyInput) {
      saveCustomSupabaseConfig(urlInput, keyInput);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(getSupabaseSQLScript());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Connection Status Badge */}
      <div className={`p-4 rounded-xl border flex items-center justify-between ${
        isSupabaseConfigured 
          ? 'bg-[#121824] border-[#3B6FF0]/40 text-slate-200' 
          : 'bg-[#0A0E14] border-white/10 text-slate-200'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-[#3B6FF0]/20">
            <Database className="w-5 h-5 text-[#3B6FF0]" />
          </div>
          <div>
            <h4 className="font-semibold text-xs text-white">
              {isSupabaseConfigured ? 'Supabase Conectado' : 'Modo Demo VIBE (Simulación Supabase Realtime)'}
            </h4>
            <p className="text-[11px] opacity-80 mt-0.5">
              {isSupabaseConfigured 
                ? `Proyecto activo: ${supabaseUrl.slice(0, 30)}...` 
                : 'Todas las funciones (Posts, Chats 1a1, Auth, Perfiles) están 100% operativas en previsualización.'}
            </p>
          </div>
        </div>

        {isSupabaseConfigured && (
          <button
            onClick={clearCustomSupabaseConfig}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-lg text-[11px] transition-all"
          >
            Desconectar
          </button>
        )}
      </div>

      {/* SQL Script Generator */}
      <div className="bg-[#0A0E14] border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-[#3B6FF0]" />
            <h5 className="font-semibold text-xs text-slate-100">Esquema SQL de la Base de Datos</h5>
          </div>

          <button
            onClick={handleCopySql}
            className="px-3 py-1.5 rounded-lg bg-[#3B6FF0] hover:bg-[#2E5EFF] text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>¡Código SQL Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar SQL para Supabase</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Para conectar tu propio proyecto en Vercel o Supabase Cloud, copia este script SQL y ejecútalo en el <strong>Editor SQL</strong> de tu panel de Supabase. Crea las tablas de <code>profiles</code>, <code>posts</code>, <code>messages</code> y activa RLS y Realtime.
        </p>

        <button
          onClick={() => setShowSql(!showSql)}
          className="text-xs text-[#3B6FF0] hover:text-[#2E5EFF] flex items-center space-x-1 underline"
        >
          <Code className="w-3.5 h-3.5" />
          <span>{showSql ? 'Ocultar vista previa SQL' : 'Ver vista previa del código SQL'}</span>
        </button>

        {showSql && (
          <pre className="p-3 bg-[#121824] rounded-lg border border-white/10 text-[11px] text-slate-300 overflow-x-auto max-h-48 custom-scrollbar font-mono leading-relaxed">
            {getSupabaseSQLScript()}
          </pre>
        )}
      </div>

      {/* Manual Connection Form */}
      <form onSubmit={handleSave} className="bg-[#0A0E14] border border-white/10 rounded-xl p-4 space-y-3">
        <h5 className="font-semibold text-xs text-slate-100 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#3B6FF0]" />
          <span>Configurar Credenciales Personalizadas de Supabase</span>
        </h5>

        <div className="space-y-2">
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              SUPABASE URL
            </label>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full bg-[#121824] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#3B6FF0]"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              SUPABASE ANON KEY
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-[#121824] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#3B6FF0]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!urlInput || !keyInput}
          className={`w-full py-2 rounded-lg text-xs font-semibold transition-all shadow-sm ${
            urlInput && keyInput
              ? 'bg-[#3B6FF0] hover:bg-[#2E5EFF] text-white shadow-[#3B6FF0]/20'
              : 'bg-white/5 text-slate-600 cursor-not-allowed'
          }`}
        >
          Guardar y Conectar Supabase
        </button>
      </form>
    </div>
  );
};
