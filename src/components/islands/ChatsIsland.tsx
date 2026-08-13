import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  MessageSquare, 
  ArrowLeft, 
  Sparkles,
  Users,
  CheckCheck,
  Search,
  Phone,
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Bell,
  X,
  Volume2,
  UserPlus
} from 'lucide-react';
import { ChatMessage, UserProfile } from '../../types';
import { 
  apiGetUsers, 
  apiGetMessages, 
  apiSendMessage, 
  getActiveUser, 
  subscribeToLocalChannel,
  setActiveUser
} from '../../lib/supabase';

interface ChatsIslandProps {
  initialTargetUser?: UserProfile | null;
}

interface ToastNotification {
  id: string;
  title: string;
  content: string;
  avatar_url?: string;
  type: 'message' | 'call' | 'info';
}

function playAudioNotification(type: 'message' | 'ring' | 'end') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'message') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'ring') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'end') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(293.66, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    // Audio Context restricted before user gesture
  }
}

export const ChatsIsland: React.FC<ChatsIslandProps> = ({ initialTargetUser }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeChatUser, setActiveChatUser] = useState<UserProfile | null>(initialTargetUser || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);

  // Search state
  const [searchContactQuery, setSearchContactQuery] = useState<string>('');
  const [searchMessageQuery, setSearchMessageQuery] = useState<string>('');
  const [isSearchingMessages, setIsSearchingMessages] = useState<boolean>(false);

  // Notification Toast state
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Call System State
  const [activeCall, setActiveCall] = useState<{
    user: UserProfile;
    type: 'audio' | 'video';
    status: 'calling' | 'connected';
  } | null>(null);
  const [callSeconds, setCallSeconds] = useState<number>(0);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isCameraOff, setIsCameraOff] = useState<boolean>(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Incoming Call Modal simulation state
  const [incomingCall, setIncomingCall] = useState<{
    caller: UserProfile;
    type: 'audio' | 'video';
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentUser = getActiveUser();

  const triggerToast = (toast: Omit<ToastNotification, 'id'>) => {
    const id = `toast_${Date.now()}`;
    setToasts(prev => [ ...prev, { ...toast, id } ]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const loadUsersList = async () => {
    try {
      const allUsers = await apiGetUsers();
      const filtered = allUsers.filter(u => u.id !== currentUser.id);
      setUsers(filtered);
      if (!activeChatUser && !initialTargetUser && filtered.length > 0) {
        setActiveChatUser(filtered[0]);
      }
    } catch (err) {
      console.error('Failed to load chat users:', err);
    }
  };

  const loadMessages = async (recipient: UserProfile) => {
    setLoadingMessages(true);
    try {
      const msgs = await apiGetMessages(recipient.id);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
      scrollToBottom();
    }
  };

  useEffect(() => {
    loadUsersList();
  }, [currentUser.id]);

  useEffect(() => {
    if (activeChatUser) {
      loadMessages(activeChatUser);

      const convId = [currentUser.id, activeChatUser.id].sort().join('_');
      const unsubscribe = subscribeToLocalChannel(`chat_${convId}`, (newMsg: ChatMessage) => {
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });

        if (newMsg.sender_id !== currentUser.id) {
          playAudioNotification('message');
          triggerToast({
            title: `Nuevo mensaje de @${activeChatUser.username}`,
            content: newMsg.content,
            avatar_url: activeChatUser.avatar_url,
            type: 'message'
          });
        }

        scrollToBottom();
      });

      return () => {
        unsubscribe();
      };
    }
  }, [activeChatUser, currentUser.id]);

  // Call duration counter
  useEffect(() => {
    if (activeCall?.status === 'connected') {
      timerRef.current = setInterval(() => {
        setCallSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeCall?.status]);

  // Attach camera media stream to video element
  useEffect(() => {
    if (localVideoRef.current && mediaStream) {
      localVideoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream, activeCall]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatUser) return;

    const content = inputText.trim();
    setInputText('');

    try {
      const sentMsg = await apiSendMessage(activeChatUser.id, content);
      setMessages(prev => [...prev, sentMsg]);
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleSwitchTestUser = (user: UserProfile) => {
    setActiveUser(user.id);
    window.dispatchEvent(new CustomEvent('vibe_auth_changed', { detail: user }));
  };

  // Start Voice or Video Call
  const startCall = async (type: 'audio' | 'video') => {
    if (!activeChatUser) return;

    playAudioNotification('ring');
    setActiveCall({
      user: activeChatUser,
      type,
      status: 'calling'
    });

    triggerToast({
      title: `Iniciando ${type === 'video' ? 'videollamada' : 'llamada de voz'}`,
      content: `Llamando a @${activeChatUser.username}...`,
      avatar_url: activeChatUser.avatar_url,
      type: 'call'
    });

    // Request camera / microphone permissions
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video'
      });
      setMediaStream(stream);
    } catch (err) {
      console.warn('Camera/Mic permission denied or not available:', err);
    }

    // Connect after 2.5s simulation ring phase
    setTimeout(() => {
      setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
    }, 2500);
  };

  const toggleMic = () => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach(track => {
        track.enabled = isMicMuted;
      });
    }
    setIsMicMuted(!isMicMuted);
  };

  const toggleCamera = () => {
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach(track => {
        track.enabled = isCameraOff;
      });
    }
    setIsCameraOff(!isCameraOff);
  };

  const endCall = async () => {
    playAudioNotification('end');
    
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }

    if (activeCall && activeChatUser) {
      const durationFormatted = formatCallDuration(callSeconds);
      const callIcon = activeCall.type === 'video' ? '📹 Videollamada' : '📞 Llamada de voz';
      const logContent = `${callIcon} finalizada (${durationFormatted})`;
      
      try {
        const sysMsg = await apiSendMessage(activeChatUser.id, logContent);
        setMessages(prev => [...prev, sysMsg]);
        scrollToBottom();
      } catch (e) {
        console.error('Failed to log call end:', e);
      }
    }

    setActiveCall(null);
    setIsMicMuted(false);
    setIsCameraOff(false);
  };

  // Simulate an incoming call test
  const simulateIncomingCall = () => {
    if (!activeChatUser && users.length === 0) return;
    const target = activeChatUser || users[0];
    playAudioNotification('ring');
    setIncomingCall({
      caller: target,
      type: 'video'
    });
  };

  const acceptIncomingCall = () => {
    if (!incomingCall) return;
    const { caller, type } = incomingCall;
    setIncomingCall(null);
    setActiveChatUser(caller);
    setActiveCall({
      user: caller,
      type,
      status: 'connected'
    });
    startCallStream(type);
  };

  const startCallStream = async (type: 'audio' | 'video') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video'
      });
      setMediaStream(stream);
    } catch (e) {
      console.warn('Media access warning:', e);
    }
  };

  const rejectIncomingCall = () => {
    playAudioNotification('end');
    setIncomingCall(null);
  };

  const formatCallDuration = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Filtered contacts list
  const filteredUsers = users.filter(u => {
    const q = searchContactQuery.toLowerCase().trim();
    if (!q) return true;
    return u.display_name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
  });

  // Filtered messages
  const filteredMessages = messages.filter(m => {
    const q = searchMessageQuery.toLowerCase().trim();
    if (!q || !isSearchingMessages) return true;
    return m.content.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col h-full space-y-3 relative overflow-hidden">
      {/* Toast Notifications Overlay */}
      <div className="absolute top-2 right-2 z-50 flex flex-col space-y-2 max-w-xs pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id}
            className="bg-[#121824]/95 border border-[#3B6FF0]/40 rounded-xl p-3 shadow-xl backdrop-blur-md flex items-start space-x-3 text-xs text-white pointer-events-auto animate-fade-in"
          >
            {t.avatar_url ? (
              <img src={t.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-[#3B6FF0]" />
            ) : (
              <div className="p-1.5 bg-[#3B6FF0]/20 rounded-lg text-[#3B6FF0] shrink-0">
                <Bell className="w-4 h-4" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-100 truncate">{t.title}</p>
              <p className="text-[11px] text-slate-300 truncate">{t.content}</p>
            </div>
            <button 
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Switcher Header & Action Toolbar */}
      <div className="bg-[#0A0E14] border border-white/10 rounded-xl p-2.5 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center space-x-2">
          <img
            src={currentUser.avatar_url}
            alt={currentUser.display_name}
            className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20"
          />
          <span className="text-slate-300">
            Chateando como: <strong className="text-white">@{currentUser.username}</strong>
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={simulateIncomingCall}
            className="px-2.5 py-1 rounded-lg bg-[#3B6FF0]/20 hover:bg-[#3B6FF0]/30 text-[#3B6FF0] text-[11px] font-medium transition-all border border-[#3B6FF0]/30 flex items-center space-x-1"
            title="Simular recibir una llamada de prueba"
          >
            <Phone className="w-3 h-3" />
            <span className="hidden sm:inline">Probar Llamada</span>
          </button>

          {users.length > 0 && (
            <div className="hidden sm:flex items-center space-x-1 border-l border-white/10 pl-2">
              <span className="text-[10px] text-slate-400">Actor:</span>
              {users.slice(0, 3).map(u => (
                <button
                  key={u.id}
                  onClick={() => handleSwitchTestUser(u)}
                  title={`Simular inicio de sesión como @${u.username}`}
                  className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-[#3B6FF0]/20 text-[10px] text-slate-300 hover:text-white transition-all border border-white/5"
                >
                  @{u.username.split('_')[0]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-[360px] overflow-hidden">
        {/* Contacts Sidebar List */}
        <div className={`md:w-64 flex-col space-y-2 border-r border-white/10 pr-2 shrink-0 ${
          activeChatUser ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Header & Search */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span className="flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-[#3B6FF0]" />
                <span>Contactos</span>
              </span>
              <span className="bg-white/5 border border-white/10 text-slate-300 px-1.5 py-0.5 rounded-md text-[10px]">
                {filteredUsers.length}
              </span>
            </div>

            {/* Buscador de contactos */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchContactQuery}
                onChange={(e) => setSearchContactQuery(e.target.value)}
                placeholder="Buscar contacto..."
                className="w-full bg-[#0A0E14] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#3B6FF0] transition-all"
              />
              {searchContactQuery && (
                <button 
                  onClick={() => setSearchContactQuery('')}
                  className="absolute right-2 top-2 text-slate-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 space-y-2 px-2 text-slate-500">
                <UserPlus className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">No hay usuarios encontrados</p>
                <p className="text-[10px] text-slate-600">
                  Abre la ventana de AuthModal o crea otro usuario para iniciar un chat.
                </p>
              </div>
            ) : (
              filteredUsers.map(u => {
                const isSelected = activeChatUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => setActiveChatUser(u)}
                    className={`w-full flex items-center space-x-2.5 p-2.5 rounded-xl transition-all text-left ${
                      isSelected
                        ? 'bg-[#3B6FF0]/20 border border-[#3B6FF0]/40 text-white shadow-sm'
                        : 'hover:bg-white/5 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={u.avatar_url}
                        alt={u.display_name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10"
                      />
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#3B6FF0] rounded-full ring-2 ring-[#0A0E14]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-xs text-slate-200 truncate">{u.display_name}</h5>
                      <p className="text-[11px] text-slate-400 truncate">@{u.username}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Thread Area */}
        <div className={`flex-1 flex-col justify-between bg-[#0A0E14] rounded-xl border border-white/10 p-3 ${
          !activeChatUser ? 'hidden md:flex' : 'flex'
        }`}>
          {activeChatUser ? (
            <>
              {/* Active Chat Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10 shrink-0">
                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={() => setActiveChatUser(null)}
                    className="md:hidden p-1.5 rounded-lg hover:bg-white/10 text-slate-300"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="relative">
                    <img
                      src={activeChatUser.avatar_url}
                      alt={activeChatUser.display_name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10"
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-[#0A0E14]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-100">{activeChatUser.display_name}</h4>
                    <p className="text-[10px] text-[#3B6FF0] flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 bg-[#3B6FF0] rounded-full animate-pulse" />
                      <span>En línea en VIBE</span>
                    </p>
                  </div>
                </div>

                {/* Call buttons & Search in chat */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setIsSearchingMessages(!isSearchingMessages)}
                    className={`p-2 rounded-lg transition-all ${
                      isSearchingMessages 
                        ? 'bg-[#3B6FF0]/20 text-[#3B6FF0] border border-[#3B6FF0]/30' 
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                    title="Buscar en la conversación"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => startCall('audio')}
                    className="p-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-all flex items-center space-x-1 text-xs"
                    title="Llamada de voz"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => startCall('video')}
                    className="p-2 rounded-lg bg-[#3B6FF0]/20 hover:bg-[#3B6FF0]/30 text-[#3B6FF0] border border-[#3B6FF0]/30 transition-all flex items-center space-x-1 text-xs"
                    title="Videollamada"
                  >
                    <Video className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Message Search Sub-bar */}
              {isSearchingMessages && (
                <div className="py-2 px-1 border-b border-white/5 flex items-center space-x-2 shrink-0">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchMessageQuery}
                    onChange={(e) => setSearchMessageQuery(e.target.value)}
                    placeholder="Filtrar mensajes en este chat..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#3B6FF0]"
                  />
                  {searchMessageQuery && (
                    <button onClick={() => setSearchMessageQuery('')} className="text-slate-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto space-y-3 py-3 px-1 custom-scrollbar max-h-[280px]">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full text-xs text-slate-400 space-x-2">
                    <Sparkles className="w-4 h-4 animate-spin text-[#3B6FF0]" />
                    <span>Cargando mensajes en tiempo real...</span>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-2 text-slate-400 text-center p-4">
                    <MessageSquare className="w-7 h-7 text-slate-600" />
                    <p className="text-xs">
                      {searchMessageQuery 
                        ? `No hay mensajes que coincidan con "${searchMessageQuery}"` 
                        : `No hay mensajes previos con @${activeChatUser.username}`}
                    </p>
                    <p className="text-[11px] text-slate-500">Envía un saludo o realiza una llamada para comenzar</p>
                  </div>
                ) : (
                  filteredMessages.map((msg) => {
                    const isMe = msg.sender_id === currentUser.id;
                    const isSystemCallMsg = msg.content.includes('Llamada') || msg.content.includes('Videollamada');

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-xl text-xs leading-relaxed break-words ${
                            isSystemCallMsg
                              ? 'bg-[#121824] border border-[#3B6FF0]/30 text-[#3B6FF0] font-medium'
                              : isMe
                              ? 'bg-[#3B6FF0] text-white rounded-br-none shadow-sm'
                              : 'bg-[#121824] border border-white/10 text-slate-200 rounded-bl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1 px-1 flex items-center space-x-1">
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && <CheckCheck className="w-3 h-3 text-[#3B6FF0]" />}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Send Message Input */}
              <form onSubmit={handleSend} className="flex items-center space-x-2 pt-2 border-t border-white/10 shrink-0">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Enviar mensaje directo a @${activeChatUser.username}...`}
                  className="flex-1 bg-[#121824] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#3B6FF0] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`p-2 rounded-lg transition-all shadow-sm ${
                    inputText.trim()
                      ? 'bg-[#3B6FF0] hover:bg-[#2E5EFF] text-white shadow-[#3B6FF0]/20'
                      : 'bg-white/5 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-3 text-slate-400 text-center p-6">
              <MessageSquare className="w-8 h-8 text-slate-600" />
              <p className="text-sm font-medium text-slate-200">Selecciona un contacto</p>
              <p className="text-xs text-slate-400 max-w-xs">
                Inicia una conversación 1 a 1, llamada de voz o videollamada en tiempo real.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* INCOMING CALL MODAL SIMULATION */}
      {incomingCall && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#121824] border border-[#3B6FF0]/50 rounded-2xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl shadow-[#3B6FF0]/20">
            <div className="relative inline-block">
              <img
                src={incomingCall.caller.avatar_url}
                alt={incomingCall.caller.display_name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-[#3B6FF0] animate-bounce"
              />
              <span className="absolute bottom-0 right-0 p-1.5 bg-[#3B6FF0] rounded-full text-white">
                {incomingCall.type === 'video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-lg text-white font-display">{incomingCall.caller.display_name}</h3>
              <p className="text-xs text-[#3B6FF0] font-medium">
                {incomingCall.type === 'video' ? 'Videollamada entrante...' : 'Llamada de voz entrante...'}
              </p>
            </div>

            <div className="flex items-center justify-center space-x-6 pt-2">
              <button
                onClick={rejectIncomingCall}
                className="p-4 rounded-full bg-rose-500/20 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/40 transition-all"
                title="Rechazar llamada"
              >
                <PhoneOff className="w-6 h-6" />
              </button>

              <button
                onClick={acceptIncomingCall}
                className="p-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/30 transition-all animate-pulse"
                title="Aceptar llamada"
              >
                <Phone className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE CALL MODAL (VOICE / VIDEO) */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0A0E14] border border-white/10 rounded-2xl p-5 max-w-md w-full flex flex-col items-center space-y-4 shadow-2xl relative overflow-hidden">
            {/* Header info */}
            <div className="flex items-center justify-between w-full border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-slate-300 font-medium">
                  {activeCall.type === 'video' ? 'Videollamada VIBE' : 'Llamada de voz VIBE'}
                </span>
              </div>
              <span className="text-xs font-mono text-[#3B6FF0] bg-[#3B6FF0]/10 px-2.5 py-1 rounded-md border border-[#3B6FF0]/20">
                {formatCallDuration(callSeconds)}
              </span>
            </div>

            {/* Video / Avatar Canvas Area */}
            <div className="w-full h-56 rounded-xl bg-[#121824] border border-white/10 relative overflow-hidden flex items-center justify-center">
              {activeCall.type === 'video' && !isCameraOff ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="relative">
                    <img
                      src={activeCall.user.avatar_url}
                      alt={activeCall.user.display_name}
                      className="w-20 h-20 rounded-full object-cover ring-2 ring-[#3B6FF0]"
                    />
                    <div className="absolute -bottom-1 -right-1 p-1 bg-[#3B6FF0] rounded-full text-white">
                      <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="font-bold text-sm text-white">{activeCall.user.display_name}</h4>
                    <p className="text-xs text-slate-400">@{activeCall.user.username}</p>
                  </div>
                </div>
              )}

              {/* Status Badge Overlay */}
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] text-slate-200 border border-white/10">
                {activeCall.status === 'calling' ? 'Conectando...' : 'En llamada'}
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center space-x-4 pt-2">
              <button
                onClick={toggleMic}
                className={`p-3 rounded-full transition-all border ${
                  isMicMuted
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : 'bg-white/10 text-white hover:bg-white/20 border-white/10'
                }`}
                title={isMicMuted ? 'Desactivar silencio' : 'Silenciar micrófono'}
              >
                {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {activeCall.type === 'video' && (
                <button
                  onClick={toggleCamera}
                  className={`p-3 rounded-full transition-all border ${
                    isCameraOff
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      : 'bg-white/10 text-white hover:bg-white/20 border-white/10'
                  }`}
                  title={isCameraOff ? 'Encender cámara' : 'Apagar cámara'}
                >
                  {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              )}

              <button
                onClick={endCall}
                className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all"
                title="Finalizar llamada"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
