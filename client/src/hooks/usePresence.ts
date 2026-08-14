import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '../services/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

interface PresenceEventPayload {
  userId: string;
  status?: 'online' | 'away' | 'offline';
  mood?: string | null;
}

export interface UsePresenceOptions {
  onUserOnline?: (payload: PresenceEventPayload) => void;
  onUserAway?: (payload: PresenceEventPayload) => void;
  onUserOffline?: (payload: PresenceEventPayload) => void;
  onMoodUpdate?: (payload: PresenceEventPayload) => void;
}

export function usePresence(options: UsePresenceOptions = {}) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    // Connect to Socket.IO server with JWT token
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('⚡ Socket connected to Echo Realtime');
    });

    socket.on('user:online', (data: PresenceEventPayload) => {
      options.onUserOnline?.(data);
    });

    socket.on('user:away', (data: PresenceEventPayload) => {
      options.onUserAway?.(data);
    });

    socket.on('user:offline', (data: PresenceEventPayload) => {
      options.onUserOffline?.(data);
    });

    socket.on('user:mood-update', (data: PresenceEventPayload) => {
      options.onMoodUpdate?.(data);
    });

    // Tab visibility handling (Background / Foreground)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        socket.emit('user:away');
      } else {
        socket.emit('user:online');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const emitMoodUpdate = (mood: string | null) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('user:mood-update', { mood });
    }
  };

  return { socket: socketRef.current, emitMoodUpdate };
}
