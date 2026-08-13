/**
 * Push Notification Service for VIBE Social Network
 * Handles Native Browser Push Notifications, Supabase Realtime listeners, 
 * and OneSignal/WebPush integration.
 */

import { ChatMessage, NotificationItem, PostComment, UserProfile } from '../types';
import { supabase, isSupabaseConfigured, getActiveUser, broadcastLocalEvent, subscribeToLocalChannel } from './supabase';

export interface PushConfig {
  enabled: boolean;
  notifyOnDM: boolean;
  notifyOnMention: boolean;
  notifyOnLike: boolean;
  soundEnabled: boolean;
  oneSignalAppId?: string;
}

const DEFAULT_CONFIG: PushConfig = {
  enabled: true,
  notifyOnDM: true,
  notifyOnMention: true,
  notifyOnLike: true,
  soundEnabled: true,
};

export function getPushConfig(): PushConfig {
  const stored = localStorage.getItem('vibe_push_config');
  if (!stored) return DEFAULT_CONFIG;
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function savePushConfig(config: Partial<PushConfig>): PushConfig {
  const current = getPushConfig();
  const updated = { ...current, ...config };
  localStorage.setItem('vibe_push_config', JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('vibe_push_config_changed', { detail: updated }));
  return updated;
}

export function getBrowserNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    alert('Tu navegador no soporta la API de Notificaciones Push nativas.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      sendNativePushNotification(
        '🔔 Notificaciones Push Activadas',
        '¡Perfecto! Ahora recibirás alertas de mensajes directos y menciones en tiempo real en VIBE.',
        { url: window.location.href }
      );
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error pidiendo permiso de notificaciones:', err);
    return false;
  }
}

/**
 * Sends native Web Push Notification if permission is granted
 */
export function sendNativePushNotification(
  title: string, 
  body: string, 
  data?: any, 
  icon?: string
) {
  const config = getPushConfig();
  if (!config.enabled) return;

  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const defaultIcon = icon || '/vite.svg';
      const notification = new Notification(title, {
        body,
        icon: defaultIcon,
        badge: defaultIcon,
        tag: data?.tag || 'vibe_push',
        data,
      });

      notification.onclick = function (event) {
        event.preventDefault();
        window.focus();
        if (data?.action) {
          window.dispatchEvent(new CustomEvent('vibe_navigate_action', { detail: data }));
        }
        notification.close();
      };

      // Play subtle chime sound if enabled
      if (config.soundEnabled) {
        playNotificationSound();
      }
    } catch (err) {
      console.warn('Browser Push Notification failed:', err);
    }
  }
}

function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
  } catch (e) {
    // Audio context may be blocked without user interaction
  }
}

/**
 * Helper to parse @username mentions from text
 */
export function extractMentions(text: string): string[] {
  const matches = text.match(/@([a-zA-Z0-9_]+)/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map(m => m.substring(1).toLowerCase())));
}

/**
 * Setup Realtime Push Listeners for Supabase + Local Demo Engine
 */
export function initPushNotificationListeners(
  onNewMessage: (msg: ChatMessage) => void,
  onNewMention: (item: { text: string; author: UserProfile; targetUsername: string; postId?: string }) => void,
  onNewNotification: (notif: NotificationItem) => void
) {
  const activeUser = getActiveUser();

  // 1. Subscribe to Local Broadcast Events for instant responsiveness in all tabs / demo mode
  const unsubMsg = subscribeToLocalChannel('global_chat_message', (msg: ChatMessage) => {
    if (msg.recipient_id === activeUser.id && msg.sender_id !== activeUser.id) {
      const config = getPushConfig();
      if (config.notifyOnDM) {
        sendNativePushNotification(
          `💬 Nuevo mensaje directo`,
          `Un viber te envió un mensaje: "${msg.content.slice(0, 60)}${msg.content.length > 60 ? '...' : ''}"`,
          { action: 'open_chat', sender_id: msg.sender_id }
        );
      }
      onNewMessage(msg);
    }
  });

  const unsubMention = subscribeToLocalChannel('global_mention', (data: any) => {
    if (data.targetUsername?.toLowerCase() === activeUser.username.toLowerCase() && data.author.id !== activeUser.id) {
      const config = getPushConfig();
      if (config.notifyOnMention) {
        sendNativePushNotification(
          `🏷️ Mención de @${data.author.username}`,
          `${data.author.display_name} te mencionó: "${data.text.slice(0, 60)}..."`,
          { action: 'open_post', post_id: data.postId }
        );
      }
      onNewMention(data);
    }
  });

  const unsubNotif = subscribeToLocalChannel('global_notification', (notif: NotificationItem) => {
    if (notif.user_id === activeUser.id || notif.user_id === 'usr_active') {
      onNewNotification(notif);
    }
  });

  // 2. Supabase Realtime Postgres Changes Listener
  let supabaseChannel: any = null;
  if (isSupabaseConfigured && supabase) {
    try {
      supabaseChannel = supabase
        .channel('vibe_push_realtime')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            const newMsg = payload.new as ChatMessage;
            if (newMsg.recipient_id === activeUser.id) {
              const config = getPushConfig();
              if (config.notifyOnDM) {
                sendNativePushNotification(
                  `💬 Mensaje Directo (Realtime)`,
                  `Nuevo mensaje de chat: "${newMsg.content.slice(0, 60)}"`,
                  { action: 'open_chat', sender_id: newMsg.sender_id }
                );
              }
              onNewMessage(newMsg);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          (payload) => {
            const notif = payload.new as NotificationItem;
            if (notif.user_id === activeUser.id) {
              onNewNotification(notif);
              if (notif.type === 'mention') {
                sendNativePushNotification(
                  `🏷️ Mención en VIBE`,
                  `${notif.actor.display_name || 'Alguien'} te mencionó en una publicación`,
                  { action: 'open_post', post_id: notif.post_id }
                );
              }
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Could not connect Supabase Realtime Push channel:', e);
    }
  }

  return () => {
    unsubMsg();
    unsubMention();
    unsubNotif();
    if (supabaseChannel && supabase) {
      supabase.removeChannel(supabaseChannel);
    }
  };
}
