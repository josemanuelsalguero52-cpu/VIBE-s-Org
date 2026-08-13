import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  PlusCircle, 
  MessageSquare, 
  User, 
  Compass, 
  Bell, 
  Database, 
  X, 
  Sparkles,
  Zap,
  Layers,
  Maximize2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { IslandId, UserProfile } from '../types';
import { FeedIsland } from './islands/FeedIsland';
import { CreatePostIsland } from './islands/CreatePostIsland';
import { ChatsIsland } from './islands/ChatsIsland';
import { ProfileIsland } from './islands/ProfileIsland';
import { DiscoverIsland } from './islands/DiscoverIsland';
import { NotificationsIsland } from './islands/NotificationsIsland';
import { SupabaseSetupIsland } from './islands/SupabaseSetupIsland';
import { AuthModal } from './AuthModal';
import { getActiveUser, isSupabaseConfigured } from '../lib/supabase';

interface IslandMeta {
  id: IslandId;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
  bgGlow: string;
  size: 'lg' | 'md' | 'sm';
  badge?: string;
  positionClass: string;
}

export const IslandsCanvas: React.FC = () => {
  const [activeIsland, setActiveIsland] = useState<IslandId | null>('feed');
  const [activeUser, setActiveUser] = useState<UserProfile>(getActiveUser());
  const [targetChatUser, setTargetChatUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleAuthChange = () => {
      setActiveUser(getActiveUser());
    };
    window.addEventListener('vibe_auth_changed' as any, handleAuthChange);
    return () => {
      window.removeEventListener('vibe_auth_changed' as any, handleAuthChange);
    };
  }, []);

  const handleStartChatWithUser = (user: UserProfile) => {
    setTargetChatUser(user);
    setActiveIsland('chats');
  };

  const islandsList: IslandMeta[] = [
    {
      id: 'feed',
      title: 'Feed Principal',
      subtitle: 'Posts cronológicos de 280 caracteres',
      icon: <Radio className="w-6 h-6 text-violet-400" />,
      accentColor: 'from-violet-600 to-indigo-600',
      bgGlow: 'shadow-violet-600/20 border-violet-500/30',
      size: 'lg',
      badge: 'En vivo',
      positionClass: 'md:col-span-2 md:row-span-2',
    },
    {
      id: 'create_post',
      title: 'Vibrar (Nuevo Post)',
      subtitle: 'Publica texto corto instantáneo',
      icon: <PlusCircle className="w-6 h-6 text-fuchsia-400" />,
      accentColor: 'from-fuchsia-600 to-pink-600',
      bgGlow: 'shadow-fuchsia-600/20 border-fuchsia-500/30',
      size: 'md',
      positionClass: 'md:col-span-1 md:row-span-1',
    },
    {
      id: 'chats',
      title: 'Chats 1 a 1',
      subtitle: 'Mensajería directa en tiempo real',
      icon: <MessageSquare className="w-6 h-6 text-cyan-400" />,
      accentColor: 'from-cyan-600 to-blue-600',
      bgGlow: 'shadow-cyan-600/20 border-cyan-500/30',
      size: 'lg',
      badge: 'Realtime',
      positionClass: 'md:col-span-1 md:row-span-2',
    },
    {
      id: 'profile',
      title: 'Mi Perfil',
      subtitle: `@${activeUser.username}`,
      icon: <User className="w-6 h-6 text-emerald-400" />,
      accentColor: 'from-emerald-600 to-teal-600',
      bgGlow: 'shadow-emerald-600/20 border-emerald-500/30',
      size: 'md',
      positionClass: 'md:col-span-1 md:row-span-1',
    },
    {
      id: 'discover',
      title: 'Explorar VIBERS',
      subtitle: 'Comunidad y personas',
      icon: <Compass className="w-6 h-6 text-amber-400" />,
      accentColor: 'from-amber-600 to-orange-600',
      bgGlow: 'shadow-amber-600/20 border-amber-500/30',
      size: 'md',
      positionClass: 'md:col-span-1 md:row-span-1',
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      subtitle: 'Actividad e interacciones',
      icon: <Bell className="w-6 h-6 text-rose-400" />,
      accentColor: 'from-rose-600 to-red-600',
      bgGlow: 'shadow-rose-600/20 border-rose-500/30',
      size: 'sm',
      badge: '3 nuevas',
      positionClass: 'md:col-span-1 md:row-span-1',
    },
    {
      id: 'supabase_config',
      title: 'Supabase Engine',
      subtitle: isSupabaseConfigured ? 'Conectado' : 'Modo Demo Activo',
      icon: <Database className="w-6 h-6 text-indigo-400" />,
      accentColor: 'from-indigo-600 to-purple-600',
      bgGlow: 'shadow-indigo-600/20 border-indigo-500/30',
      size: 'sm',
      badge: isSupabaseConfigured ? 'Online' : 'Demo SQL',
      positionClass: 'md:col-span-1 md:row-span-1',
    }
  ];

  const renderIslandContent = (id: IslandId) => {
    switch (id) {
      case 'feed':
        return (
          <FeedIsland 
            onOpenCreatePost={() => setActiveIsland('create_post')}
            onSelectUserForChat={handleStartChatWithUser}
          />
        );
      case 'create_post':
        return (
          <CreatePostIsland 
            onPostPublished={() => setActiveIsland('feed')}
          />
        );
      case 'chats':
        return <ChatsIsland initialTargetUser={targetChatUser} />;
      case 'profile':
        return <ProfileIsland onOpenAuth={() => setIsAuthOpen(true)} />;
      case 'discover':
        return <DiscoverIsland onStartChatWithUser={handleStartChatWithUser} />;
      case 'notifications':
        return <NotificationsIsland />;
      case 'supabase_config':
        return <SupabaseSetupIsland />;
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden selection:bg-violet-500 selection:text-white">
      {/* Dynamic Ambient Background Canvas */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
      </div>

      {/* Floating Top Brand & Profile Island Nodes (Non-fixed, floating headers) */}
      <div className="relative max-w-7xl mx-auto px-4 pt-6 pb-2 flex items-center justify-between z-20">
        {/* Brand Island Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setActiveIsland(null)}
          className="group cursor-pointer bg-slate-900/80 backdrop-blur-xl border border-violet-500/30 px-4 py-2.5 rounded-3xl shadow-xl shadow-violet-950/40 flex items-center space-x-3 hover:border-violet-500/60 transition-all"
        >
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-md shadow-violet-600/40">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-violet-300 via-fuchsia-200 to-white bg-clip-text text-transparent">
                VIBE
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-violet-500/20 text-violet-300 font-semibold border border-violet-500/30">
                ISLANDS
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Red Social por Islas Flotantes</p>
          </div>
        </motion.div>

        {/* User Account Island Badge */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setActiveIsland('profile')}
          className="group cursor-pointer bg-slate-900/80 backdrop-blur-xl border border-white/10 px-3.5 py-2 rounded-3xl shadow-xl flex items-center space-x-3 hover:border-emerald-500/40 transition-all"
        >
          <div className="relative">
            <img
              src={activeUser.avatar_url}
              alt={activeUser.display_name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/40"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-950" />
          </div>
          <div className="hidden sm:block text-left">
            <span className="block font-semibold text-xs text-slate-200 group-hover:text-emerald-300 transition-colors">
              {activeUser.display_name}
            </span>
            <span className="block text-[10px] text-slate-400">@{activeUser.username}</span>
          </div>
        </motion.div>
      </div>

      {/* Main Canvas Area */}
      <main className="relative max-w-7xl mx-auto px-4 py-6 z-10">
        {/* Floating Quick Dock for Switching Islands when one is expanded */}
        {activeIsland && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center justify-center flex-wrap gap-2 py-2 px-3 bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-3xl max-w-3xl mx-auto shadow-2xl"
          >
            {islandsList.map((item) => {
              const isActive = activeIsland === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveIsland(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${item.accentColor} text-white shadow-lg shadow-violet-600/30`
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                  }`}
                >
                  <span className="w-4 h-4">{item.icon}</span>
                  <span className="hidden sm:inline">{item.title}</span>
                </button>
              );
            })}

            <button
              onClick={() => setActiveIsland(null)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-rose-500/30 hover:text-rose-300 text-slate-400 transition-all ml-1"
              title="Vista Panorámica de Islas"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Spatial Grid of Independent Floating Islands (Overview mode or Overlay Expand) */}
        <AnimatePresence mode="wait">
          {!activeIsland ? (
            /* PANORAMIC FLOATING ISLANDS CANVAS OVERVIEW */
            <motion.div
              key="panoramic_overview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-2"
            >
              {islandsList.map((island, index) => (
                <motion.div
                  key={island.id}
                  layoutId={`island-card-${island.id}`}
                  initial={{ y: 0 }}
                  animate={{ y: [0, index % 2 === 0 ? -8 : -5, 0] }}
                  transition={{
                    duration: 4 + (index % 3),
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: index * 0.2
                  }}
                  whileHover={{ scale: 1.03, y: -12 }}
                  onClick={() => setActiveIsland(island.id)}
                  className={`group relative cursor-pointer bg-slate-900/80 backdrop-blur-xl border p-6 rounded-3xl shadow-xl transition-all ${island.bgGlow} ${island.positionClass} flex flex-col justify-between min-h-[200px] overflow-hidden`}
                >
                  {/* Subtle Background Glow Aura */}
                  <div className={`absolute -right-12 -bottom-12 w-36 h-36 bg-gradient-to-br ${island.accentColor} opacity-20 rounded-full blur-2xl group-hover:opacity-40 transition-opacity`} />

                  {/* Header */}
                  <div className="flex items-start justify-between relative z-10">
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                      {island.icon}
                    </div>

                    {island.badge && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-slate-200">
                        {island.badge}
                      </span>
                    )}
                  </div>

                  {/* Body Text */}
                  <div className="space-y-1 relative z-10 mt-6">
                    <h3 className="font-bold text-lg text-slate-100 group-hover:text-violet-300 transition-colors flex items-center justify-between">
                      <span>{island.title}</span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-violet-400" />
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {island.subtitle}
                    </p>
                  </div>

                  {/* Bottom Action Trigger */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-medium text-slate-400 group-hover:text-slate-200 relative z-10">
                    <span>Abrir Isla</span>
                    <Maximize2 className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* EXPANDED ISLAND FOCUSED WORLD VIEW */
            <motion.div
              key={`expanded_${activeIsland}`}
              layoutId={`island-card-${activeIsland}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full max-w-4xl mx-auto bg-slate-900/90 backdrop-blur-2xl border border-violet-500/30 rounded-3xl p-6 shadow-2xl shadow-violet-950/50 flex flex-col min-h-[580px] max-h-[80vh] overflow-hidden relative"
            >
              {/* Island Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-white/10 shadow-inner">
                    {islandsList.find(i => i.id === activeIsland)?.icon}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-white">
                      {islandsList.find(i => i.id === activeIsland)?.title}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {islandsList.find(i => i.id === activeIsland)?.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveIsland(null)}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all flex items-center space-x-1 text-xs"
                    title="Cerrar Isla"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Active Island Content Body */}
              <div className="flex-1 overflow-hidden">
                {renderIslandContent(activeIsland)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};
