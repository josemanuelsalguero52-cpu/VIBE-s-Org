import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Check, 
  Grid, 
  Heart, 
  ShieldCheck,
  Clock,
  Edit3,
  LogOut,
  UserPlus,
  LogIn,
  Fingerprint,
  Copy,
  Key
} from 'lucide-react';
import { UserProfile, Post } from '../../types';
import { 
  getActiveUser, 
  apiUpdateProfile, 
  apiGetPosts, 
  apiGetUsers, 
  apiSignOut
} from '../../lib/supabase';
import { useToast } from '../ToastContext';

interface ProfileIslandProps {
  onOpenAuth: () => void;
  onOpenAuthWithMode?: (mode: 'login' | 'signup') => void;
}

export const ProfileIsland: React.FC<ProfileIslandProps> = ({ onOpenAuth, onOpenAuthWithMode }) => {
  const [user, setUser] = useState<UserProfile | null>(getActiveUser());
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>(user?.display_name || '');
  const [bio, setBio] = useState<string>(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar_url || '');
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [copiedXion, setCopiedXion] = useState<boolean>(false);
  const toast = useToast();

  useEffect(() => {
    const handleAuthChange = () => {
      const active = getActiveUser();
      if (active) {
        setUser(active);
        setDisplayName(active.display_name);
        setBio(active.bio || '');
        setAvatarUrl(active.avatar_url || '');
        fetchUserPosts(active.id);
      } else {
        setUser(null);
      }
    };

    window.addEventListener('vibe_auth_changed' as any, handleAuthChange);
    if (user?.id) {
      fetchUserPosts(user.id);
    }

    apiGetUsers();

    return () => {
      window.removeEventListener('vibe_auth_changed' as any, handleAuthChange);
    };
  }, []);

  const fetchUserPosts = async (userId: string) => {
    try {
      const posts = await apiGetPosts();
      setMyPosts(posts.filter(p => p.author?.id === userId || p.author_id === userId));
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
      toast.success('¡Perfil actualizado con éxito!');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast.error(err.message || 'Error al actualizar el perfil.');
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

  if (!user) {
    return (
      <div className="text-center py-12 text-slate-400 text-xs">
        Debes iniciar sesión para ver tu perfil.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar space-y-4 pr-1">
      {/* Minimalist XION ID Traceable Card */}
      <div className="bg-[#0A0E14] border border-white/10 rounded-xl p-4 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B6FF0]/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#3B6FF0]/10 flex items-center justify-center border border-[#3B6FF0]/20">
              <Fingerprint className="w-4 h-4 text-[#3B6FF0]" />
            </div>
            <div>
              <h4 className="font-semibold text-xs text-slate-100">ID XION Trazable</h4>
              <p className="text-[10px] text-slate-400">Identificador criptográfico único en la red</p>
            </div>
          </div>
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Verificado</span>
          </span>
        </div>

        <div className="pt-3 flex items-center justify-between gap-3">
          <div className="flex-1 bg-[#121824] border border-white/10 rounded-lg px-3 py-2 flex items-center space-x-2">
            <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-mono text-xs text-[#3B6FF0] font-bold tracking-wider select-all">
              {user.id_xion || 'XD99-FT42'}
            </span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(user.id_xion || 'XD99-FT42');
              setCopiedXion(true);
              setTimeout(() => setCopiedXion(false), 2000);
            }}
            className="px-3 py-2 rounded-lg bg-[#3B6FF0]/10 hover:bg-[#3B6FF0]/20 text-[#3B6FF0] text-xs font-semibold border border-[#3B6FF0]/20 transition-all flex items-center space-x-1 shrink-0"
          >
            {copiedXion ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar ID</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[10px] text-slate-400 mt-2.5 leading-relaxed">
          Este ID XION garantiza la trazabilidad y autoría de tus publicaciones, interacciones y mensajes de forma descentralizada y segura en la arquitectura de islas.
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-[#0A0E14] border border-white/10 rounded-xl p-4 shadow-md">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Avatar with image upload / edit overlay */}
          <div className="relative group">
            <img
              src={isEditing ? avatarUrl : user.avatar_url}
              alt={user.display_name}
              className="w-20 h-20 rounded-full object-cover ring-2 ring-white/10"
            />
            {isEditing && (
              <div className="absolute inset-0 bg-[#0A0E14]/80 rounded-full flex flex-col items-center justify-center space-y-1">
                <label className="cursor-pointer p-1 text-slate-300 hover:text-white" title="Subir imagen">
                  <Camera className="w-4 h-4" />
                  <input type="file" accept="image/*" onChange={handleAvatarFileUpload} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={generateRandomAvatar}
                  title="Generar avatar aleatorio"
                  className="text-[9px] bg-[#3B6FF0] px-1.5 py-0.5 rounded text-white font-medium"
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
                    className="w-full bg-[#121824] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#3B6FF0]"
                    placeholder="Tu Nombre"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Biografía</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    className="w-full bg-[#121824] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#3B6FF0] resize-none"
                    placeholder="Escribe tu biografía..."
                  />
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-3.5 py-1.5 bg-[#3B6FF0] hover:bg-[#2E5EFF] text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Guardar Cambios</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 bg-white/5 text-slate-300 rounded-lg text-xs hover:bg-white/10"
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
                    <p className="text-xs text-slate-400 font-medium">@{user.username}</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs border border-white/10 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Editar Perfil</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {user.bio || 'Sin biografía añadida.'}
                </p>

                {/* Mobile edit button */}
                <button
                  onClick={() => setIsEditing(true)}
                  className="sm:hidden w-full mt-2 py-1.5 rounded-lg bg-white/5 text-slate-300 text-xs border border-white/10 flex items-center justify-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Editar Perfil</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
          <div className="p-2 rounded-lg bg-[#121824]">
            <span className="block font-bold text-sm text-slate-100">{myPosts.length}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Posts</span>
          </div>
          <div className="p-2 rounded-lg bg-[#121824]">
            <span className="block font-bold text-sm text-slate-100">{user.followers_count || 128}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Seguidores</span>
          </div>
          <div className="p-2 rounded-lg bg-[#121824]">
            <span className="block font-bold text-sm text-slate-100">{user.following_count || 64}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Siguiendo</span>
          </div>
        </div>
      </div>

      {/* Account Management Card */}
      <div className="bg-[#0A0E14] border border-white/10 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2 text-slate-300 text-xs">
          <ShieldCheck className="w-4 h-4 text-[#3B6FF0] shrink-0" />
          <span className="font-medium">Gestión de Autenticación:</span>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => onOpenAuthWithMode ? onOpenAuthWithMode('login') : onOpenAuth()}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium border border-white/10 transition-all flex items-center space-x-1"
          >
            <LogIn className="w-3.5 h-3.5 text-[#3B6FF0]" />
            <span>Iniciar Sesión</span>
          </button>
          <button
            onClick={() => onOpenAuthWithMode ? onOpenAuthWithMode('signup') : onOpenAuth()}
            className="px-3 py-1.5 rounded-lg bg-[#3B6FF0] hover:bg-[#2E5EFF] text-white text-xs font-semibold transition-all shadow-sm flex items-center space-x-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Crear Cuenta</span>
          </button>
          <button
            onClick={async () => {
              await apiSignOut();
            }}
            className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium border border-rose-500/20 transition-all flex items-center space-x-1"
            title="Cerrar sesión actual"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Salir</span>
          </button>
        </div>
      </div>

      {/* My Posts Stream */}
      <div className="space-y-3 pb-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 px-1 pt-1">
          <span className="flex items-center space-x-1.5">
            <Grid className="w-3.5 h-3.5 text-[#3B6FF0]" />
            <span>Mis Publicaciones</span>
          </span>
          <span className="text-[10px] text-slate-400">{myPosts.length} publicaciones</span>
        </div>

        {myPosts.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs bg-white/5 rounded-xl border border-dashed border-white/10">
            Aún no has publicado nada desde este perfil.
          </div>
        ) : (
          myPosts.map(post => (
            <div key={post.id} className="p-3.5 rounded-xl bg-[#0A0E14] border border-white/10 space-y-2">
              <p className="text-xs text-slate-200 leading-relaxed">{post.content}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </span>
                <span className="flex items-center space-x-1 text-[#3B6FF0]">
                  <Heart className="w-3 h-3 fill-[#3B6FF0]/30 text-[#3B6FF0]" />
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
