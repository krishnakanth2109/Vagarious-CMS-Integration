import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Send, Search, Plus, X, Check, Reply, Trash2, Smile,
  Hash, Lock, Megaphone, Users, Settings, ChevronDown, ChevronRight,
  Edit2, MessageSquare, Shield, Crown, Loader2, AlertCircle, Pin,
  MessageCircle, AtSign, ArrowLeft, Menu
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import io from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';

// ── Config ────────────────────────────────────────────────────────────────────
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API_URL  = `${BASE_URL}/api`;

const getAuthHeader = () => {
  try {
    const s = sessionStorage.getItem('currentUser');
    const t = s ? JSON.parse(s)?.idToken : null;
    return { Authorization: `Bearer ${t || ''}`, 'Content-Type': 'application/json' };
  } catch { return { 'Content-Type': 'application/json' }; }
};

const getCurrentUser = () => {
  try { const s = sessionStorage.getItem('currentUser'); return s ? JSON.parse(s) : null; }
  catch { return null; }
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const buildName = (u) => {
  if (!u) return null;
  return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || u.email || null;
};

const fmtFull = (d) => {
  try { return format(new Date(d), 'MMM d, h:mm a'); }
  catch { return ''; }
};

const fmtTime = (d) => {
  try {
    const dt = new Date(d);
    if (isToday(dt))     return format(dt, 'h:mm a');
    if (isYesterday(dt)) return 'Yesterday';
    return format(dt, 'MMM d');
  } catch { return ''; }
};

// Deterministic color from a string — ash-safe palette
const colorOf = (name) => {
  const p = ['#6366f1','#8b5cf6','#0ea5e9','#10b981','#f59e0b','#ef4444','#ec4899','#14b8a6'];
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return p[Math.abs(h) % p.length];
};

const CHANNEL_COLORS = {
  blue:   'bg-blue-500',   purple: 'bg-purple-500', green:  'bg-emerald-500',
  orange: 'bg-orange-500', pink:   'bg-pink-500',   teal:   'bg-teal-500',
  red:    'bg-red-500',    indigo: 'bg-indigo-500',
};

const EMOJIS = ['😀','😂','😍','👍','❤️','🔥','🎉','✅','⚡','💯','🙏','😊','👋','💪','🎯','📌','📝','💡','⭐','🚀','😎','🤔','😅','🤝','📎'];

// ── Avatar ─────────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 'md', src, online = false }) => {
  const sz = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' };
  const bg = colorOf(name || 'U');
  return (
    <div className="relative flex-shrink-0">
      <div className={`${sz[size]} rounded-full flex items-center justify-center text-white font-bold overflow-hidden select-none`}
        style={{ background: bg }}>
        {src ? <img src={src} className="w-full h-full object-cover" alt="" /> : (name || 'U')[0].toUpperCase()}
      </div>
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
      )}
    </div>
  );
};

// ── Channel Icon ───────────────────────────────────────────────────────────────
const ChannelIcon = ({ type, size = 4 }) => {
  const cls = `w-${size} h-${size}`;
  if (type === 'private')      return <Lock className={cls} />;
  if (type === 'announcement') return <Megaphone className={cls} />;
  return <Hash className={cls} />;
};

// ── Emoji Picker ───────────────────────────────────────────────────────────────
const EmojiPicker = ({ onSelect, onClose }) => {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);
  return (
    <div ref={ref} className="absolute bottom-14 left-0 z-50 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 w-72">
      <div className="grid grid-cols-10 gap-0.5">
        {EMOJIS.map(e => (
          <button key={e} onClick={() => onSelect(e)}
            className="text-lg hover:bg-slate-100 rounded p-1 transition-colors">{e}</button>
        ))}
      </div>
    </div>
  );
};

// ── DM Modal — start a direct conversation ────────────────────────────────────
const NewDMModal = ({ allUsers, myId, myRole, existingDMIds, onlineUserIds, onStart, onClose }) => {
  const [search, setSearch] = useState('');
  const available = allUsers.filter(u => {
    const id = (u._id || u.id).toString();
    if (id === myId) return false;
    // Admins share the 'admin' inbox, cannot DM other admins
    if (myRole === 'admin' && u.role === 'admin') return false;
    const n = buildName(u)?.toLowerCase() || '';
    return n.includes(search.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-md sm:rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 select-none">
          <h2 className="text-sm font-bold text-slate-800">New Direct Message</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} autoFocus
              placeholder="Search by name..."
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none" />
          </div>
        </div>
        <div className="flex-1 sm:max-h-72 overflow-y-auto">
          {available.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-400">No users found</div>
          )}
          {available.map(u => {
            const id  = u.role === 'admin' ? 'admin' : (u._id || u.id).toString();
            const n   = buildName(u) || 'User';
            const has = existingDMIds.includes(id);
            const isOnline = onlineUserIds && onlineUserIds.includes(id);
            return (
              <button key={id} onClick={() => { onStart(u); onClose(); }}
                className="flex items-center gap-3 w-full px-5 py-3.5 hover:bg-slate-50 transition-colors text-left min-h-[52px]">
                <Avatar name={n} size="xs" online={isOnline} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{n}</p>
                  <p className="text-[10px] text-slate-400 font-medium capitalize mt-0.5">{u.role}</p>
                </div>
                {has && <span className="text-[9px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-semibold border border-slate-200">Open</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Create / Edit Channel Modal ────────────────────────────────────────────────
const ChannelModal = ({ initial, allUsers, currentUserId, onSave, onClose }) => {
  const isEdit = !!initial?._id;
  const [name,      setName]      = useState(initial?.name || '');
  const [desc,      setDesc]      = useState(initial?.description || '');
  const [type,      setType]      = useState(initial?.type || 'public');
  const [color,     setColor]     = useState(initial?.color || 'blue');
  const [canPost,   setCanPost]   = useState(initial?.canPost || 'all');
  const [memberIds, setMemberIds] = useState(
    initial?.members?.map(m => (m._id || m).toString()) || []
  );
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');

  const filteredUsers = allUsers.filter(u => {
    const n = buildName(u)?.toLowerCase() || '';
    return n.includes(search.toLowerCase()) && (u._id || u.id).toString() !== currentUserId;
  });

  const toggleMember = (id) =>
    setMemberIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSave = async () => {
    if (!name.trim()) { setErr('Channel name is required'); return; }
    setSaving(true);
    try { await onSave({ name, description: desc, type, color, canPost, memberIds }); onClose(); }
    catch (e) { setErr(e.message || 'Failed to save'); }
    finally   { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-lg sm:max-h-[90vh] sm:rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 select-none">
          <h2 className="text-sm font-bold text-slate-800">{isEdit ? 'Edit Channel' : 'Create Channel'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {err && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{err}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Channel Name *</label>
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-[var(--chat-primary)]/20 focus-within:border-[var(--chat-primary)] transition-all">
              <ChannelIcon type={type} size={4} />
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. general, hiring-updates"
                className="flex-1 text-sm outline-none text-slate-800 placeholder-slate-400" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
              placeholder="What's this channel for?"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-[var(--chat-primary)]/20 focus:border-[var(--chat-primary)] transition-all resize-none placeholder-slate-400" />
          </div>

          {/* Type + Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Type</label>
              <select value={type} onChange={e => setType(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none bg-white text-slate-700 focus:ring-2 focus:ring-[var(--chat-primary)]/20 focus:border-[var(--chat-primary)] transition-all min-h-[44px] sm:min-h-[36px]">
                <option value="public">🌐 Public</option>
                <option value="private">🔒 Private</option>
                <option value="announcement">📢 Announcement</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Color</label>
              <div className="flex gap-2 flex-wrap mt-1">
                {Object.entries(CHANNEL_COLORS).map(([k, v]) => (
                  <button key={k} onClick={() => setColor(k)}
                    className={`w-6 h-6 rounded-full ${v} transition-transform ${color === k ? 'scale-125 ring-2 ring-offset-1 ring-slate-400' : 'hover:scale-110'} min-w-[24px] min-h-[24px]`} />
                ))}
              </div>
            </div>
          </div>

          {/* Post permission */}
          {type === 'announcement' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Who can post?</label>
              <select value={canPost} onChange={e => setCanPost(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white text-slate-700 focus:ring-2 focus:ring-[var(--chat-primary)]/20 focus:border-[var(--chat-primary)] transition-all min-h-[44px]">
                <option value="all">Everyone</option>
                <option value="admin_manager">Admins & Managers only</option>
              </select>
            </div>
          )}

          {/* Members */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Members <span className="font-normal text-slate-400">({memberIds.length} selected)</span>
            </label>
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50">
                <Search className="w-4 h-4 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search people..."
                  className="flex-1 text-sm outline-none bg-transparent placeholder-slate-400 text-slate-700" />
              </div>
              <div className="max-h-40 overflow-y-auto">
                {filteredUsers.map(u => {
                  const id  = (u._id || u.id).toString();
                  const n   = buildName(u) || 'User';
                  const sel = memberIds.includes(id);
                  return (
                    <button key={id} onClick={() => toggleMember(id)}
                      className={`flex items-center gap-3 w-full px-4 py-3 transition-colors text-left min-h-[48px] ${sel ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                      <Avatar name={n} size="xs" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-800 truncate">{n}</div>
                        <div className="text-[10px] text-slate-400 font-medium capitalize mt-0.5">{u.role}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                        ${sel ? 'bg-[var(--chat-primary)] border-[var(--chat-primary)]' : 'border-slate-300'}`}>
                        {sel && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-slate-400">No users found</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2.5 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors min-h-[44px] flex items-center justify-center">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Channel'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function TeamsChat({ role: roleProp }) {
  const currentUser = getCurrentUser();
  const myId   = currentUser?.id || currentUser?._id || '';
  const myName = buildName(currentUser) || 'You';
  const role   = roleProp || currentUser?.role || 'recruiter';
  const canManage = role === 'admin' || role === 'manager';
  const myDMId = role === 'admin' ? 'admin' : myId;

  // ── State ──────────────────────────────────────────────────────────────────
  const [channels,        setChannels]        = useState([]);
  const [dms,             setDms]             = useState([]);      // { id, name, role, messages[] }
  const [allUsers,        setAllUsers]        = useState([]);
  const [messages,        setMessages]        = useState([]);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [activeDMId,      setActiveDMId]      = useState(null);   // userId of DM partner
  const [loading,         setLoading]         = useState(true);
  const [msgLoading,      setMsgLoading]      = useState(false);
  const [sending,         setSending]         = useState(false);
  const [onlineUserIds,   setOnlineUserIds]   = useState([]);

  const [text,       setText]       = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmoji,  setShowEmoji]  = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);

  const [sidebarSearch,     setSidebarSearch]     = useState('');
  const [showCreateModal,   setShowCreateModal]   = useState(false);
  const [editingChannel,    setEditingChannel]    = useState(null);
  const [showNewDM,         setShowNewDM]         = useState(false);
  const [channelsPanelOpen, setChannelsPanelOpen] = useState(true);
  const [dmsPanelOpen,      setDmsPanelOpen]      = useState(true);

  const [contextMenu,  setContextMenu]  = useState(null);
  const [deleteConfirm,setDeleteConfirm]= useState(null);
  const [showMembers,  setShowMembers]  = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('dms');

  const socketRef  = useRef(null);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  const { toast } = useToast();

  // ── Refs for socket event listeners to prevent stale closures ──────────────
  const channelsRef = useRef([]);
  const activeChannelIdRef = useRef(null);
  const activeDMIdRef = useRef(null);

  useEffect(() => { channelsRef.current = channels; }, [channels]);
  useEffect(() => { activeChannelIdRef.current = activeChannelId; }, [activeChannelId]);
  useEffect(() => { activeDMIdRef.current = activeDMId; }, [activeDMId]);

  // Request browser Notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // ── Instant Notification Helper ────────────────────────────────────────────
  const notifyMessage = useCallback((msg, isChannel) => {
    // Do not notify on messages sent by ourselves
    if (msg.from === myDMId || msg.senderId === myId) return;

    const isFocused = document.hasFocus();
    const isCurrentChat = isChannel
      ? msg.channelId === activeChannelIdRef.current
      : (msg.from === activeDMIdRef.current || msg.to === activeDMIdRef.current);

    // Skip notifications if the tab is focused and the user is already viewing this chat
    if (isFocused && isCurrentChat) return;

    let title = 'New Message';
    if (isChannel) {
      const ch = channelsRef.current.find(c => c._id === msg.channelId);
      title = `New message in #${ch ? ch.name : 'Channel'}`;
    } else {
      title = `New message from ${msg.senderName || msg.fromName || 'User'}`;
    }

    const body = msg.content;

    // 1. Toast in-app notification
    toast({
      title,
      description: body,
      duration: 4000,
    });

    // 2. Native HTML5 browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
      });
    }
  }, [myId, myDMId, toast]);

  // ── 15-Minute Edit Permission Helper ───────────────────────────────────────
  const canEdit = useCallback((msg) => {
    if (!msg || msg.deletedAt) return false;
    const isMyMsg = (msg.senderId?.toString() === myId) || (msg.from === myDMId);
    if (!isMyMsg) return false;
    const diffMinutes = (Date.now() - new Date(msg.createdAt).getTime()) / 60000;
    return diffMinutes <= 15;
  }, [myId, myDMId]);

  // ── Derived active objects ─────────────────────────────────────────────────
  const activeChannel = useMemo(
    () => channels.find(c => c._id === activeChannelId) || null,
    [channels, activeChannelId]
  );
  const activeDM = useMemo(
    () => dms.find(d => d.id === activeDMId) || null,
    [dms, activeDMId]
  );

  // ── Header info for current view ──────────────────────────────────────────
  const headerInfo = useMemo(() => {
    if (activeChannel) return {
      name: activeChannel.name,
      desc: activeChannel.description,
      type: activeChannel.type,
      color: CHANNEL_COLORS[activeChannel.color] || 'bg-blue-500',
      memberCount: activeChannel.members?.length || 0,
      isDM: false,
    };
    if (activeDM) return {
      name: activeDM.name,
      desc: activeDM.role ? activeDM.role.charAt(0).toUpperCase() + activeDM.role.slice(1) : '',
      type: 'dm',
      color: '',
      memberCount: 2,
      isDM: true,
    };
    return null;
  }, [activeChannel, activeDM]);

  // ── Socket setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    socketRef.current = io(BASE_URL);
    socketRef.current.emit('join_room', myId);
    if (role === 'admin') {
      socketRef.current.emit('join_room', 'admin');
    }

    socketRef.current.on('online_users', (userIds) => {
      setOnlineUserIds(userIds);
    });

    // Channel messages
    socketRef.current.on('channel_message', (msg) => {
      if (msg.channelId === activeChannelIdRef.current) {
        setMessages(prev => prev.find(m => m._id === msg._id) ? prev : [...prev, msg]);

        // Since the channel is open, mark it as read immediately on the backend
        if (msg.senderId !== myId) {
          fetch(`${API_URL}/messages/${msg._id}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify({ read: true }),
          }).catch(e => console.error('Failed to mark real-time channel message as read:', e));
        }
      }
      setChannels(prev => prev.map(ch =>
        ch._id === msg.channelId
          ? {
              ...ch,
              lastMessage: msg.content,
              lastMessageAt: msg.createdAt,
              unreadCount: (ch._id !== activeChannelIdRef.current && msg.senderId !== myId)
                ? (ch.unreadCount || 0) + 1
                : 0
            }
          : ch
      ));
      notifyMessage(msg, true);
    });

    // DM messages (via legacy receive_message)
    socketRef.current.on('receive_message', (msg) => {
      const partnerId = msg.from === myDMId ? msg.to : msg.from;
      // Add to DM thread if open
      if (activeDMIdRef.current && (partnerId === activeDMIdRef.current || msg.from === activeDMIdRef.current)) {
        setMessages(prev => prev.find(m => m._id === msg._id) ? prev : [...prev, msg]);

        // Since the chat is open, mark it as read immediately on the backend
        if (msg.to === myDMId && !msg.read) {
          fetch(`${API_URL}/messages/${msg._id}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify({ read: true }),
          }).catch(e => console.error('Failed to mark real-time message as read:', e));
        }
      }
      // Update DM sidebar preview
      setDms(prev => {
        const exists = prev.find(d => d.id === partnerId);
        if (exists) {
          return prev.map(d => d.id === partnerId
            ? {
                ...d,
                lastMessage: msg.content,
                lastMessageAt: msg.createdAt,
                unread: d.id !== activeDMIdRef.current ? (d.unread || 0) + 1 : 0,
                name: (partnerId === 'admin' && msg.senderName && msg.senderName !== 'Admin') ? msg.senderName : d.name
              }
            : d
          );
        }
        return prev;
      });
      notifyMessage(msg, false);
    });

    socketRef.current.on('channel_created', (ch) => {
      setChannels(prev => prev.find(c => c._id === ch._id) ? prev : [ch, ...prev]);
    });
    socketRef.current.on('channel_updated', (ch) => {
      setChannels(prev => prev.map(c => c._id === ch._id ? ch : c));
    });
    socketRef.current.on('channel_deleted', ({ id }) => {
      setChannels(prev => prev.filter(c => c._id !== id));
      if (activeChannelIdRef.current === id) setActiveChannelId(null);
    });

    socketRef.current.on('message_deleted', ({ id }) => {
      setMessages(prev => prev.map(m =>
        m._id === id ? { ...m, deletedAt: new Date().toISOString(), content: 'This message was deleted' } : m
      ));
    });

    socketRef.current.on('message_updated', ({ id, content, edited, updatedAt }) => {
      setMessages(prev => prev.map(m =>
        m._id === id ? { ...m, content, edited, updatedAt } : m
      ));
    });

    return () => { if (socketRef.current) socketRef.current.disconnect(); };
  }, [myId, role, myDMId, notifyMessage]);

  // ── Fetch initial data ────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [chRes, usrRes, msgRes] = await Promise.all([
          fetch(`${API_URL}/channels`,            { headers: getAuthHeader() }),
          fetch(`${API_URL}/recruiters?view=lookup`, { headers: getAuthHeader() }),
          fetch(`${API_URL}/messages`,             { headers: getAuthHeader() }),
        ]);
        if (chRes.ok)  setChannels(await chRes.json());
        if (usrRes.ok) {
          const users = await usrRes.json();
          setAllUsers(Array.isArray(users) ? users : []);
        }
        // Build DM list from legacy messages
        if (msgRes.ok) {
          const msgs = await msgRes.json();
          buildDMList(msgs);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // Build DM sidebar entries from message history
  const buildDMList = (msgs) => {
    const map = new Map();
    // Sort chronologically so we process messages from oldest to newest
    const sorted = [...msgs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    sorted.forEach(m => {
      if (m.channelId) return; // skip channel messages
      const otherId   = m.from === myDMId ? m.to : m.from;
      const otherName = m.from === myDMId ? (m.toName || otherId) : (m.fromName || otherId);
      if (!otherId || otherId === myDMId || otherId === 'all') return;
      if (!map.has(otherId)) {
        map.set(otherId, {
          id: otherId,
          name: otherName,
          lastMessage: m.content,
          lastMessageAt: m.createdAt,
          unread: 0,
          adminSenderName: (otherId === 'admin' && m.from === 'admin') ? (m.senderName || m.fromName) : ''
        });
      } else {
        const cur = map.get(otherId);
        cur.lastMessage = m.content;
        cur.lastMessageAt = m.createdAt;
        if (otherId === 'admin' && m.from === 'admin' && (m.senderName || m.fromName)) {
          cur.adminSenderName = m.senderName || m.fromName;
        }
      }
      if (m.to === myDMId && !m.read) map.get(otherId).unread++;
    });

    const list = Array.from(map.values()).map(d => {
      if (d.id === 'admin' && d.adminSenderName && d.adminSenderName !== 'Admin') {
        return { ...d, name: d.adminSenderName };
      }
      return d;
    });

    setDms(list.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)));
  };

  // ── Load channel messages ─────────────────────────────────────────────────
  useEffect(() => {
    if (!activeChannelId) return;
    setActiveDMId(null);
    const load = async () => {
      setMsgLoading(true);
      try {
        const res = await fetch(`${API_URL}/channels/${activeChannelId}/messages`, { headers: getAuthHeader() });
        if (res.ok) setMessages(await res.json());
        if (socketRef.current) socketRef.current.emit('join_room', `channel_${activeChannelId}`);
      } catch (e) { console.error(e); }
      finally { setMsgLoading(false); }
    };
    load();
  }, [activeChannelId]);

  // ── Load DM messages ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeDMId) return;
    setActiveChannelId(null);
    const load = async () => {
      setMsgLoading(true);
      try {
        const res = await fetch(`${API_URL}/messages`, { headers: getAuthHeader() });
        if (res.ok) {
          const all = await res.json();
          const thread = all.filter(m =>
            !m.channelId && (
              (m.from === myDMId && m.to === activeDMId) ||
              (m.from === activeDMId && m.to === myDMId)
            )
          ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          setMessages(thread);
          // Clear unread in state
          setDms(prev => prev.map(d => d.id === activeDMId ? { ...d, unread: 0 } : d));

          // Mark incoming unread messages as read in the database
          const unreadIncoming = thread.filter(m => m.to === myDMId && !m.read);
          unreadIncoming.forEach(async (m) => {
            try {
              await fetch(`${API_URL}/messages/${m._id}`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({ read: true }),
              });
            } catch (err) {
              console.error('Failed to mark message as read on load:', err);
            }
          });
        }
      } catch (e) { console.error(e); }
      finally { setMsgLoading(false); }
    };
    load();
  }, [activeDMId, myDMId]);

  // ── Auto scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannelId, activeDMId]);

  // ── Close context menu ────────────────────────────────────────────────────
  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener('scroll', close, true);
    window.addEventListener('click', close);
    return () => { window.removeEventListener('scroll', close, true); window.removeEventListener('click', close); };
  }, []);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!text.trim()) return;
    if (!activeChannelId && !activeDMId) return;
    setSending(true);

    if (editingMessage) {
      const sentText = text.trim();
      try {
        const res = await fetch(`${API_URL}/messages/${editingMessage._id}`, {
          method: 'PUT',
          headers: getAuthHeader(),
          body: JSON.stringify({ content: sentText }),
        });
        if (!res.ok) {
          const errData = await res.json();
          toast({
            title: 'Error editing message',
            description: errData.message || 'Edit failed',
            variant: 'destructive',
          });
          throw new Error('Edit failed');
        }
        const updated = await res.json();
        setMessages(prev => prev.map(m => m._id === editingMessage._id ? updated : m));
        if (socketRef.current) {
          socketRef.current.emit('message_updated', {
            id: editingMessage._id,
            content: sentText,
            edited: true,
            updatedAt: updated.updatedAt,
            channelId: activeChannelId,
            to: activeDMId
          });
        }
        setEditingMessage(null);
        setText('');
      } catch (e) {
        console.error(e);
      } finally {
        setSending(false);
      }
      return;
    }

    const optimisticId = `opt_${Date.now()}`;
    const isChannel = !!activeChannelId;

    // Optimistic message
    const optimistic = isChannel
      ? { _id: optimisticId, channelId: activeChannelId, senderId: myId, senderName: myName,
          content: text.trim(), type: 'text', replyTo: replyingTo?._id || null,
          replyPreview: replyingTo?.content?.slice(0, 60) || '',
          createdAt: new Date().toISOString(), _optimistic: true }
      : { _id: optimisticId, from: myDMId, to: activeDMId, content: text.trim(),
          fromName: myName, createdAt: new Date().toISOString(), _optimistic: true };

    setMessages(prev => [...prev, optimistic]);
    const sentText = text.trim();
    setText('');
    setReplyingTo(null);

    try {
      let saved;
      if (isChannel) {
        const res = await fetch(`${API_URL}/channels/${activeChannelId}/messages`, {
          method: 'POST', headers: getAuthHeader(),
          body: JSON.stringify({ content: sentText, replyTo: replyingTo?._id || null, replyPreview: replyingTo?.content?.slice(0, 60) || '' }),
        });
        if (!res.ok) throw new Error('Send failed');
        saved = await res.json();
        if (socketRef.current) socketRef.current.emit('channel_message', { ...saved, to: `channel_${activeChannelId}` });
        setChannels(prev => prev.map(ch =>
          ch._id === activeChannelId ? { ...ch, lastMessage: saved.content, lastMessageAt: saved.createdAt } : ch
        ));
      } else {
        // DM via legacy messages endpoint
        const res = await fetch(`${API_URL}/messages`, {
          method: 'POST', headers: getAuthHeader(),
          body: JSON.stringify({ to: activeDMId, subject: 'Direct Message', content: sentText }),
        });
        if (!res.ok) throw new Error('Send failed');
        saved = await res.json();
        if (socketRef.current) socketRef.current.emit('send_message', { ...saved, to: activeDMId });
        setDms(prev => prev.map(d =>
          d.id === activeDMId ? { ...d, lastMessage: sentText, lastMessageAt: saved.createdAt } : d
        ));
      }
      setMessages(prev => prev.map(m => m._id === optimisticId ? saved : m));
    } catch {
      setMessages(prev => prev.filter(m => m._id !== optimisticId));
      setText(sentText);
    } finally {
      setSending(false);
    }
  }, [text, activeChannelId, activeDMId, myId, myDMId, myName, replyingTo, editingMessage, toast]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Start a new DM ────────────────────────────────────────────────────────
  const handleStartDM = (user) => {
    const id = user.role === 'admin' ? 'admin' : (user._id || user.id).toString();
    const n  = buildName(user) || 'User';
    setDms(prev => {
      const exists = prev.find(d => d.id === id);
      if (!exists) {
        return [{ id, name: n, role: user.role, lastMessage: '', lastMessageAt: new Date().toISOString(), unread: 0 }, ...prev];
      }
      return prev;
    });
    setActiveDMId(id);
  };

  // ── Delete message ────────────────────────────────────────────────────────
  const handleDeleteMsg = async (id) => {
    try {
      if (activeChannelId) {
        const res = await fetch(`${API_URL}/channels/${activeChannelId}/messages/${id}`, {
          method: 'DELETE', headers: getAuthHeader(),
        });
        if (res.ok) {
          const d = await res.json();
          setMessages(prev => prev.map(m =>
            m._id === id ? { ...m, deletedAt: d.deletedAt || new Date().toISOString(), content: 'This message was deleted' } : m
          ));
          if (socketRef.current) {
            socketRef.current.emit('message_deleted', { id, channelId: activeChannelId });
          }
        }
      } else {
        const res = await fetch(`${API_URL}/messages/${id}`, { method: 'DELETE', headers: getAuthHeader() });
        if (res.ok) {
          const d = await res.json();
          setMessages(prev => prev.map(m =>
            m._id === id ? { ...m, deletedAt: d.deletedAt || new Date().toISOString(), content: 'This message was deleted' } : m
          ));
          if (socketRef.current) {
            socketRef.current.emit('message_deleted', { id, to: activeDMId });
          }
        }
      }
    } catch (e) { console.error(e); }
    setDeleteConfirm(null);
  };

  const handleCreateChannel = async (data) => {
    const res = await fetch(`${API_URL}/channels`, {
      method: 'POST', headers: getAuthHeader(), body: JSON.stringify(data),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
    const ch = await res.json();
    setChannels(prev => [ch, ...prev]);
    setActiveChannelId(ch._id);
    if (socketRef.current) socketRef.current.emit('channel_created', ch);
  };

  const handleEditChannel = async (data) => {
    const res = await fetch(`${API_URL}/channels/${editingChannel._id}`, {
      method: 'PUT', headers: getAuthHeader(), body: JSON.stringify(data),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
    const updated = await res.json();
    setChannels(prev => prev.map(c => c._id === updated._id ? updated : c));
    if (socketRef.current) socketRef.current.emit('channel_updated', updated);
  };

  const handleDeleteChannel = async (id) => {
    if (!confirm('Delete this channel and all its messages? This cannot be undone.')) return;
    const res = await fetch(`${API_URL}/channels/${id}`, { method: 'DELETE', headers: getAuthHeader() });
    if (res.ok) {
      setChannels(prev => prev.filter(c => c._id !== id));
      if (activeChannelId === id) { setActiveChannelId(null); setMessages([]); }
      if (socketRef.current) socketRef.current.emit('channel_deleted', { id });
    }
  };

  const handleContextMenu = (e, msg) => {
    e.preventDefault(); e.stopPropagation();
    const x = Math.min(e.clientX, window.innerWidth - 200);
    const y = Math.min(e.clientY, window.innerHeight - 180);
    setContextMenu({ x, y, msg });
  };

  // ── Derived helpers ────────────────────────────────────────────────────────
  const filteredChannels = channels.filter(ch =>
    ch.name.toLowerCase().includes(sidebarSearch.toLowerCase())
  );
  const filteredDMs = dms.filter(d =>
    d.name.toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  const isOwner   = (msg) => (msg.senderId?.toString() === myId) || (msg.from === myDMId);
  const canDelete = (msg) => canManage || isOwner(msg);
  const canPost   = (ch)  => !ch || ch.canPost !== 'admin_manager' || canManage;

  const totalUnread = dms.reduce((s, d) => s + (d.unread || 0), 0);

  const channelMembers = useMemo(() => {
    if (!activeChannel) return [];
    return (activeChannel.members || []).map(m => {
      const user = allUsers.find(u => (u._id || u.id).toString() === (m._id || m).toString());
      return user || m;
    });
  }, [activeChannel, allUsers]);

  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDate = null;
    messages.forEach(msg => {
      const d = format(new Date(msg.createdAt), 'yyyy-MM-dd');
      if (d !== currentDate) {
        currentDate = d;
        groups.push({ type: 'date', date: msg.createdAt, id: `date_${d}` });
      }
      groups.push({ type: 'msg', msg });
    });
    return groups;
  }, [messages]);

  const existingDMIds = dms.map(d => d.id);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-[calc(125vh-12rem)] md:h-[calc(125vh-10rem)] w-full items-center justify-center bg-slate-50"
        style={{
          '--chat-primary': '#3b82f6',
          '--chat-primary-hover': '#2563eb',
        }}
      >
        <div className="flex flex-col items-center gap-3 animate-in fade-in duration-300">
          <div className="w-10 h-10 rounded-xl bg-[var(--chat-primary)] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <MessageSquare className="w-5 h-5 text-white animate-pulse" />
          </div>
          <p className="text-xs text-slate-400 font-semibold tracking-wide">Loading...</p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(125vh-12rem)] md:h-[calc(125vh-10rem)] w-full bg-[var(--chat-bg)] overflow-hidden relative select-none"
      style={{
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        '--chat-primary': '#3b82f6',
        '--chat-primary-hover': '#2563eb',
        '--chat-bg': '#f8fafc',
        '--chat-surface': '#ffffff',
        '--chat-border': '#e2e8f0',
        '--chat-text': '#0f172a',
        '--chat-text-muted': '#64748b',
        '--chat-sidebar-bg': '#f8fafc'
      }}
    >
      {/* ── Modals ───────────────────────────────────────────────────────── */}
      {showCreateModal && (
        <ChannelModal allUsers={allUsers} currentUserId={myId}
          onSave={handleCreateChannel} onClose={() => setShowCreateModal(false)} />
      )}
      {editingChannel && (
        <ChannelModal initial={editingChannel} allUsers={allUsers} currentUserId={myId}
          onSave={handleEditChannel} onClose={() => setEditingChannel(null)} />
      )}
      {showNewDM && (
        <NewDMModal allUsers={allUsers} myId={myId} myRole={role} existingDMIds={existingDMIds}
          onlineUserIds={onlineUserIds} onStart={handleStartDM} onClose={() => setShowNewDM(false)} />
      )}

      {/* Delete confirm dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-[var(--chat-text)]">Delete message?</p>
                <p className="text-xs text-[var(--chat-text-muted)]">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-2.5 justify-end">
              <button onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px] sm:min-h-[36px] flex items-center justify-center">
                Cancel
              </button>
              <button onClick={() => handleDeleteMsg(deleteConfirm)}
                className="px-4 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors min-h-[44px] sm:min-h-[36px] flex items-center justify-center shadow-sm">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <>
          {/* Backdrop on mobile/tablet to easily close the context menu on click-away */}
          <div onClick={() => setContextMenu(null)} className="fixed inset-0 z-40 bg-black/10 backdrop-blur-xs sm:hidden" />
          
          <div
            style={window.innerWidth < 640 ? {
              position: 'fixed',
              bottom: '24px',
              left: '24px',
              right: '24px',
              zIndex: 50
            } : {
              position: 'fixed',
              top: contextMenu.y,
              left: contextMenu.x,
              zIndex: 50
            }}
            className="bg-white rounded-2xl shadow-lg border border-[var(--chat-border)] overflow-hidden min-w-[160px] py-1 animate-in slide-in-from-bottom-5 sm:slide-in-from-top-2 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => { setReplyingTo(contextMenu.msg); inputRef.current?.focus(); setContextMenu(null); }}
              className="flex items-center gap-3 w-full px-4 py-3 sm:py-2.5 text-sm text-[var(--chat-text)] hover:bg-slate-50 transition-colors min-h-[44px] sm:min-h-[36px] text-left">
              <Reply className="w-4 h-4 text-slate-400" /> Reply
            </button>
            {canEdit(contextMenu.msg) && (
              <button onClick={() => { setEditingMessage(contextMenu.msg); setText(contextMenu.msg.content); inputRef.current?.focus(); setContextMenu(null); }}
                className="flex items-center gap-3 w-full px-4 py-3 sm:py-2.5 text-sm text-[var(--chat-text)] hover:bg-slate-50 transition-colors min-h-[44px] sm:min-h-[36px] text-left">
                <Edit2 className="w-4 h-4 text-slate-400" /> Edit Message
              </button>
            )}
            {canDelete(contextMenu.msg) && (
              <>
                <div className="my-1 border-t border-[var(--chat-border)]" />
                <button onClick={() => { setDeleteConfirm(contextMenu.msg._id); setContextMenu(null); }}
                  className="flex items-center gap-3 w-full px-4 py-3 sm:py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors min-h-[44px] sm:min-h-[36px] text-left">
                  <Trash2 className="w-4 h-4 text-red-400" /> Delete
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* Backdrop for mobile sidebar drawer */}
      {mobileSidebarOpen && (
        <div onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-xs lg:hidden" />
      )}
      
      {/* Backdrop for mobile/tablet members drawer */}
      {showMembers && !headerInfo?.isDM && (
        <div onClick={() => setShowMembers(false)}
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-xs lg:hidden" />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          LEFT SIDEBAR
      ════════════════════════════════════════════════════════════════════ */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-72 bg-[var(--chat-sidebar-bg)] border-r border-[var(--chat-border)] flex flex-col transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:w-64
          ${mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
          ${(!activeChannelId && !activeDMId) ? 'translate-x-0 w-full sm:w-64 lg:w-64' : ''}
        `}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-[var(--chat-border)] bg-[var(--chat-surface)] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-[var(--chat-primary)] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-500/20">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[var(--chat-text)] leading-none truncate">Team Chat</p>
              <p className="text-[10px] text-[var(--chat-text-muted)] mt-0.5 capitalize leading-none font-medium truncate">{role}</p>
            </div>
          </div>
          {canManage && (
            <button onClick={() => setShowCreateModal(true)}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500 hover:text-slate-700 min-h-[44px] sm:min-h-[32px] min-w-[44px] sm:min-w-[32px]"
              title="Create channel">
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Me chip */}
        <div className="px-3 py-2 border-b border-[var(--chat-border)] bg-[var(--chat-surface)] select-none">
          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-[var(--chat-border)]">
            <Avatar name={myName} size="sm" online />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[var(--chat-text)] truncate leading-none">{myName}</p>
              <p className="text-[10px] text-[var(--chat-text-muted)] capitalize mt-0.5 leading-none font-medium">{role}</p>
            </div>
            {canManage && <Shield className="w-3.5 h-3.5 text-[var(--chat-primary)] flex-shrink-0" title="Admin / Manager" />}
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-[var(--chat-border)] bg-[var(--chat-surface)]">
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-2.5 py-1.5 border border-[var(--chat-border)] focus-within:bg-white focus-within:ring-2 focus-within:ring-[var(--chat-primary)]/20 focus-within:border-[var(--chat-primary)] transition-all">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input value={sidebarSearch} onChange={e => setSidebarSearch(e.target.value)}
              placeholder="Search..."
              className="flex-1 bg-transparent text-xs text-[var(--chat-text)] placeholder-slate-400 outline-none" />
            {sidebarSearch && (
              <button onClick={() => setSidebarSearch('')} className="text-slate-400 hover:text-slate-600 min-h-[44px] sm:min-h-[32px] flex items-center justify-center">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-3 py-1.5 border-b border-[var(--chat-border)] bg-[var(--chat-surface)] flex gap-1.5 select-none">
          <button
            onClick={() => setSidebarTab('dms')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative min-h-[36px]
              ${sidebarTab === 'dms'
                ? 'bg-[var(--chat-primary)]/10 text-[var(--chat-primary)] font-bold'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-semibold'}`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Chats
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--chat-primary)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm shadow-blue-500/10 leading-none">
                {totalUnread}
              </span>
            )}
          </button>
          <button
            onClick={() => setSidebarTab('groups')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[36px]
              ${sidebarTab === 'groups'
                ? 'bg-[var(--chat-primary)]/10 text-[var(--chat-primary)] font-bold'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-semibold'}`}
          >
            <Hash className="w-3.5 h-3.5" />
            Groups
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
          {sidebarTab === 'groups' ? (
            <div className="space-y-0.5 px-2">
              {filteredChannels.length === 0 ? (
                <div className="px-3 py-6 text-center select-none">
                  <Hash className="w-5 h-5 text-slate-300 mx-auto mb-1" />
                  <p className="text-[11px] text-[var(--chat-text-muted)]">{canManage ? 'Create your first channel' : 'No channels yet'}</p>
                </div>
              ) : filteredChannels.map(ch => {
                const isActive = ch._id === activeChannelId;
                const colorCls = CHANNEL_COLORS[ch.color] || 'bg-blue-500';
                return (
                  <div key={ch._id}
                    className={`group relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all min-h-[44px] sm:min-h-[36px]
                      ${isActive ? 'bg-[var(--chat-primary)]/10 text-[var(--chat-primary)] font-semibold' : 'hover:bg-slate-200/50 text-[var(--chat-text-muted)] hover:text-[var(--chat-text)] font-medium'}`}
                    onClick={() => {
                      setActiveChannelId(ch._id);
                      setActiveDMId(null);
                      setChannels(prev => prev.map(c => c._id === ch._id ? { ...c, unreadCount: 0 } : c));
                      setMobileSidebarOpen(false);
                    }}>
                    {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[var(--chat-primary)] rounded-r" />}
                    <div className={`w-6 h-6 ${colorCls} rounded-md flex items-center justify-center flex-shrink-0 shadow-sm text-white`}>
                      <ChannelIcon type={ch.type} size={3} />
                    </div>
                    <div className="flex-1 min-w-0 ml-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="text-[13px] truncate">{ch.name}</span>
                          {ch.pinned && <Pin className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />}
                        </div>
                        {ch.unreadCount > 0 && (
                          <span className="flex-shrink-0 bg-[var(--chat-primary)] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm shadow-blue-500/10 leading-none">
                            {ch.unreadCount > 9 ? '9+' : ch.unreadCount}
                          </span>
                        )}
                      </div>
                      {ch.lastMessage && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{ch.lastMessage}</p>
                      )}
                    </div>
                    {canManage && (
                      <div className="hidden group-hover:flex items-center gap-0.5 absolute right-2 bg-[var(--chat-surface)] rounded-md border border-[var(--chat-border)] shadow-sm px-0.5 z-10">
                        <button onClick={e => { e.stopPropagation(); setEditingChannel(ch); }}
                          className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-[var(--chat-primary)] hover:bg-slate-100 transition-colors">
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); handleDeleteChannel(ch._id); }}
                          className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-5 transition-colors">
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {canManage && (
                <button onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 w-full px-2.5 py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/40 rounded-lg transition-colors text-xs font-semibold min-h-[44px] sm:min-h-[28px]">
                  <div className="w-4 h-4 border border-dashed border-slate-400 rounded flex items-center justify-center">
                    <Plus className="w-2.5 h-2.5" />
                  </div>
                  Add a channel
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-0.5 px-2">
              {filteredDMs.length === 0 ? (
                <div className="px-3 py-6 text-center select-none">
                  <MessageCircle className="w-5 h-5 text-slate-300 mx-auto mb-1" />
                  <p className="text-[11px] text-[var(--chat-text-muted)]">No direct messages yet</p>
                  <button onClick={() => setShowNewDM(true)}
                    className="text-xs text-[var(--chat-primary)] hover:underline font-semibold mt-1 transition-colors min-h-[44px] sm:min-h-[20px]">
                    Start a conversation
                  </button>
                </div>
              ) : filteredDMs.map(dm => {
                const isActive = dm.id === activeDMId;
                return (
                  <div key={dm.id}
                    className={`group relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all min-h-[44px] sm:min-h-[36px]
                      ${isActive ? 'bg-[var(--chat-primary)]/10 text-[var(--chat-primary)] font-semibold' : 'hover:bg-slate-200/50 text-[var(--chat-text-muted)] hover:text-[var(--chat-text)] font-medium'}`}
                    onClick={() => {
                      setActiveDMId(dm.id);
                      setActiveChannelId(null);
                      setMobileSidebarOpen(false);
                    }}>
                    {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[var(--chat-primary)] rounded-r" />}
                    <Avatar name={dm.name} size="xs" online={onlineUserIds.includes(dm.id)} />
                    <div className="flex-1 min-w-0 ml-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[13px] truncate">{dm.name}</span>
                        {dm.unread > 0 && (
                          <span className="flex-shrink-0 bg-[var(--chat-primary)] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm shadow-blue-500/10 leading-none">
                            {dm.unread > 9 ? '9+' : dm.unread}
                          </span>
                        )}
                      </div>
                      {dm.lastMessage && (
                        <p className={`text-[11px] truncate mt-0.5 ${dm.unread > 0 ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                          {dm.lastMessage}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              <button onClick={() => setShowNewDM(true)}
                className="flex items-center gap-2 w-full px-2.5 py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/40 rounded-lg transition-colors text-xs font-semibold min-h-[44px] sm:min-h-[28px]">
                <div className="w-4 h-4 border border-dashed border-slate-400 rounded flex items-center justify-center">
                  <Plus className="w-2.5 h-2.5" />
                </div>
                New message
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          MAIN CHAT AREA
      ════════════════════════════════════════════════════════════════════ */}
      <div
        className={`flex-1 flex flex-col min-w-0 bg-[var(--chat-surface)] h-full transition-all duration-300
          ${(!activeChannelId && !activeDMId) ? 'hidden sm:flex' : 'flex'}
        `}
      >
        {headerInfo ? (
          <>
            {/* Chat Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-[var(--chat-surface)] border-b border-[var(--chat-border)] shadow-xs select-none">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Back button for tablet/mobile */}
                <button
                  onClick={() => {
                    setActiveChannelId(null);
                    setActiveDMId(null);
                  }}
                  className="lg:hidden p-1.5 -ml-1 rounded-full text-slate-500 hover:bg-slate-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Hamburger menu for tablets to show sidebar drawer */}
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="hidden sm:inline-block lg:hidden p-1.5 rounded-full text-slate-500 hover:bg-slate-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {headerInfo.isDM ? (
                  <Avatar name={headerInfo.name} size="sm" online={onlineUserIds.includes(activeDMId)} />
                ) : (
                  <div className={`w-8 h-8 ${headerInfo.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm text-white`}>
                    <ChannelIcon type={headerInfo.type} size={3.5} />
                  </div>
                )}
                <div className="min-w-0 ml-0.5">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-[15px] font-bold text-[var(--chat-text)] truncate">{headerInfo.name}</h2>
                    {headerInfo.type === 'private' && (
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-semibold border border-slate-200">Private</span>
                    )}
                    {headerInfo.type === 'announcement' && (
                      <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold border border-amber-200">Announcements</span>
                    )}
                    {headerInfo.isDM && (
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-semibold border border-slate-200">Direct Message</span>
                    )}
                  </div>
                  {headerInfo.desc && (
                    <p className="text-[11px] text-[var(--chat-text-muted)] truncate mt-0.5 leading-none font-medium">{headerInfo.desc}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {!headerInfo.isDM && (
                  <button onClick={() => setShowMembers(v => !v)}
                    className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border min-h-[44px] sm:min-h-[32px]
                      ${showMembers ? 'bg-[var(--chat-primary)]/10 text-[var(--chat-primary)] border-[var(--chat-primary)]/20' : 'text-slate-500 hover:bg-slate-100 border-transparent'}`}>
                    <Users className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{headerInfo.memberCount}</span>
                  </button>
                )}
                {canManage && activeChannel && (
                  <button onClick={() => setEditingChannel(activeChannel)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-transparent min-h-[44px] sm:min-h-[32px] min-w-[44px] sm:min-w-[32px] flex items-center justify-center"
                    title="Channel settings">
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
              {/* Messages Container */}
              <div className="flex-1 flex flex-col overflow-hidden relative">
                <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar" style={{ background: 'var(--chat-bg)' }}>
                  {msgLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 animate-spin text-[var(--chat-primary)]" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
                      {headerInfo.isDM ? (
                        <>
                          <Avatar name={headerInfo.name} size="lg" />
                          <div className="text-center">
                            <p className="font-bold text-[var(--chat-text)] text-base">{headerInfo.name}</p>
                            <p className="text-xs text-[var(--chat-text-muted)] mt-1">This is the beginning of your conversation.</p>
                            <p className="text-xs text-[var(--chat-text-muted)] font-medium">Say hi! 👋</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={`w-12 h-12 ${headerInfo.color} rounded-2xl flex items-center justify-center text-white shadow-sm shadow-blue-500/10`}>
                            <ChannelIcon type={headerInfo.type} size={5} />
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-[var(--chat-text)] text-base">#{headerInfo.name}</p>
                            {activeChannel?.description && (
                              <p className="text-xs text-[var(--chat-text-muted)] mt-1">{activeChannel.description}</p>
                            )}
                            <p className="text-xs text-[var(--chat-text-muted)] mt-1 font-medium">
                              {canPost(activeChannel)
                                ? 'Be the first to send a message!'
                                : 'Only admins & managers can post here.'}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {(() => {
                        let lastSenderId = null;
                        let lastTime = null;
                        return groupedMessages.map((item) => {
                          if (item.type === 'date') {
                            lastSenderId = null;
                            lastTime = null;
                            const lbl = isToday(new Date(item.date)) ? 'Today'
                              : isYesterday(new Date(item.date)) ? 'Yesterday'
                              : format(new Date(item.date), 'MMMM d, yyyy');
                            return (
                              <div key={item.id} className="flex items-center gap-3 py-3 select-none">
                                <div className="flex-1 h-px bg-slate-200/60" />
                                <span className="text-[10px] text-slate-400 font-semibold px-2.5 py-0.5 bg-white rounded-full border border-slate-200/60 whitespace-nowrap shadow-sm">{lbl}</span>
                                <div className="flex-1 h-px bg-slate-200/60" />
                              </div>
                            );
                          }

                          const { msg } = item;
                          const isMine   = isOwner(msg);
                          const isDeleted = !!msg.deletedAt;
                          const isSystem  = msg.type === 'system';
                          const senderN   = msg.senderName || (isMine ? myName : (msg.fromName || 'Unknown'));
                          const senderCol = colorOf(senderN);

                          if (isSystem) {
                            lastSenderId = null;
                            lastTime = null;
                            return (
                              <div key={msg._id} className="flex items-center justify-center py-2 select-none">
                                <span className="text-[10px] text-slate-400 bg-white/80 px-2.5 py-0.5 rounded-full border border-slate-200/60 shadow-sm">{msg.content}</span>
                              </div>
                            );
                          }

                          const currentSenderId = msg.senderId?.toString() || msg.from;
                          const isConsecutive = !isDeleted && (
                            currentSenderId === lastSenderId &&
                            lastTime && (new Date(msg.createdAt).getTime() - new Date(lastTime).getTime()) < 300000
                          );

                          lastSenderId = currentSenderId;
                          lastTime = msg.createdAt;

                          return (
                            <div key={msg._id}
                              className={`group flex items-start gap-2.5 px-2 transition-colors relative
                                ${isMine ? 'flex-row-reverse' : 'flex-row'}
                                ${isConsecutive ? 'py-0.5 mt-0' : 'py-1.5 mt-2'}
                                ${isDeleted ? 'opacity-50' : ''}`}
                              onContextMenu={isDeleted ? undefined : (e) => handleContextMenu(e, msg)}>
                              
                              {/* Avatar Column */}
                              <div className="w-8 sm:w-9 flex-shrink-0 flex items-start justify-center select-none mt-1">
                                {isConsecutive ? (
                                  <div className="w-8 sm:w-9" />
                                ) : (
                                  <Avatar name={senderN} size="sm" online={onlineUserIds.includes(currentSenderId)} />
                                )}
                              </div>

                              {/* Content Column */}
                              <div className={`flex flex-col max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
                                {!isConsecutive && (
                                  <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400 font-semibold select-none">
                                    {!isMine && <span className="font-bold" style={{ color: senderCol }}>{senderN}</span>}
                                    <span>{fmtFull(msg.createdAt)}</span>
                                    {msg.edited && <span className="italic font-normal">(edited)</span>}
                                    {msg._optimistic && <span className="italic">sending…</span>}
                                  </div>
                                )}

                                <div className={`text-[15px] leading-relaxed break-words whitespace-pre-wrap rounded-2xl shadow-xs transition-shadow relative overflow-hidden flex flex-col
                                  ${isDeleted ? 'text-slate-400 italic bg-slate-100 border border-slate-200 px-3.5 py-2' : ''}
                                  ${!isDeleted && isMine 
                                    ? 'bg-[var(--chat-primary)] text-white rounded-tr-none border border-transparent' 
                                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-xs'}`}
                                >
                                  {/* Reply preview inside the bubble */}
                                  {!isConsecutive && msg.replyPreview && (
                                    <div className={`px-3 py-1.5 border-b text-left text-xs select-none flex flex-col gap-0.5
                                      ${isMine 
                                        ? 'border-white/10 bg-black/15 text-white/90' 
                                        : 'border-slate-100 bg-slate-50/80 text-slate-500'}`}
                                    >
                                      <div className="flex items-center gap-1">
                                        <Reply className={`w-3 h-3 ${isMine ? 'text-white/70' : 'text-[var(--chat-primary)]'}`} />
                                        <span className={`text-[9px] font-bold uppercase tracking-wider ${isMine ? 'text-white/80' : 'text-[var(--chat-primary)]'}`}>Replied</span>
                                      </div>
                                      <p className="line-clamp-1 italic pl-4 border-l border-current opacity-85">{msg.replyPreview}</p>
                                    </div>
                                  )}

                                  {/* Message content */}
                                  <div className="px-3.5 py-2">
                                    {msg.content}
                                    {msg.edited && isConsecutive && (
                                      <span className={`ml-1.5 text-[11px] font-normal italic select-none ${isMine ? 'text-white/60' : 'text-slate-400'}`}>
                                        (edited)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Hover actions menu directly BESIDE the message bubble! */}
                              {!isDeleted && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 select-none flex-shrink-0 flex items-center self-center z-10 px-2">
                                  <div className="flex items-center gap-1 bg-white border border-slate-200/80 rounded-full shadow-md p-1 animate-in zoom-in-95 duration-100">
                                    <button onClick={() => { setReplyingTo(msg); inputRef.current?.focus(); }}
                                      className="p-1 rounded-full text-slate-400 hover:text-[var(--chat-primary)] hover:bg-slate-50 transition-colors"
                                      title="Reply">
                                      <Reply className="w-3.5 h-3.5" />
                                    </button>
                                    {canEdit(msg) && (
                                      <button onClick={() => { setEditingMessage(msg); setText(msg.content); inputRef.current?.focus(); }}
                                        className="p-1 rounded-full text-slate-400 hover:text-[var(--chat-primary)] hover:bg-slate-50 transition-colors"
                                        title="Edit Message">
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    {canDelete(msg) && (
                                      <button onClick={() => setDeleteConfirm(msg._id)}
                                        className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                        title="Delete">
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                      <div ref={bottomRef} />
                    </div>
                  )}
                </div>

                {/* Input area */}
                <div className="flex-shrink-0 px-4 py-3 bg-white border-t border-[var(--chat-border)] pb-[calc(12px+env(safe-area-inset-bottom))]">
                  {(headerInfo.isDM || canPost(activeChannel)) ? (
                    <>
                      {editingMessage && (
                        <div className="flex items-center justify-between gap-2 mb-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl">
                          <div className="flex-1 border-l-2 border-amber-400 pl-2">
                            <p className="text-[10px] text-amber-700 font-bold">Editing message (under 15 mins)</p>
                            <p className="text-xs text-slate-500 line-clamp-1">{editingMessage.content}</p>
                          </div>
                          <button onClick={() => { setEditingMessage(null); setText(''); }}
                            className="text-xs text-slate-500 hover:text-slate-700 underline font-semibold transition-colors min-h-[44px] px-2 flex items-center justify-center">
                            Cancel
                          </button>
                        </div>
                      )}

                      {replyingTo && (
                        <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-blue-50/50 border border-blue-100 rounded-xl">
                          <div className="flex-1 border-l-2 border-[var(--chat-primary)] pl-2">
                            <p className="text-[10px] text-[var(--chat-primary)] font-bold">
                              Replying to {replyingTo.senderName || (replyingTo.from === myDMId ? 'You' : 'User')}
                            </p>
                            <p className="text-xs text-slate-500 line-clamp-1">{replyingTo.content}</p>
                          </div>
                          <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600 transition-colors min-h-[44px] px-2 flex items-center justify-center">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <div className="relative flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5 focus-within:border-[var(--chat-primary)]/40 focus-within:bg-white transition-all shadow-sm">
                        {showEmoji && (
                          <EmojiPicker
                            onSelect={e => { setText(p => p + e); setShowEmoji(false); inputRef.current?.focus(); }}
                            onClose={() => setShowEmoji(false)}
                          />
                        )}
                        <button onClick={() => setShowEmoji(v => !v)}
                          className={`flex-shrink-0 p-2 rounded-full transition-colors min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center ${showEmoji ? 'text-[var(--chat-primary)] bg-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>
                          <Smile className="w-5 h-5" />
                        </button>

                        <textarea
                          ref={inputRef}
                          value={text}
                          onChange={e => setText(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={headerInfo.isDM
                            ? `Message ${headerInfo.name}`
                            : `Message #${headerInfo.name}`}
                          rows={1}
                          className="flex-1 bg-transparent text-[15px] text-[var(--chat-text)] placeholder-slate-400 outline-none resize-none leading-relaxed min-h-[36px] py-1.5"
                          style={{ maxHeight: 120 }}
                        />

                        <button onClick={handleSend} disabled={!text.trim() || sending}
                          className={`flex-shrink-0 w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all shadow-xs min-h-[44px] sm:min-h-[32px] min-w-[44px] sm:min-w-[32px]
                            ${text.trim() ? 'bg-[var(--chat-primary)] text-white hover:bg-[var(--chat-primary-hover)]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                          <Send className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <Megaphone className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <p className="text-xs text-amber-800 font-medium">Only admins & managers can post in this announcement channel.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Members panel */}
              {showMembers && !headerInfo.isDM && (
                <div className="fixed inset-y-0 right-0 z-30 w-72 bg-[var(--chat-surface)] border-l border-[var(--chat-border)] flex flex-col transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:w-60 lg:shadow-none shadow-2xl">
                  <div className="px-4 py-3 border-b border-[var(--chat-border)] flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[var(--chat-text)]">Members ({channelMembers.length})</h3>
                    <button onClick={() => setShowMembers(false)} className="text-slate-400 hover:text-slate-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-0.5">
                    {channelMembers.map((m, i) => {
                      const n = buildName(m) || 'User';
                      const isCreator = (m._id || m.id || '').toString() === (activeChannel?.createdBy?._id || activeChannel?.createdBy || '').toString();
                      return (
                        <div key={i} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                          <Avatar name={n} size="xs" online={onlineUserIds.includes((m._id || m.id || '').toString())} />
                          <div className="flex-1 min-w-0 ml-1">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-semibold text-[var(--chat-text)] truncate">{n}</span>
                              {isCreator && <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                            </div>
                            <span className="text-[10px] text-[var(--chat-text-muted)] capitalize font-medium">{m.role}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty / welcome state */
          <div className="flex-1 flex flex-col items-center justify-center gap-5 select-none px-6" style={{ background: 'var(--chat-bg)' }}>
            {/* Hamburger to open sidebar on mobile when no chat is active (useful on tablets) */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="sm:hidden absolute top-4 left-4 p-2 rounded-full text-slate-500 bg-white border border-[var(--chat-border)] shadow-xs min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 bg-white border border-[var(--chat-border)] rounded-3xl flex items-center justify-center shadow-xs">
              <MessageSquare className="w-9 h-9 text-slate-400" />
            </div>
            <div className="text-center max-w-sm">
              <h2 className="text-lg font-bold text-[var(--chat-text)] mb-1.5">Team Chat</h2>
              <p className="text-[var(--chat-text-muted)] text-xs leading-relaxed font-medium">
                {canManage
                  ? 'Create a channel to start collaborating, or send a direct message.'
                  : 'Select a channel from the sidebar or send a direct message.'}
              </p>
            </div>
            <div className="flex gap-3">
              {canManage && (
                <button onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[var(--chat-primary)] text-white text-xs font-bold rounded-xl hover:bg-[var(--chat-primary-hover)] transition-all shadow-xs min-h-[44px]">
                  <Hash className="w-4 h-4" /> New Channel
                </button>
              )}
              <button onClick={() => setShowNewDM(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-[var(--chat-text)] text-xs font-bold rounded-xl hover:bg-slate-50 transition-all border border-[var(--chat-border)] shadow-xs min-h-[44px]">
                <MessageCircle className="w-4 h-4" /> Direct Message
              </button>
            </div>
            {channels.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center max-w-xs mt-2">
                {channels.slice(0, 4).map(ch => (
                  <button key={ch._id} onClick={() => {
                    setActiveChannelId(ch._id);
                    setChannels(prev => prev.map(c => c._id === ch._id ? { ...c, unreadCount: 0 } : c));
                  }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[var(--chat-border)] rounded-xl hover:border-[var(--chat-primary)] hover:bg-[var(--chat-primary)]/5 transition-all text-xs font-semibold text-slate-600 shadow-xs min-h-[44px]">
                    <div className={`w-4 h-4 ${CHANNEL_COLORS[ch.color] || 'bg-blue-500'} rounded flex items-center justify-center text-white`}>
                      <ChannelIcon type={ch.type} size={2} />
                    </div>
                    {ch.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        :root {
          --chat-primary: #3b82f6;
          --chat-primary-hover: #2563eb;
          --chat-bg: #f8fafc;
          --chat-surface: #ffffff;
          --chat-border: #e2e8f0;
          --chat-text: #0f172a;
          --chat-text-muted: #64748b;
          --chat-sidebar-bg: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.3); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,0.5); }
      `}</style>
    </div>
  );
}
