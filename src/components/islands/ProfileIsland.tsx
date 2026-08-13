import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Edit3, 
  Camera, 
  Check, 
  Sparkles, 
  LogOut, 
  Grid, 
  Heart, 
  ShieldCheck,
  RefreshCw,
  Clock
} from 'lucide-react';
import { UserProfile, Post } from '../../types';
import { 
  getActiveUser, 
  apiUpdateProfile, 
  apiGetPosts, 
  apiGetUsers, 
  setActiveUser 
} from '../../lib/supabase';

interface ProfileIslandProps {
  onOpenAuth: () => void;
}

export const ProfileIsland: React.FC<ProfileIslandProps> = ({ onOpenAuth }) => {
  const [user, setUser] = useState<UserProfile>(getActiveUser());
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>(user.display_name);
  const [bio, setBio] = useState<string>(user.bio);
  const [avatarUrl, setAvatarUrl] = useState<string>(user.avatar_url);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [allAccounts, setAllAccounts] = useState<UserProfile[]>([]);

  useEffect(() => {
    const handleAuthChange = () => {
      const active = getActiveUser();
      setUser(active);
      setDisplayName(active.display_name);
      setBio(active.bio);
      setAvatarUrl(active.avatar_url);
      fetchUserPosts(active.id);
    };

    window.addEventListener('vibe_auth_changed' as any, handleAuthChange);
    handleAuthChange();

    apiGetUsers().then(u => setAllAccounts(u));

    return () => {
      window.removeEventListener('vibe_auth_changed' as any, handleAuthChange);
    };
  }, []);

  const fetchUserPosts = async (userId: string) => {
    try {
      const posts = await apiGetPosts();
      setMyPosts(posts.filter(p => p.author.id === userId || p.author_id === userId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await apiUpdateProfile({
        display_name: displayName.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl,
      });
      setUser(updated);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const generateRandomAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
    setAvatarUrl(newAvatar);
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSwitchAccount = (u: UserProfile) => {
    setActiveUser(u.id);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Profile Header Card */}
      <div className="relative bg-gradient-to-br from-slate-900 via-violet-950/30 to-slate-900 border border-white/10 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Avatar with image upload / edit overlay */}
          <div className="relative group">
            <img
              src={isEditing ? avatarUrl : user.avatar_url}
              alt={user.display_name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-violet-500/30 shadow-lg"
            />
            {isEditing && (
              <div className="absolute inset-0 bg-slate-950/70 rounded-full flex flex-col items-center justify-center space-y-1 opacity-90 transition-opacity">
                <label className="cursor-pointer p-1 text-violet-300 hover:text-white" title="Subir imagen">
                  <Camera className="w-5 h-5" />
                  <input type="file" accept="image/*" onChange={handleAvatarFileUpload} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={generateRandomAvatar}
                  title="Generar avatar aleatorio"
                  className="text-[9px] bg-violet-600 px-1.5 py-0.5 rounded text-white font-medium"
                >
                  Generar
                </button>
              </div>
            )}
          </div>

          {/* User Display Info & Edit Toggle */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Nombre visible</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-slate-950 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                    placeholder="Tu Nombre"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Biografía de VIBE</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 resize-none"
                    placeholder="Escribe tu biografía..."
                  />
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-full text-xs font-semibold flex items-center space-x-1 shadow-md"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Guardar Cambios</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 bg-white/10 text-slate-300 rounded-full text-xs hover:bg-white/20"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-center sm:justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-100">{user.display_name}</h3>
                    <p className="text-xs text-violet-400 font-medium">@{user.username}</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-xs border border-white/10 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-violet-400" />
                    <span>Editar Perfil</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {user.bio || 'Sin biografía añadida.'}
                </p>

                {/* Mobile edit button */}
                <button
                  onClick={() => setIsEditing(true)}
                  className="sm:hidden w-full mt-2 py-1.5 rounded-full bg-white/5 text-slate-300 text-xs border border-white/10 flex items-center justify-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5 text-violet-400" />
                  <span>Editar Perfil</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
          <div className="p-2 rounded-xl bg-slate-950/40">
            <span className="block font-bold text-sm text-slate-100">{myPosts.length}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Posts</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/40">
            <span className="block font-bold text-sm text-slate-100">{user.followers_count || 128}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Seguidores</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/40">
            <span className="block font-bold text-sm text-slate-100">{user.following_count || 64}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Siguiendo</span>
          </div>
        </div>
      </div>

      {/* Account Switcher / Auth Trigger */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-slate-300">Gestión de Cuentas:</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenAuth}
            className="px-3 py-1.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-all shadow-md"
          >
            Reg. / Iniciar Sesión
          </button>
        </div>
      </div>

      {/* My Posts Stream */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar min-h-[200px]">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 px-1 pt-1">
          <span className="flex items-center space-x-1.5">
            <Grid className="w-3.5 h-3.5 text-violet-400" />
            <span>Mis Publicaciones</span>
          </span>
          <span className="text-[10px] text-slate-400">{myPosts.length} publicaciones</span>
        </div>

        {myPosts.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs bg-white/5 rounded-2xl border border-dashed border-white/10">
            Aún no has publicado ninguna vibración desde este perfil.
          </div>
        ) : (
          myPosts.map(post => (
            <div key={post.id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
              <p className="text-xs text-slate-200 leading-relaxed">{post.content}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </span>
                <span className="flex items-center space-x-1 text-rose-400">
                  <Heart className="w-3 h-3 fill-rose-500/30" />
                  <span>{post.likes_count || 0}</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
