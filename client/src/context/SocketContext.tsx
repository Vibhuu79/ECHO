import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getAccessToken, api } from '../services/api';
import { PendingWave, ConversationItem, ChatMessage } from '../types';
import { Spark, SparkMember, SparkMessage } from '../types/spark';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  pendingWaves: PendingWave[];
  conversations: { active: ConversationItem[]; saved: ConversationItem[]; archived: ConversationItem[] };
  totalUnreadCount: number;
  activeChat: ConversationItem | null;
  activeMessages: ChatMessage[];
  hasMoreMessages: boolean;
  isTypingPeer: boolean;

  // Spark State
  activeSparkId: string | null;
  activeSpark: Spark | null;
  sparkMembers: SparkMember[];
  sparkMessages: SparkMessage[];
  sparkWarning: { sparkId: string; message: string } | null;

  setActiveChatId: (id: string | null) => void;
  fetchPendingWaves: () => Promise<void>;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string, before?: string) => Promise<void>;
  sendWave: (targetEchoId: string, iceBreakerText?: string) => Promise<void>;
  acceptWave: (waveId: string) => Promise<string>;
  ignoreWave: (waveId: string) => Promise<void>;
  blockWave: (waveId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, type?: 'text' | 'emoji' | 'icebreaker') => void;
  sendTyping: (conversationId: string) => void;
  sendStopTyping: (conversationId: string) => void;
  continueChat: (conversationId: string) => Promise<void>;
  saveChat: (conversationId: string) => Promise<void>;
  deleteChat: (conversationId: string) => Promise<void>;

  // Spark Methods
  setActiveSparkId: (id: string | null) => void;
  joinSparkRoom: (sparkId: string, passkey?: string) => Promise<void>;
  kickSparkMember: (sparkId: string, targetUserId: string) => Promise<void>;
  leaveSparkRoom: (sparkId: string) => Promise<void>;
  sendSparkMessage: (sparkId: string, content: string, type?: 'text' | 'emoji') => void;
  sendSparkTyping: (sparkId: string) => void;
  sendSparkStopTyping: (sparkId: string) => void;
  deleteSparkRoom: (sparkId: string) => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || undefined;

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [pendingWaves, setPendingWaves] = useState<PendingWave[]>([]);
  const [conversations, setConversations] = useState<{
    active: ConversationItem[];
    saved: ConversationItem[];
    archived: ConversationItem[];
  }>({ active: [], saved: [], archived: [] });

  const [activeChatId, setActiveChatIdState] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<ConversationItem | null>(null);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(false);
  const [isTypingPeer, setIsTypingPeer] = useState<boolean>(false);

  // Spark State
  const [activeSparkId, setActiveSparkIdState] = useState<string | null>(null);
  const [activeSpark, setActiveSpark] = useState<Spark | null>(null);
  const [sparkMembers, setSparkMembers] = useState<SparkMember[]>([]);
  const [sparkMessages, setSparkMessages] = useState<SparkMessage[]>([]);
  const [sparkWarning, setSparkWarning] = useState<{ sparkId: string; message: string } | null>(null);

  // Keep refs updated for socket callbacks to avoid stale closures
  const activeChatIdRef = useRef<string | null>(activeChatId);
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  const activeSparkIdRef = useRef<string | null>(activeSparkId);
  useEffect(() => {
    activeSparkIdRef.current = activeSparkId;
  }, [activeSparkId]);

  // 1. Socket initialization and authentication
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    const newSocket = io(SOCKET_SERVER_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('⚡ Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('user:online', (data: { userId: string }) => {
      setActiveChat((prev) => {
        if (prev?.peer && (prev.peer.id === data.userId || prev.peer.echoId === data.userId)) {
          return { ...prev, peer: { ...prev.peer, presence: 'online' } };
        }
        return prev;
      });
      fetchConversations();
    });

    newSocket.on('user:away', (data: { userId: string }) => {
      setActiveChat((prev) => {
        if (prev?.peer && (prev.peer.id === data.userId || prev.peer.echoId === data.userId)) {
          return { ...prev, peer: { ...prev.peer, presence: 'away' } };
        }
        return prev;
      });
      fetchConversations();
    });

    newSocket.on('user:offline', (data: { userId: string }) => {
      setActiveChat((prev) => {
        if (prev?.peer && (prev.peer.id === data.userId || prev.peer.echoId === data.userId)) {
          return { ...prev, peer: { ...prev.peer, presence: 'offline' } };
        }
        return prev;
      });
      fetchConversations();
    });

    newSocket.on('wave:received', (wave: PendingWave) => {
      setPendingWaves((prev) => [wave, ...prev.filter((w) => w.id !== wave.id)]);
    });

    newSocket.on('wave:accepted', async () => {
      await fetchPendingWaves();
      await fetchConversations();
    });

    newSocket.on('chat:started', async () => {
      await fetchConversations();
    });

    newSocket.on('compliment:received', (compliment: { id: string; category: string; text: string; receivedAt: string }) => {
      console.log('✨ Secret compliment received real-time:', compliment);
    });

    const moveConversationToTop = (conversationId: string, lastMessageText?: string, senderId?: string, isIncoming: boolean = false) => {
      setConversations((prev) => {
        const findAndBump = (list: ConversationItem[]): ConversationItem[] => {
          const index = list.findIndex((c) => c.id === conversationId);
          if (index === -1) return list;
          const target = { ...list[index] };
          if (lastMessageText) {
            target.lastMessage = {
              text: lastMessageText,
              senderId: senderId || '',
              timestamp: new Date().toISOString()
            };
            target.lastActivityAt = new Date().toISOString();
          }
          if (isIncoming && conversationId !== activeChatIdRef.current) {
            target.unreadCount = (target.unreadCount || 0) + 1;
          }
          const rest = list.filter((_, i) => i !== index);
          return [target, ...rest];
        };

        return {
          active: findAndBump(prev.active),
          saved: findAndBump(prev.saved),
          archived: prev.archived
        };
      });
    };

    newSocket.on('chat:activity', async (data?: { conversationId?: string; lastMessage?: ChatMessage }) => {
      if (data?.conversationId) {
        const isIncoming = data.lastMessage?.sender?.id !== (user._id || user.id);
        moveConversationToTop(data.conversationId, data.lastMessage?.content, data.lastMessage?.sender?.id, isIncoming);
        if (data.conversationId === activeChatIdRef.current && data.lastMessage) {
          setActiveMessages((prev) => {
            if (prev.some((m) => m.id === data.lastMessage?.id)) return prev;
            return [...prev, data.lastMessage!];
          });
        }
      }
      await fetchConversations();
    });

    newSocket.on('chat:message', (message: ChatMessage) => {
      const isIncoming = message.sender.id !== (user._id || user.id);
      moveConversationToTop(message.conversationId, message.content, message.sender.id, isIncoming);
      if (message.conversationId === activeChatIdRef.current) {
        setActiveMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          const hasTemp = prev.some((m) => m.id.startsWith('temp_') && m.content === message.content);
          if (hasTemp) {
            return prev.map((m) => (m.id.startsWith('temp_') && m.content === message.content ? message : m));
          }
          return [...prev, message];
        });
        setActiveChat((prev) => {
          if (prev?.peer && message.sender.id !== (user._id || user.id)) {
            return { ...prev, peer: { ...prev.peer, presence: 'online' } };
          }
          return prev;
        });
      }
      fetchConversations();
    });

    newSocket.on('chat:typing', (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === activeChatIdRef.current && data.userId !== (user._id || user.id)) {
        setIsTypingPeer(true);
        setActiveChat((prev) => {
          if (prev?.peer) {
            return { ...prev, peer: { ...prev.peer, presence: 'online' } };
          }
          return prev;
        });
      }
    });

    newSocket.on('chat:stop-typing', (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === activeChatIdRef.current && data.userId !== (user._id || user.id)) {
        setIsTypingPeer(false);
      }
    });

    newSocket.on('chat:sleeping', (data: { conversationId: string }) => {
      if (data.conversationId === activeChatIdRef.current) {
        setActiveChat((prev) => (prev ? { ...prev, status: 'sleeping' } : null));
      }
      fetchConversations();
    });

    newSocket.on('chat:awakened', (data: { conversationId: string; status: 'active' }) => {
      if (data.conversationId === activeChatIdRef.current) {
        setActiveChat((prev) => (prev ? { ...prev, status: 'active' } : null));
      }
      fetchConversations();
    });

    newSocket.on('chat:save-requested', (data: { conversationId: string; requestedBy: string }) => {
      if (data.conversationId === activeChatIdRef.current) {
        setActiveChat((prev) => {
          if (!prev) return null;
          const currentRequests = prev.saveRequests || [];
          if (!currentRequests.includes(data.requestedBy)) {
            return { ...prev, saveRequests: [...currentRequests, data.requestedBy] };
          }
          return prev;
        });
      }
      fetchConversations();
    });

    newSocket.on('chat:saved', (data: { conversationId: string }) => {
      if (data.conversationId === activeChatIdRef.current) {
        setActiveChat((prev) => (prev ? { ...prev, isSaved: true, status: 'saved' } : null));
      }
      fetchConversations();
    });

    newSocket.on('chat:archived', (data: { conversationId: string }) => {
      if (data.conversationId === activeChatIdRef.current) {
        setActiveChat((prev) => (prev ? { ...prev, status: 'archived' } : null));
      }
      fetchConversations();
    });

    newSocket.on('chat:deleted', (data: { conversationId: string }) => {
      if (data.conversationId === activeChatIdRef.current) {
        setActiveChatIdState(null);
        setActiveChat(null);
      }
      fetchConversations();
    });

    newSocket.on('chat:updated', () => {
      fetchConversations();
    });

    // Spark Real-time Socket Event Handlers
    newSocket.on('spark:message', (message: SparkMessage) => {
      if (message.sparkId === activeSparkIdRef.current) {
        setSparkMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    });

    newSocket.on('spark:member-joined', async (data: { sparkId: string }) => {
      if (data.sparkId === activeSparkIdRef.current) {
        try {
          const res = await api.getSparkById(data.sparkId);
          setActiveSpark(res.data.spark);
          setSparkMembers(res.data.members);
        } catch (e) {
          console.error(e);
        }
      }
    });

    newSocket.on('spark:member-left', async (data: { sparkId: string }) => {
      if (data.sparkId === activeSparkIdRef.current) {
        try {
          const res = await api.getSparkById(data.sparkId);
          setActiveSpark(res.data.spark);
          setSparkMembers(res.data.members);
        } catch (e) {
          console.error(e);
        }
      }
    });

    newSocket.on('spark:expiring', (data: { sparkId: string; remainingSeconds: number; message: string }) => {
      setSparkWarning({ sparkId: data.sparkId, message: data.message });
    });

    newSocket.on('spark:expired', (data: { sparkId: string }) => {
      if (data.sparkId === activeSparkIdRef.current) {
        setActiveSparkIdState(null);
        setActiveSpark(null);
        setSparkMessages([]);
        setSparkMembers([]);
      }
    });

    newSocket.on('spark:kicked', (data: { sparkId: string; message: string }) => {
      if (data.sparkId === activeSparkIdRef.current) {
        setActiveSparkIdState(null);
        setActiveSpark(null);
        setSparkMessages([]);
        setSparkMembers([]);
        alert(data.message || 'You have been removed from this room by the host.');
      }
    });

    newSocket.on('spark:member-kicked', async (data: { sparkId: string; kickedUserId: string }) => {
      if (data.sparkId === activeSparkIdRef.current) {
        try {
          const res = await api.getSparkById(data.sparkId);
          setActiveSpark(res.data.spark);
          setSparkMembers(res.data.members);
        } catch (e) {
          console.error(e);
        }
      }
    });

    setSocket(newSocket);

    // Initial data fetch
    fetchPendingWaves();
    fetchConversations();

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?._id, user?.id]);

  // 2. Active Chat loader & socket room join
  useEffect(() => {
    if (!activeChatId) {
      setActiveChat(null);
      setActiveMessages([]);
      setIsTypingPeer(false);
      return;
    }

    setConversations((prev) => {
      const resetUnread = (list: ConversationItem[]) =>
        list.map((c) => (c.id === activeChatId ? { ...c, unreadCount: 0 } : c));
      return {
        active: resetUnread(prev.active),
        saved: resetUnread(prev.saved),
        archived: prev.archived
      };
    });

    if (socket && isConnected) {
      socket.emit('chat:join', { conversationId: activeChatId });
    }

    const loadChatData = async () => {
      try {
        const details = await api.getConversationDetails(activeChatId);
        setActiveChat(details);
        const { messages, hasMore } = await api.getMessages(activeChatId, 50);
        setActiveMessages(messages);
        setHasMoreMessages(hasMore);
      } catch (err) {
        console.error('Failed to load chat details:', err);
      }
    };

    loadChatData();
  }, [activeChatId, socket, isConnected]);

  // 3. Active Spark Room Loader & Socket Join
  useEffect(() => {
    if (!activeSparkId) {
      setActiveSpark(null);
      setSparkMembers([]);
      setSparkMessages([]);
      return;
    }

    if (socket && isConnected) {
      socket.emit('spark:join', { sparkId: activeSparkId });
    }

    const loadSparkRoom = async () => {
      try {
        const { data } = await api.getSparkById(activeSparkId);
        setActiveSpark(data.spark);
        setSparkMembers(data.members);

        const msgRes = await api.getSparkMessages(activeSparkId, 50);
        setSparkMessages(msgRes.data.messages);
      } catch (err) {
        console.error('Failed to load spark room:', err);
        setActiveSparkIdState(null);
      }
    };

    loadSparkRoom();
  }, [activeSparkId, socket, isConnected]);

  const setActiveChatId = (id: string | null) => {
    setActiveChatIdState(id);
  };

  const setActiveSparkId = (id: string | null) => {
    setActiveSparkIdState(id);
  };

  const fetchPendingWaves = async () => {
    try {
      const { waves } = await api.getPendingWaves();
      setPendingWaves(waves);
    } catch (err) {
      console.error('Fetch pending waves failed:', err);
    }
  };

  const fetchConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Fetch conversations failed:', err);
    }
  };

  const fetchMessages = async (conversationId: string, before?: string) => {
    try {
      const { messages, hasMore } = await api.getMessages(conversationId, 50, before);
      if (before) {
        setActiveMessages((prev) => [...messages, ...prev]);
      } else {
        setActiveMessages(messages);
      }
      setHasMoreMessages(hasMore);
    } catch (err) {
      console.error('Fetch messages failed:', err);
    }
  };

  const sendWave = async (targetEchoId: string, iceBreakerText?: string) => {
    if (socket && isConnected) {
      socket.emit('wave:send', { targetEchoId, iceBreakerText });
    } else {
      await api.sendWave(targetEchoId, undefined, iceBreakerText);
    }
  };

  const acceptWave = async (waveId: string): Promise<string> => {
    const { conversationId } = await api.acceptWave(waveId);
    await fetchPendingWaves();
    await fetchConversations();
    if (socket && isConnected) {
      socket.emit('wave:accept', { waveId });
    }
    return conversationId;
  };

  const ignoreWave = async (waveId: string) => {
    await api.ignoreWave(waveId);
    setPendingWaves((prev) => prev.filter((w) => w.id !== waveId));
  };

  const blockWave = async (waveId: string) => {
    await api.blockUserViaWave(waveId);
    setPendingWaves((prev) => prev.filter((w) => w.id !== waveId));
  };

  const sendMessage = async (conversationId: string, content: string, type: 'text' | 'emoji' | 'icebreaker' = 'text') => {
    // 1. Create optimistic local message for immediate zero-latency UI rendering
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      conversationId,
      sender: {
        id: user?._id || user?.id || '',
        username: user?.username || 'You',
        echoId: user?.echoId || ''
      },
      content,
      type,
      readBy: [user?._id || user?.id || ''],
      createdAt: new Date().toISOString()
    };

    if (conversationId === activeChatIdRef.current) {
      setActiveMessages((prev) => [...prev, optimisticMessage]);
    }

    // 2. Transmit via Socket with ACK callback, or fallback to REST API
    if (socket && isConnected) {
      socket.emit('chat:message', { conversationId, content, type }, (response: { success: boolean; message?: any; error?: string }) => {
        if (response?.success && response.message) {
          if (conversationId === activeChatIdRef.current) {
            setActiveMessages((prev) =>
              prev.map((m) => (m.id === tempId ? response.message : m))
            );
          }
        } else if (response?.error) {
          console.error('Socket message creation error:', response.error);
          if (conversationId === activeChatIdRef.current) {
            setActiveMessages((prev) => prev.filter((m) => m.id !== tempId));
          }
        }
      });
    } else {
      try {
        const res = await api.sendMessage(conversationId, content, type);
        if (res.message && conversationId === activeChatIdRef.current) {
          setActiveMessages((prev) =>
            prev.map((m) => (m.id === tempId ? res.message : m))
          );
        }
      } catch (err) {
        console.error('Failed to send message via HTTP fallback:', err);
        if (conversationId === activeChatIdRef.current) {
          setActiveMessages((prev) => prev.filter((m) => m.id !== tempId));
        }
      }
    }
  };

  const sendTyping = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('chat:typing', { conversationId });
    }
  };

  const sendStopTyping = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('chat:stop-typing', { conversationId });
    }
  };

  const continueChat = async (conversationId: string) => {
    await api.continueConversation(conversationId);
    if (socket && isConnected) {
      socket.emit('chat:continue', { conversationId });
    }
    setActiveChat((prev) => (prev ? { ...prev, status: 'active' } : null));
    await fetchConversations();
  };

  const saveChat = async (conversationId: string) => {
    await api.saveConversation(conversationId);
    if (socket && isConnected) {
      socket.emit('chat:save', { conversationId });
    }
    await fetchConversations();
    const details = await api.getConversationDetails(conversationId);
    setActiveChat(details);
  };

  const deleteChat = async (conversationId: string) => {
    await api.deleteConversation(conversationId);
    if (activeChatId === conversationId) {
      setActiveChatIdState(null);
      setActiveChat(null);
    }
    await fetchConversations();
  };

  // Spark Action Implementations
  const joinSparkRoom = async (sparkId: string, passkey?: string) => {
    await api.joinSpark(sparkId, passkey);
    setActiveSparkIdState(sparkId);
    if (socket && isConnected) {
      socket.emit('spark:join', { sparkId });
    }
  };

  const kickSparkMember = async (sparkId: string, targetUserId: string) => {
    await api.kickSparkMember(sparkId, targetUserId);
    if (socket && isConnected) {
      socket.emit('spark:kick', { sparkId, targetUserId });
    }
    const res = await api.getSparkById(sparkId);
    setActiveSpark(res.data.spark);
    setSparkMembers(res.data.members);
  };

  const leaveSparkRoom = async (sparkId: string) => {
    await api.leaveSpark(sparkId);
    if (socket && isConnected) {
      socket.emit('spark:leave', { sparkId });
    }
    if (activeSparkId === sparkId) {
      setActiveSparkIdState(null);
      setActiveSpark(null);
      setSparkMembers([]);
      setSparkMessages([]);
    }
  };

  const sendSparkMessage = (sparkId: string, content: string, type: 'text' | 'emoji' = 'text') => {
    if (socket && isConnected) {
      socket.emit('spark:message', { sparkId, content, type });
    }
  };

  const sendSparkTyping = (sparkId: string) => {
    if (socket && isConnected) {
      socket.emit('spark:typing', { sparkId });
    }
  };

  const sendSparkStopTyping = (sparkId: string) => {
    if (socket && isConnected) {
      socket.emit('spark:stop-typing', { sparkId });
    }
  };

  const deleteSparkRoom = async (sparkId: string) => {
    await api.deleteSpark(sparkId);
    if (activeSparkId === sparkId) {
      setActiveSparkIdState(null);
      setActiveSpark(null);
    }
  };

  const totalUnreadCount = [...conversations.active, ...conversations.saved].reduce(
    (sum, item) => sum + (item.unreadCount || 0),
    0
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        pendingWaves,
        conversations,
        totalUnreadCount,
        activeChat,
        activeMessages,
        hasMoreMessages,
        isTypingPeer,
        activeSparkId,
        activeSpark,
        sparkMembers,
        sparkMessages,
        sparkWarning,
        setActiveChatId,
        setActiveSparkId,
        fetchPendingWaves,
        fetchConversations,
        fetchMessages,
        sendWave,
        acceptWave,
        ignoreWave,
        blockWave,
        sendMessage,
        sendTyping,
        sendStopTyping,
        continueChat,
        saveChat,
        deleteChat,
        joinSparkRoom,
        kickSparkMember,
        leaveSparkRoom,
        sendSparkMessage,
        sendSparkTyping,
        sendSparkStopTyping,
        deleteSparkRoom
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
