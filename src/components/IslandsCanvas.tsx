import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  MessageSquare, 
  User, 
  X, 
  Maximize2,
  ChevronRight
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
import { getActiveUser } from '../lib/supabase';
import vibeLogoWhite from '../assets/icons/vibe-logo-white.svg';

interface IslandMeta {
  id: IslandId;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
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
      subtitle: 'Posts cronológicos y publicación estilo X',
      icon: <Radio className="w-5 h-5 text-[#3B6FF0]" />,
      badge: 'En vivo',
      positionClass: 'md:col-span-2 md:row-span-2',
    },
    {
      id: 'chats',
      title: 'Chats 1 a 1',
      subtitle: 'Mensajería directa en tiempo real',
      icon: <MessageSquare className="w-5 h-5 text-[#3B6FF0]" />,
      badge: 'Realtime',
      positionClass: 'md:col-span-1 md:row-span-2',
    },
    {
      id: 'profile',
      title: 'Mi Perfil',
      subtitle: `@${activeUser.username}`,
      icon: <User className="w-5 h-5 text-slate-300" />,
      positionClass: 'md:col-span-3 lg:col-span-3',
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
    <div className="relative min-h-screen bg-[#0A0E14] text-slate-100 font-sans overflow-x-hidden flex flex-col justify-between">
      {/* Subtle background grid pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* Top Header Bar - Optimized for all screen widths */}
      <header className="relative max-w-7xl w-full mx-auto px-3 sm:px-4 pt-3 sm:pt-6 pb-2 flex items-center justify-between z-20 shrink-0">
        {/* Brand Badge */}
        <div 
          onClick={() => setActiveIsland(null)}
          className="group cursor-pointer bg-[#121824] border border-white/10 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-lg flex items-center space-x-2.5 sm:space-x-3 hover:border-[#3B6FF0]/40 transition-all"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#3B6FF0] flex items-center justify-center shadow-md shadow-[#3B6FF0]/20 shrink-0">
            <img src={vibeLogoWhite} alt="VIBE Logo" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="font-display font-extrabold text-sm sm:text-base tracking-wide text-white">
                VIBE
              </span>
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-md bg-[#3B6FF0]/15 text-[#3B6FF0] font-semibold border border-[#3B6FF0]/25">
                MOBILE
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 hidden xs:block">Red Social Adaptativa</p>
          </div>
        </div>

        {/* User Account Badge */}
        <div 
          onClick={() => setActiveIsland('profile')}
          className="group cursor-pointer bg-[#121824] border border-white/10 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl shadow-lg flex items-center space-x-2 sm:space-x-3 hover:border-[#3B6FF0]/40 transition-all"
        >
          <div className="relative shrink-0">
            <img
              src={activeUser.avatar_url}
              alt={activeUser.display_name}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-[#3B6FF0]/50 transition-all"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#3B6FF0] rounded-full ring-2 ring-[#0A0E14]" />
          </div>
          <div className="hidden sm:block text-left">
            <span className="block font-medium text-xs text-slate-200 group-hover:text-white transition-colors">
              {activeUser.display_name}
            </span>
            <span className="block text-[10px] text-slate-400">@{activeUser.username}</span>
          </div>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="relative max-w-7xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-6 z-10 flex-1 pb-6 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!activeIsland ? (
            /* PANORAMIC FLOATING ISLANDS CANVAS OVERVIEW */
            <motion.div
              key="panoramic_overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 p-0.5"
            >
              {islandsList.map((island) => (
                <motion.div
                  key={island.id}
                  layoutId={`island-card-${island.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  onClick={() => setActiveIsland(island.id)}
                  className={`group relative cursor-pointer bg-[#121824] border border-white/10 p-4 sm:p-5 rounded-2xl shadow-xl transition-all hover:border-[#3B6FF0]/50 hover:bg-[#161E2E] ${island.positionClass} flex flex-col justify-between min-h-[160px] sm:min-h-[190px] overflow-hidden`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between relative z-10">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-[#0A0E14] border border-white/10 group-hover:border-[#3B6FF0]/30 transition-colors">
                      {island.icon}
                    </div>

                    {island.badge && (
                      <span className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                        {island.badge}
                      </span>
                    )}
                  </div>

                  {/* Body Text */}
                  <div className="space-y-1 relative z-10 mt-3 sm:mt-5">
                    <h3 className="font-display font-bold text-sm sm:text-base text-white group-hover:text-[#3B6FF0] transition-colors flex items-center justify-between">
                      <span>{island.title}</span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#3B6FF0]" />
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                      {island.subtitle}
                    </p>
                  </div>

                  {/* Bottom Action Trigger */}
                  <div className="pt-2.5 sm:pt-3 border-t border-white/5 flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-slate-400 group-hover:text-slate-200 relative z-10">
                    <span>Abrir Isla</span>
                    <Maximize2 className="w-3.5 h-3.5 text-[#3B6FF0]" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* EXPANDED ISLAND FOCUSED WORLD VIEW (Full screen responsive sheet on phones) */
            <motion.div
              key={`expanded_${activeIsland}`}
              layoutId={`island-card-${activeIsland}`}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full max-w-4xl mx-auto bg-[#121824] border border-white/10 rounded-2xl p-3.5 sm:p-6 shadow-2xl flex flex-col min-h-[calc(100vh-170px)] sm:min-h-[580px] max-h-[calc(100vh-140px)] sm:max-h-[82vh] overflow-hidden relative"
            >
              {/* Island Header Bar with CLOSE BUTTON (X) ONLY */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 mb-3 sm:mb-4 shrink-0">
                <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-[#0A0E14] border border-white/10 shrink-0">
                    {islandsList.find(i => i.id === activeIsland)?.icon}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display font-bold text-base sm:text-lg text-white truncate">
                      {islandsList.find(i => i.id === activeIsland)?.title}
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                      {islandsList.find(i => i.id === activeIsland)?.subtitle}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveIsland(null)}
                  className="p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 transition-all flex items-center space-x-1.5 text-xs font-medium shrink-0 ml-2"
                  title="Cerrar Isla (Volver a Vista Panorámica)"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Cerrar</span>
                </button>
              </div>

              {/* Active Island Content Body */}
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col pr-1">
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

