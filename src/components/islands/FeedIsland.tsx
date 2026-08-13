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
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Hash,
  Users,
  User,
  X,
  Filter
} from 'lucide-react';
import { Post, UserProfile } from '../../types';
import { apiGetPosts, apiCreatePost, apiToggleLikePost, apiGetUsers, getActiveUser, subscribeToLocalChannel } from '../../lib/supabase';
import { CommentsSection } from '../CommentsSection';

interface FeedIslandProps {
  onOpenCreatePost?: () => void;
  onSelectUserForChat: (user: UserProfile) => void;
}

export const FeedIsland: React.FC<FeedIslandProps> = ({ 
  onOpenCreatePost,
  onSelectUserForChat
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [profileSearchQuery, setProfileSearchQuery] = useState<string>('');
  const [selectedFilterUser, setSelectedFilterUser] = useState<UserProfile | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);

  // Inline post creation state (Twitter/X style)
  const [newPostContent, setNewPostContent] = useState<string>('');
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [postSuccess, setPostSuccess] = useState<boolean>(false);

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

  const loadUsers = async () => {
    try {
      const users = await apiGetUsers();
      setAllUsers(users);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  useEffect(() => {
    loadPosts();
    loadUsers();

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

  const handleInlineCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || newPostContent.length > 280 || isPosting) return;

    setIsPosting(true);
    try {
      await apiCreatePost(newPostContent.trim());
      setNewPostContent('');
      setPostSuccess(true);
      setTimeout(() => setPostSuccess(false), 2000);
      await loadPosts();
      window.dispatchEvent(new CustomEvent('vibe_post_created'));
    } catch (err) {
      console.error('Error al crear publicación inline:', err);
    } finally {
      setIsPosting(false);
    }
  };

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
            className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded bg-[#3B6FF0]/15 text-[#3B6FF0] font-semibold text-xs border border-[#3B6FF0]/30"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const searchedUsers = profileSearchQuery.trim()
    ? allUsers.filter(u => {
        const q = profileSearchQuery.toLowerCase().trim();
        return u.username.toLowerCase().includes(q) ||
               u.display_name.toLowerCase().includes(q) ||
               (u.bio && u.bio.toLowerCase().includes(q));
      })
    : [];

  const filteredPosts = posts
    .filter(p => {
      if (selectedFilterUser) {
        return p.author?.id === selectedFilterUser.id || p.author_id === selectedFilterUser.id;
      }
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
      {/* Profile Search Header */}
      <div className="relative pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          {/* Profile Search Input */}
          <div className="relative flex-1">
            <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#3B6FF0]" />
            <input
              type="text"
              placeholder="Buscar perfiles (@usuario o nombre)..."
              value={profileSearchQuery}
              onChange={(e) => setProfileSearchQuery(e.target.value)}
              className="w-full bg-[#0A0E14] border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3B6FF0] transition-colors"
            />
            {profileSearchQuery && (
              <button
                onClick={() => setProfileSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Active Filter Indicator Tag */}
          {selectedFilterUser && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#3B6FF0]/20 border border-[#3B6FF0]/40 rounded-xl text-xs text-white shrink-0">
              <span className="text-[10px] text-slate-300 hidden sm:inline">Posts de:</span>
              <strong className="font-semibold text-white">@{selectedFilterUser.username}</strong>
              <button
                onClick={() => setSelectedFilterUser(null)}
                title="Quitar filtro de usuario"
                className="p-0.5 hover:bg-white/20 rounded-full transition-colors ml-1"
              >
                <X className="w-3 h-3 text-slate-300 hover:text-white" />
              </button>
            </div>
          )}

          {/* Reload Feed Button */}
          <button
            onClick={() => { loadPosts(); loadUsers(); }}
            title="Actualizar feed"
            className="p-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all border border-white/10 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search Results Dropdown Panel */}
        <AnimatePresence>
          {profileSearchQuery.trim() && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-[#0A0E14] border border-white/15 rounded-2xl shadow-2xl p-2.5 space-y-2 max-h-72 overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                <span>Perfiles Encontrados ({searchedUsers.length})</span>
                <span className="text-slate-500">Comunidad VIBE</span>
              </div>

              {searchedUsers.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No se encontraron usuarios coincidentes con "{profileSearchQuery}"
                </div>
              ) : (
                searchedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-2.5 rounded-xl bg-[#121824] hover:bg-white/10 transition-all border border-white/5 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      <img
                        src={user.avatar_url}
                        alt={user.display_name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h5 className="font-semibold text-xs text-slate-100 truncate">{user.display_name}</h5>
                        <p className="text-[10px] text-slate-400 truncate">@{user.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedFilterUser(user);
                          setProfileSearchQuery('');
                        }}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-white/10 transition-all flex items-center space-x-1"
                        title={`Ver publicaciones de @${user.username}`}
                      >
                        <Filter className="w-3 h-3 text-[#3B6FF0]" />
                        <span className="hidden sm:inline">Ver Posts</span>
                      </button>

                      <button
                        onClick={() => {
                          onSelectUserForChat(user);
                          setProfileSearchQuery('');
                        }}
                        className="px-2.5 py-1 bg-[#3B6FF0] hover:bg-[#2E5EFF] text-white rounded-lg text-xs font-medium transition-all shadow-sm flex items-center space-x-1"
                        title={`Abrir chat directo con @${user.username}`}
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Inline Post Creator (Twitter/X style) */}
      <form 
        onSubmit={handleInlineCreatePost}
        className="bg-[#0A0E14] p-3.5 rounded-xl border border-white/10 hover:border-[#3B6FF0]/40 transition-all shadow-md space-y-3"
      >
        <div className="flex items-start space-x-3">
          <img
            src={currentUser.avatar_url}
            alt={currentUser.display_name}
            className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10 shrink-0 mt-0.5"
          />
          <div className="flex-1 space-y-2">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="¿Qué está pasando? ¡Publica tu VIBE aquí..."
              maxLength={280}
              rows={newPostContent.length > 50 ? 3 : 2}
              className="w-full bg-transparent border-none text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed custom-scrollbar p-0"
            />

            {/* Quick Hashtag pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pt-1 pb-0.5 text-[11px] custom-scrollbar">
              <span className="text-slate-500 flex items-center space-x-0.5 text-[10px] font-medium uppercase tracking-wider shrink-0">
                <Hash className="w-3 h-3 text-slate-500" />
                <span>Etiquetas:</span>
              </span>
              {['#VIBE', '#Islas', '#Minimal', '#React'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    if (newPostContent.length + tag.length + 1 <= 280) {
                      setNewPostContent(prev => prev ? `${prev} ${tag}` : tag);
                    }
                  }}
                  className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-all text-[11px] shrink-0"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with char count & publish button */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
          <div className="flex items-center space-x-2">
            <span className={`text-[11px] font-medium ${
              280 - newPostContent.length < 20 
                ? 'text-slate-200 font-bold' 
                : 'text-slate-400'
            }`}>
              {280 - newPostContent.length} caracteres disponibles
            </span>
          </div>

          <button
            type="submit"
            disabled={!newPostContent.trim() || newPostContent.length > 280 || isPosting}
            className={`px-4 py-1.5 bg-[#3B6FF0] hover:bg-[#2E5EFF] text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-md shadow-[#3B6FF0]/20 transition-all ${
              !newPostContent.trim() || newPostContent.length > 280 || isPosting
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-[1.02]'
            }`}
          >
            {postSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>¡Publicado!</span>
              </>
            ) : isPosting ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Publicando...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Publicar VIBE</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Posts Feed Stream */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 custom-scrollbar min-h-[300px]">
        {loading && posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-3 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin text-[#3B6FF0]" />
            <p className="text-xs">Cargando publicaciones...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-2 text-center text-slate-400 p-6 rounded-xl border border-dashed border-white/10 bg-white/5">
            <Sparkles className="w-7 h-7 text-slate-500" />
            <p className="text-sm font-medium text-slate-200">No hay publicaciones encontradas</p>
            <p className="text-xs text-slate-400">¡Sé el primero en compartir tu publicación en este feed!</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 rounded-xl bg-[#0A0E14] border border-white/10 hover:border-[#3B6FF0]/30 transition-all space-y-3 group shadow-sm"
              >
                {/* Author Info Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={post.author.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.author.username}`}
                      alt={post.author.display_name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold text-xs text-slate-100 group-hover:text-white transition-colors">
                          {post.author.display_name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          @{post.author.username}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{formatTimeAgo(post.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {post.author && post.author.id !== currentUser?.id && (
                    <button
                      onClick={() => onSelectUserForChat(post.author)}
                      title={`Iniciar chat privado con @${post.author.username}`}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-[#3B6FF0] text-slate-300 hover:text-white border border-white/10 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Post Content */}
                <p className="text-xs text-slate-200 leading-relaxed break-words whitespace-pre-wrap pl-0.5">
                  {renderContentWithMentions(post.content)}
                </p>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleLike(post.id, e)}
                      title="Dar me gusta"
                      className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-all ${
                        post.is_liked
                          ? 'bg-[#3B6FF0]/15 text-[#3B6FF0] border border-[#3B6FF0]/30 font-semibold'
                          : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          post.is_liked ? 'fill-[#3B6FF0] text-[#3B6FF0]' : ''
                        }`}
                      />
                      <span className="text-[11px]">{post.likes_count || 0}</span>
                    </button>

                    <button
                      onClick={(e) => toggleComments(post.id, e)}
                      title="Ver y añadir comentarios"
                      className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-all ${
                        expandedCommentsPostId === post.id
                          ? 'bg-[#3B6FF0]/20 text-[#3B6FF0] border border-[#3B6FF0]/30 font-semibold'
                          : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="text-[11px]">{post.comments_count || 0} Comentarios</span>
                      {expandedCommentsPostId === post.id ? (
                        <ChevronUp className="w-3 h-3 text-[#3B6FF0]" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-slate-500" />
                      )}
                    </button>

                    <button
                      onClick={() => onSelectUserForChat(post.author)}
                      className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-all text-[11px]"
                    >
                      <Send className="w-3 h-3 text-slate-400" />
                      <span>Chat</span>
                    </button>
                  </div>

                  <button
                    onClick={(e) => handleCopyLink(post.id, e)}
                    className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors px-2 py-1 text-[11px]"
                  >
                    {copiedPostId === post.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3B6FF0]" />
                        <span className="text-[#3B6FF0] font-medium">¡Copiado!</span>
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
                      transition={{ duration: 0.2 }}
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
