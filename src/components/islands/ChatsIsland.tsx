import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  MessageSquare, 
  User, 
  ArrowLeft, 
  Circle, 
  Sparkles,
  Users,
  CheckCheck
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

export const ChatsIsland: React.FC<ChatsIslandProps> = ({ initialTargetUser }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeChatUser, setActiveChatUser] = useState<UserProfile | null>(initialTargetUser || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = getActiveUser();

  const loadUsersList = async () => {
    try {
      const allUsers = await apiGetUsers();
      // Filter out current active user
      setUsers(allUsers.filter(u => u.id !== currentUser.id));
      if (!activeChatUser && !initialTargetUser && allUsers.length > 1) {
        const firstOther = allUsers.find(u => u.id !== currentUser.id);
        if (firstOther) setActiveChatUser(firstOther);
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

      // Subscribe to real-time chat sync
      const convId = [currentUser.id, activeChatUser.id].sort().join('_');
      const unsubscribe = subscribeToLocalChannel(`chat_${convId}`, (newMsg: ChatMessage) => {
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        scrollToBottom();
      });

      return () => {
        unsubscribe();
      };
    }
  }, [activeChatUser, currentUser.id]);

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

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Test Switcher Header banner so reviewer can simulate 2-way chat on single screen */}
      <div className="bg-violet-950/40 border border-violet-500/20 rounded-xl p-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <img
            src={currentUser.avatar_url}
            alt={currentUser.display_name}
            className="w-6 h-6 rounded-full object-cover ring-1 ring-violet-400"
          />
          <span className="text-slate-300">
            Chateando como: <strong className="text-violet-300">@{currentUser.username}</strong>
          </span>
        </div>
        
        {/* Quick test user selector */}
        <div className="flex items-center space-x-1">
          <span className="text-[10px] text-slate-400 hidden sm:inline">Cambiar actor:</span>
          {users.map(u => (
            <button
              key={u.id}
              onClick={() => handleSwitchTestUser(u)}
              title={`Simular inicio de sesión como @${u.username}`}
              className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-violet-600/30 text-[10px] text-slate-300 transition-all border border-white/5 hover:border-violet-500/30"
            >
              @{u.username.split('_')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-[360px] overflow-hidden">
        {/* Contacts Sidebar List */}
        <div className={`md:w-56 flex-col space-y-2 border-r border-white/10 pr-2 ${
          activeChatUser ? 'hidden md:flex' : 'flex'
        }`}>
          <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span className="flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-violet-400" />
              <span>Contactos 1 a 1</span>
            </span>
            <span className="bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded-full text-[10px]">
              {users.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {users.map(u => {
              const isSelected = activeChatUser?.id === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => setActiveChatUser(u)}
                  className={`w-full flex items-center space-x-2.5 p-2.5 rounded-xl transition-all text-left ${
                    isSelected
                      ? 'bg-violet-600/25 border border-violet-500/40 text-white shadow-md'
                      : 'hover:bg-white/5 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={u.avatar_url}
                      alt={u.display_name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-xs text-slate-200 truncate">{u.display_name}</h5>
                    <p className="text-[11px] text-slate-400 truncate">@{u.username}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Thread Area */}
        <div className={`flex-1 flex-col justify-between bg-slate-950/60 rounded-2xl border border-white/10 p-3 ${
          !activeChatUser ? 'hidden md:flex' : 'flex'
        }`}>
          {activeChatUser ? (
            <>
              {/* Active Chat Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={() => setActiveChatUser(null)}
                    className="md:hidden p-1.5 rounded-full hover:bg-white/10 text-slate-300"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <img
                    src={activeChatUser.avatar_url}
                    alt={activeChatUser.display_name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-500/30"
                  />
                  <div>
                    <h4 className="font-semibold text-xs text-slate-100">{activeChatUser.display_name}</h4>
                    <p className="text-[10px] text-emerald-400 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span>En línea en VIBE Realtime</span>
                    </p>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 px-2 py-0.5 rounded-full bg-white/5">
                  @{activeChatUser.username}
                </span>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto space-y-3 py-3 px-1 custom-scrollbar max-h-[280px]">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full text-xs text-slate-400 space-x-2">
                    <Sparkles className="w-4 h-4 animate-spin text-violet-400" />
                    <span>Cargando mensajes en tiempo real...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-2 text-slate-400 text-center p-4">
                    <MessageSquare className="w-8 h-8 text-violet-400/50" />
                    <p className="text-xs">No hay mensajes previos con @{activeChatUser.username}</p>
                    <p className="text-[11px] text-slate-500">Envía un saludo para iniciar la conversación 1 a 1</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === currentUser.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed break-words ${
                            isMe
                              ? 'bg-violet-600 text-white rounded-br-none shadow-md shadow-violet-600/20'
                              : 'bg-slate-900 border border-white/10 text-slate-200 rounded-bl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 px-1 flex items-center space-x-1">
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && <CheckCheck className="w-3 h-3 text-violet-300" />}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Send Message Input */}
              <form onSubmit={handleSend} className="flex items-center space-x-2 pt-2 border-t border-white/10">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Enviar mensaje directo a @${activeChatUser.username}...`}
                  className="flex-1 bg-slate-900 border border-white/10 rounded-full px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`p-2.5 rounded-full transition-all shadow-md ${
                    inputText.trim()
                      ? 'bg-violet-600 text-white hover:bg-violet-500 shadow-violet-600/30'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-3 text-slate-400 text-center p-6">
              <MessageSquare className="w-10 h-10 text-violet-400/40" />
              <p className="text-sm font-medium text-slate-200">Selecciona un contacto</p>
              <p className="text-xs text-slate-400 max-w-xs">
                Inicia una conversación 1 a 1 en tiempo real con cualquier usuario de la red VIBE.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
