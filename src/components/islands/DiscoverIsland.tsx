import React, { useState, useEffect } from 'react';
import { Search, UserPlus, MessageCircle, Check, Users } from 'lucide-react';
import { UserProfile } from '../../types';
import { apiGetUsers, getActiveUser } from '../../lib/supabase';

interface DiscoverIslandProps {
  onStartChatWithUser: (user: UserProfile) => void;
}

export const DiscoverIsland: React.FC<DiscoverIslandProps> = ({ onStartChatWithUser }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState<string>('');
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  const currentUser = getActiveUser();

  useEffect(() => {
    apiGetUsers().then(all => {
      setUsers(all.filter(u => u.id !== currentUser.id));
    });
  }, [currentUser.id]);

  const toggleFollow = (userId: string) => {
    setFollowingMap(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const filteredUsers = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.display_name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.bio.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Search Header */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar usuarios por nombre o @usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#0A0E14] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3B6FF0] transition-colors"
        />
      </div>

      {/* Suggested Users Header */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-300 font-semibold">
        <span className="flex items-center space-x-1.5">
          <Users className="w-3.5 h-3.5 text-[#3B6FF0]" />
          <span>Comunidad VIBE</span>
        </span>
        <span className="text-[10px] text-slate-400">{filteredUsers.length} encontrados</span>
      </div>

      {/* Users List Grid */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar min-h-[300px]">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No se encontraron usuarios coincidentes con tu búsqueda.
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isFollowing = followingMap[user.id];
            return (
              <div
                key={user.id}
                className="p-3.5 rounded-xl bg-[#0A0E14] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={user.avatar_url}
                    alt={user.display_name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10"
                  />
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs text-slate-100 truncate group-hover:text-white transition-colors">
                      {user.display_name}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.bio}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => toggleFollow(user.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1 ${
                      isFollowing
                        ? 'bg-[#3B6FF0]/15 text-[#3B6FF0] border border-[#3B6FF0]/30 font-semibold'
                        : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#3B6FF0]" />
                        <span>Siguiendo</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                        <span>Seguir</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onStartChatWithUser(user)}
                    title={`Abrir chat con @${user.username}`}
                    className="p-2 rounded-lg bg-[#3B6FF0] hover:bg-[#2E5EFF] text-white transition-all shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
