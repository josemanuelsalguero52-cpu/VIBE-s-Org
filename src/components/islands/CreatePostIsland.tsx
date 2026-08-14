import React, { useState } from 'react';
import { Send, Sparkles, Hash, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiCreatePost, getActiveUser } from '../../lib/supabase';

interface CreatePostIslandProps {
  onPostPublished: () => void;
}

export const CreatePostIsland: React.FC<CreatePostIslandProps> = ({ onPostPublished }) => {
  const [content, setContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeUser = getActiveUser();

  if (!activeUser) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 bg-[#0A0E14] rounded-xl border border-white/10">
        Debes iniciar sesión para crear una publicación.
      </div>
    );
  }

  const maxChars = 280;
  const remaining = maxChars - content.length;
  const progressPercent = Math.min(100, (content.length / maxChars) * 100);

  const handleAddTag = (tag: string) => {
    if (content.length + tag.length + 1 <= maxChars) {
      setContent(prev => (prev ? `${prev} ${tag}` : tag));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.length > maxChars || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await apiCreatePost(content);
      setContent('');
      setSuccessMsg(true);
      
      // Dispatch custom event to notify feed island
      window.dispatchEvent(new CustomEvent('vibe_post_created'));

      setTimeout(() => {
        setSuccessMsg(false);
        onPostPublished();
      }, 800);
    } catch (err: any) {
      console.error('Failed to create post:', err);
      setErrorMsg(err.message || 'Error al publicar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Error Message */}
      {errorMsg && (
        <div className="p-2 text-xs text-rose-300 bg-rose-500/10 rounded-lg border border-rose-500/20 mb-2">
          {errorMsg}
        </div>
      )}

      {/* User Header */}
      <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
        <img
          src={activeUser.avatar_url}
          alt={activeUser.display_name}
          className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10"
        />
        <div>
          <h4 className="font-semibold text-xs text-slate-100">{activeUser.display_name}</h4>
          <p className="text-[11px] text-slate-400">@{activeUser.username}</p>
        </div>
      </div>

      {/* Post Text Area */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between space-y-4">
        <div className="relative flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="¿Qué estás pensando o creando? Comparte tu publicación aquí..."
            maxLength={maxChars}
            rows={5}
            className="w-full h-full min-h-[140px] bg-[#0A0E14] border border-white/10 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#3B6FF0] transition-all resize-none leading-relaxed"
          />
          {remaining < 30 && (
            <div className="absolute right-3 bottom-3 flex items-center space-x-1 text-xs text-slate-300 bg-[#121824] px-2 py-1 rounded-md border border-white/10">
              <AlertCircle className="w-3.5 h-3.5 text-[#3B6FF0]" />
              <span>{remaining} restantes</span>
            </div>
          )}
        </div>

        {/* Tags Quick Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 flex items-center space-x-1 text-[11px]">
            <Hash className="w-3 h-3 text-slate-400" />
            <span>Añadir:</span>
          </span>
          {['#VIBE', '#Islas', '#Minimal', '#React', '#Supabase'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleAddTag(tag)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-all text-xs"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Publish Action & Character Counter */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center space-x-3">
            {/* Visual Character Progress Circle */}
            <div className="relative w-7 h-7 flex items-center justify-center">
              <svg className="w-7 h-7 -rotate-90">
                <circle
                  cx="14"
                  cy="14"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="14"
                  cy="14"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={62.83}
                  strokeDashoffset={62.83 - (62.83 * progressPercent) / 100}
                  className="text-[#3B6FF0]"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-[9px] font-bold text-slate-400">
                {content.length}
              </span>
            </div>

            <span className="text-xs text-slate-400">
              Límite: <strong className="text-slate-200">280</strong> caracteres
            </span>
          </div>

          <button
            type="submit"
            disabled={!content.trim() || content.length > maxChars || isSubmitting}
            className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center space-x-2 transition-all shadow-md ${
              !content.trim() || content.length > maxChars || isSubmitting
                ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                : 'bg-[#3B6FF0] hover:bg-[#2E5EFF] text-white shadow-[#3B6FF0]/20'
            }`}
          >
            {successMsg ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>¡Publicado!</span>
              </>
            ) : isSubmitting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-white" />
                <span>Publicando...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Publicar VIBE</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
