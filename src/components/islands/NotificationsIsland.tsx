import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Heart, 
  MessageSquare, 
  UserPlus, 
  Sparkles, 
  CheckCheck, 
  ShieldCheck, 
  AtSign, 
  Volume2, 
  VolumeX, 
  Send,
  Zap,
  Settings
} from 'lucide-react';
import { NotificationItem } from '../../types';
import { generateIDXion } from '../../lib/xion';
import { 
  getBrowserNotificationPermission, 
  requestNotificationPermission, 
  sendNativePushNotification, 
  getPushConfig, 
  savePushConfig, 
  initPushNotificationListeners 
} from '../../lib/pushNotifications';
import { getActiveUser } from '../../lib/supabase';

const INITIAL_NOTIFS: NotificationItem[] = [
  {
    id: 'notif_1',
    user_id: 'usr_active',
    type: 'like',
    actor: {
      id: 'usr_1',
      email: 'sofia@vibe.app',
      username: 'sofia_design',
      display_name: 'Sofía Valenzuela',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: '',
      created_at: '',
      id_xion: generateIDXion(),
    },
    message: 'le gustó tu publicación en VIBE.',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    is_read: false,
    id_xion: generateIDXion(),
  },
  {
    id: 'notif_2',
    user_id: 'usr_active',
    type: 'mention',
    actor: {
      id: 'usr_2',
      email: 'lucas@vibe.app',
      username: 'lucas_code',
      display_name: 'Lucas Martínez',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      bio: '',
      created_at: '',
      id_xion: generateIDXion(),
    },
    message: 'te mencionó en un comentario: "¡Echa un vistazo a esto!"',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    is_read: false,
    id_xion: generateIDXion(),
  },
  {
    id: 'notif_3',
    user_id: 'usr_active',
    type: 'message',
    actor: {
      id: 'usr_3',
      email: 'elena@vibe.app',
      username: 'elena_music',
      display_name: 'Elena Silva',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      bio: '',
      created_at: '',
      id_xion: generateIDXion(),
    },
    message: 'te envió un mensaje directo en tiempo real.',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    is_read: false,
    id_xion: generateIDXion(),
  }
];

export const NotificationsIsland: React.FC = () => {
  const [notifs, setNotifs] = useState<NotificationItem[]>(INITIAL_NOTIFS);
  const [permState, setPermState] = useState<NotificationPermission>(getBrowserNotificationPermission());
  const [pushConfig, setPushConfigState] = useState(getPushConfig());
  const [showConfig, setShowConfig] = useState<boolean>(false);

  const currentUser = getActiveUser();

  useEffect(() => {
    if (!currentUser) return;

    // Listen to real-time mentions and messages
    const unsubPush = initPushNotificationListeners(
      (msg) => {
        const newNotif: NotificationItem = {
          id: `notif_${Date.now()}`,
          user_id: currentUser.id,
          type: 'message',
          actor: {
            id: msg.sender_id,
            email: '',
            username: 'viber',
            display_name: 'VIBER',
            avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.sender_id}`,
            bio: '',
            created_at: '',
            id_xion: generateIDXion(),
          },
          message: `te envió un mensaje directo: "${msg.content.slice(0, 50)}"`,
          created_at: new Date().toISOString(),
          is_read: false,
          id_xion: generateIDXion(),
        };
        setNotifs(prev => [newNotif, ...prev]);
      },
      (mentionData) => {
        const newNotif: NotificationItem = {
          id: `notif_mention_${Date.now()}`,
          user_id: currentUser.id,
          type: 'mention',
          actor: mentionData.author,
          message: `te mencionó en VIBE: "${mentionData.text.slice(0, 60)}"`,
          created_at: new Date().toISOString(),
          is_read: false,
          id_xion: generateIDXion(),
        };
        setNotifs(prev => [newNotif, ...prev]);
      },
      (notif) => {
        setNotifs(prev => [notif, ...prev]);
      }
    );

    return () => {
      unsubPush();
    };
  }, [currentUser?.id]);

  const handleEnablePush = async () => {
    await requestNotificationPermission();
    setPermState(getBrowserNotificationPermission());
  };

  const handleTestDMPush = () => {
    sendNativePushNotification(
      '💬 [Prueba Push VIBE] Mensaje Directo',
      'Sofía Valenzuela te envió: "¿Viste las nuevas actualizaciones en tiempo real?"',
      { action: 'open_chat' }
    );

    const testNotif: NotificationItem = {
      id: `notif_test_${Date.now()}`,
      user_id: currentUser?.id || 'usr_active',
      type: 'message',
      actor: {
        id: 'usr_1',
        email: 'sofia@vibe.app',
        username: 'sofia_design',
        display_name: 'Sofía Valenzuela',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        bio: '',
        created_at: '',
        id_xion: generateIDXion(),
      },
      message: 'te envió una alerta de mensaje directo en tiempo real.',
      created_at: new Date().toISOString(),
      is_read: false,
      id_xion: generateIDXion(),
    };
    setNotifs(prev => [testNotif, ...prev]);
  };

  const handleTestMentionPush = () => {
    const uname = currentUser?.username || 'usuario';
    sendNativePushNotification(
      `🏷️ [Prueba Push VIBE] Mención de @lucas_code`,
      `@${uname} ¡Acabo de probar las notificaciones push en VIBE Realtime! 🔥`,
      { action: 'open_feed' }
    );

    const testNotif: NotificationItem = {
      id: `notif_mention_test_${Date.now()}`,
      user_id: currentUser?.id || 'usr_active',
      type: 'mention',
      actor: {
        id: 'usr_2',
        email: 'lucas@vibe.app',
        username: 'lucas_code',
        display_name: 'Lucas Martínez',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        bio: '',
        created_at: '',
        id_xion: generateIDXion(),
      },
      message: `te mencionó en VIBE: "@${uname} ¡Proba las notificaciones push!"`,
      created_at: new Date().toISOString(),
      is_read: false,
      id_xion: generateIDXion(),
    };
    setNotifs(prev => [testNotif, ...prev]);
  };

  const toggleSound = () => {
    const updated = savePushConfig({ soundEnabled: !pushConfig.soundEnabled });
    setPushConfigState(updated);
  };

  const markAllAsRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-[#3B6FF0] fill-[#3B6FF0]/20" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-[#3B6FF0]" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-[#3B6FF0]" />;
      case 'comment':
      case 'reply':
        return <Send className="w-4 h-4 text-slate-300" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-[#3B6FF0]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#3B6FF0]" />;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Push Notification Control Panel */}
      <div className="p-3.5 rounded-xl bg-[#0A0E14] border border-white/10 shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-[#3B6FF0]/20 text-[#3B6FF0]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-xs text-white flex items-center space-x-2">
                <span>Notificaciones Push VIBE</span>
                <span className={`text-[9px] px-2 py-0.2 rounded-full font-bold uppercase ${
                  permState === 'granted' 
                    ? 'bg-[#3B6FF0]/15 text-[#3B6FF0] border border-[#3B6FF0]/30' 
                    : 'bg-white/5 text-slate-400 border border-white/10'
                }`}>
                  {permState === 'granted' ? 'Activado' : permState === 'denied' ? 'Bloqueado' : 'Pendiente'}
                </span>
              </h4>
              <p className="text-[10px] text-slate-400">
                Alertas nativas instantáneas para mensajes directos y menciones (@)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={toggleSound}
              title={pushConfig.soundEnabled ? "Desactivar sonido" : "Activar sonido"}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
            >
              {pushConfig.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#3B6FF0]" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            <button
              onClick={() => setShowConfig(!showConfig)}
              title="Ajustes"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {permState !== 'granted' && (
          <button
            onClick={handleEnablePush}
            className="w-full py-2 bg-[#3B6FF0] hover:bg-[#2E5EFF] text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Permitir Notificaciones Push en el Navegador</span>
          </button>
        )}

        {/* Quick Push Test Trigger Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/10 text-[11px]">
          <span className="text-slate-400 text-[10px] font-semibold uppercase">Probar alertas:</span>
          <button
            onClick={handleTestDMPush}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#3B6FF0] text-slate-200 hover:text-white border border-white/10 transition-all font-medium flex items-center space-x-1"
          >
            <MessageSquare className="w-3 h-3 text-[#3B6FF0]" />
            <span>Push Mensaje Directo</span>
          </button>
          <button
            onClick={handleTestMentionPush}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#3B6FF0] text-slate-200 hover:text-white border border-white/10 transition-all font-medium flex items-center space-x-1"
          >
            <AtSign className="w-3 h-3 text-[#3B6FF0]" />
            <span>Push Mención @</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-[#3B6FF0]" />
          <h4 className="font-semibold text-xs text-slate-100">Historial de Notificaciones</h4>
        </div>
        <button
          onClick={markAllAsRead}
          className="text-[11px] text-[#3B6FF0] hover:text-[#2E5EFF] flex items-center space-x-1"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Marcar todas como leídas</span>
        </button>
      </div>

      {/* Notification Stream List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[260px]">
        {notifs.map((n) => (
          <div
            key={n.id}
            className={`p-3 rounded-xl border transition-all flex items-center space-x-3 ${
              n.is_read
                ? 'bg-[#0A0E14] border-white/5 text-slate-400'
                : 'bg-[#0A0E14] border-[#3B6FF0]/30 text-slate-200 shadow-sm'
            }`}
          >
            <div className="p-2 rounded-lg bg-[#121824] border border-white/10 shrink-0">
              {getIcon(n.type)}
            </div>
            <img
              src={n.actor.avatar_url}
              alt={n.actor.display_name}
              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-white/10"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-200 leading-snug">
                <strong className="text-white font-semibold">{n.actor.display_name}</strong>{' '}
                {n.message}
              </p>
              <span className="text-[10px] text-slate-500">
                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {!n.is_read && (
              <span className="w-2 h-2 rounded-full bg-[#3B6FF0] shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
