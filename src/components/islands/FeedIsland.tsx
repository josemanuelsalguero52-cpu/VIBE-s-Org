import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Sparkles, 
  Search, 
  RefreshCw, 
  Send,
  User,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Post, UserProfile } from '../../types';
import { apiGetPosts, apiToggleLikePost, getActiveUser, subscribeToLocalChannel } from '../../lib/supabase';
import { CommentsSection } from '../CommentsSection';

interface FeedIslandProps {
  onOpenCreatePost: () => void;
  onSelectUserForChat: (user: UserProfile) => void;
}

export const FeedIsland: React.FC<FeedIslandProps> = ({ 
  onOpenCreatePost,
  onSelectUserForChat
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'popular'>('all');
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);

  const currentUser = getActiveUser();

  const loadPosts = async () => {
    setLoading(true);
    try {
      const fetched = await apiGetPosts();
      setPosts(fetched);
    } catch (err) {
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();

    const handleNewPost = () => {
      loadPosts();
    };

    window.addEventListener('vibe_post_created' as any, handleNewPost);

    // Subscribe to local Realtime post updates
    const unsubPostUpdates = subscribeToLocalChannel('new_post', () => {
      loadPosts();
    });

    return () => {
      window.removeEventListener('vibe_post_created' as any, handleNewPost);
      unsubPostUpdates();
    };
  }, []);

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await apiToggleLikePost(postId);
      setPosts(prev => prev.map(p => p.id === postId ? updated : p));
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleCopyLink = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    setCopiedPostId(postId);
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  const toggleComments = (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedCommentsPostId(prev => prev === postId ? null : postId);
  };

  const renderContentWithMentions = (text: string) => {
    const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <span 
            key={i} 
            className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md bg-violet-500/20 text-violet-300 font-semibold text-xs border border-violet-500/30"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const filteredPosts = posts
    .filter(p => {
      if (!filterQuery) return true;
      const q = filterQuery.toLowerCase();
      return p.content.toLowerCase().includes(q) || 
             p.author.display_name.toLowerCase().includes(q) || 
             p.author.username.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (activeTab === 'popular') {
        return (b.likes_count || 0) - (a.likes_count || 0);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const formatTimeAgo = (isoDate: string) => {
    const diff = Date.now() - new Date(isoDate).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return 'ahora mismo';
    if (minutes < 60) return `hace ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `hace ${days}d`;
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Header Controls inside the Island */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'all' 
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30' 
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Cronológico
          </button>
          <button 
            onClick={() => setActiveTab('popular')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'popular' 
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30' 
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Más Vistas
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar posts..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full bg-slate-950/60 border border-white/10 rounded-full pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <button
            onClick={loadPosts}
            title="Actualizar feed"
            className="p-2 rounded-full bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Floating Create Quick Trigger Banner */}
      <div 
        onClick={onOpenCreatePost}
        className="group relative cursor-pointer bg-gradient-to-r from-violet-950/40 via-purple-900/20 to-slate-900/60 p-3.5 rounded-2xl border border-violet-500/20 hover:border-violet-500/40 transition-all shadow-lg flex items-center space-x-3"
      >
        <img
          src={currentUser.avatar_url}
          alt={currentUser.display_name}
          className="w-9 h-9 rounded-full object-cover ring-2 ring-violet-500/30"
        />
        <span className="text-slate-400 text-sm flex-1 group-hover:text-slate-200 transition-colors">
          ¿Qué estás vibrando hoy? (Máx 280 caracteres)...
        </span>
        <button className="px-3 py-1.5 bg-violet-600 group-hover:bg-violet-500 text-white text-xs font-semibold rounded-full flex items-center space-x-1 shadow-md shadow-violet-600/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Vibrar</span>
        </button>
      </div>

      {/* Posts Feed Stream */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 custom-scrollbar min-h-[300px]">
        {loading && posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-3 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-violet-400" />
            <p className="text-xs">Cargando publicaciones de la red VIBE...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-2 text-center text-slate-400 p-6 rounded-2xl border border-dashed border-white/10 bg-white/5">
            <Sparkles className="w-8 h-8 text-violet-400 opacity-60" />
            <p className="text-sm font-medium text-slate-200">No hay publicaciones encontradas</p>
            <p className="text-xs text-slate-400">¡Sé el primero en compartir tu vibración en este feed!</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-violet-500/30 transition-all space-y-3 group shadow-sm hover:shadow-md"
              >
                {/* Author Info header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={post.author.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.author.username}`}
                      alt={post.author.display_name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/20"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold text-sm text-slate-100 group-hover:text-violet-300 transition-colors">
                          {post.author.display_name}
                        </span>
                        <span className="text-xs text-slate-400">
                          @{post.author.username}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatTimeAgo(post.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {post.author.id !== currentUser.id && (
                    <button
                      onClick={() => onSelectUserForChat(post.author)}
                      title={`Iniciar chat privado con @${post.author.username}`}
                      className="p-2 rounded-full bg-violet-950/40 border border-violet-500/30 text-violet-300 hover:bg-violet-600 hover:text-white transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Post Content */}
                <p className="text-sm text-slate-200 leading-relaxed break-words whitespace-pre-wrap pl-1">
                  {renderContentWithMentions(post.content)}
                </p>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={(e) => handleLike(post.id, e)}
                      title="Dar me gusta a la publicación"
                      className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full transition-all ${
                        post.is_liked
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold'
                          : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          post.is_liked ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                      <span>{post.likes_count || 0}</span>
                    </button>

                    <button
                      onClick={(e) => toggleComments(post.id, e)}
                      title="Ver y añadir comentarios"
                      className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full transition-all ${
                        expandedCommentsPostId === post.id
                          ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40 font-semibold'
                          : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4 text-violet-400" />
                      <span>{post.comments_count || 0} Comentarios</span>
                      {expandedCommentsPostId === post.id ? (
                        <ChevronUp className="w-3 h-3 text-violet-300" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      )}
                    </button>

                    <button
                      onClick={() => onSelectUserForChat(post.author)}
                      className="hidden sm:flex items-center space-x-1.5 px-2 py-1 rounded-full hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-all"
                    >
                      <Send className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Chat</span>
                    </button>
                  </div>

                  <button
                    onClick={(e) => handleCopyLink(post.id, e)}
                    className="flex items-center space-x-1 text-slate-400 hover:text-violet-300 transition-colors px-2 py-1"
                  >
                    {copiedPostId === post.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Compartir</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Collapsible Nested Comments Section */}
                <AnimatePresence>
                  {expandedCommentsPostId === post.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <CommentsSection 
                        postId={post.id} 
                        onCommentsCountChange={(newCount) => {
                          setPosts(prev => prev.map(p => p.id === post.id ? { ...p, comments_count: newCount } : p));
                        }}
                        onSelectUserForChat={onSelectUserForChat}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
