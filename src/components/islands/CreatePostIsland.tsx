import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Sparkles, Hash, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiCreatePost, getActiveUser } from '../../lib/supabase';

interface CreatePostIslandProps {
  onPostPublished: () => void;
}

export const CreatePostIsland: React.FC<CreatePostIslandProps> = ({ onPostPublished }) => {
  const [content, setContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<boolean>(false);

  const activeUser = getActiveUser();
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
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* User Header inside Create Post */}
      <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
        <img
          src={activeUser.avatar_url}
          alt={activeUser.display_name}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/40"
        />
        <div>
          <h4 className="font-semibold text-sm text-slate-100">{activeUser.display_name}</h4>
          <p className="text-xs text-violet-400">@{activeUser.username}</p>
        </div>
      </div>

      {/* Post Text Area */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between space-y-4">
        <div className="relative flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="¿Qué estás pensando o creando? Comparte tu vibración aquí..."
            maxLength={maxChars}
            rows={5}
            className="w-full h-full min-h-[140px] bg-slate-950/70 border border-white/10 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all resize-none leading-relaxed"
          />
          {remaining < 30 && (
            <div className="absolute right-3 bottom-3 flex items-center space-x-1 text-xs text-amber-400 bg-slate-900/80 px-2 py-1 rounded-md border border-amber-500/30">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{remaining} restantes</span>
            </div>
          )}
        </div>

        {/* Tags Quick Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 flex items-center space-x-1 text-[11px]">
            <Hash className="w-3 h-3" />
            <span>Añadir:</span>
          </span>
          {['#VIBE', '#Islas', '#Minimal', '#React', '#Supabase'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleAddTag(tag)}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-violet-600/30 text-slate-300 hover:text-violet-200 border border-white/5 transition-all text-xs"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Publish Action & Character Counter Progress Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center space-x-3">
            {/* Visual Character Progress Circle */}
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg className="w-8 h-8 -rotate-90">
                <circle
                  cx="16"
                  cy="16"
                  r="12"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="12"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeDasharray={75.39}
                  strokeDashoffset={75.39 - (75.39 * progressPercent) / 100}
                  className={
                    remaining < 10
                      ? 'text-rose-500'
                      : remaining < 50
                      ? 'text-amber-400'
                      : 'text-violet-400'
                  }
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-slate-400">
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
            className={`px-5 py-2.5 rounded-full font-semibold text-xs flex items-center space-x-2 transition-all shadow-lg ${
              !content.trim() || content.length > maxChars || isSubmitting
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-600/30'
            }`}
          >
            {successMsg ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
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
