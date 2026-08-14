import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { PresenceService } from '../modules/discovery/presence.service';
import { User } from '../modules/user/user.model';
import { getContextLabel } from '../utils/geofence';
import { setupWaveSocketHandlers } from './wave.handler';
import { setupChatSocketHandlers } from './chat.handler';
import { setupSparkSocketHandlers } from './spark.handler';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  echoId?: string;
}

let ioInstance: SocketIOServer | null = null;

export function getIO(): SocketIOServer | null {
  return ioInstance;
}

export function setupSocketIO(io: SocketIOServer): void {
  ioInstance = io;
  // Authentication Middleware for Socket.IO connections

  io.use((socket: Socket, next: (err?: Error) => void) => {
    try {
      const authSocket = socket as AuthenticatedSocket;
      const token =
        authSocket.handshake.auth?.token ||
        authSocket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication error: Missing token'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET) as {
        userId: string;
        echoId?: string;
      };
      authSocket.userId = decoded.userId;
      authSocket.echoId = decoded.echoId;
      next();
    } catch (err) {
      console.error('Socket Auth Error:', (err as Error).message);
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', async (rawSocket: Socket) => {
    const socket = rawSocket as AuthenticatedSocket;
    const userId = socket.userId;
    if (!userId) return;

    console.log(`🔌 Socket Connected: ${userId} (${socket.id})`);

    // Join user's private room for targeted events
    socket.join(`user:${userId}`);

    // Register Wave, Chat, and Spark real-time socket handlers
    setupWaveSocketHandlers(io, socket);
    setupChatSocketHandlers(io, socket);
    setupSparkSocketHandlers(io, socket);

    // Update Redis presence state
    await PresenceService.setUserPresence(userId, 'online', socket.id);
    await User.findByIdAndUpdate(userId, {
      presenceStatus: 'online',
      lastActive: new Date()
    });

    // Notify user's connected sockets
    socket.emit('connected', { userId, status: 'online' });

    // Broadcast user:online to connected clients
    socket.broadcast.emit('user:online', {
      userId,
      status: 'online'
    });

    // Handle user:away event (app moved to background or tab switched)
    socket.on('user:away', async () => {
      await PresenceService.setUserPresence(userId, 'away', socket.id);
      await User.findByIdAndUpdate(userId, { presenceStatus: 'away' });

      socket.broadcast.emit('user:away', {
        userId,
        status: 'away'
      });
    });

    // Handle user:online event (app foregrounded)
    socket.on('user:online', async () => {
      await PresenceService.setUserPresence(userId, 'online', socket.id);
      await User.findByIdAndUpdate(userId, {
        presenceStatus: 'online',
        lastActive: new Date()
      });

      socket.broadcast.emit('user:online', {
        userId,
        status: 'online'
      });
    });

    // Handle user:mood-update event
    socket.on(
      'user:mood-update',
      async (data: { mood: string | null }) => {
        const { mood } = data;
        await User.findByIdAndUpdate(userId, { mood });
        await PresenceService.setUserPresence(userId, 'online', socket.id, mood);

        io.emit('user:mood-update', {
          userId,
          mood
        });
      }
    );

    // Handle real-time user:location-update event
    socket.on(
      'user:location-update',
      async (data: { latitude: number; longitude: number }) => {
        const { latitude, longitude } = data;
        if (
          typeof latitude === 'number' &&
          typeof longitude === 'number'
        ) {
          const locationLabel = getContextLabel(longitude, latitude);

          await User.findByIdAndUpdate(userId, {
            location: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            locationLabel,
            lastActive: new Date()
          });

          await PresenceService.updateUserGeo(userId, longitude, latitude);

          socket.emit('user:location-updated', {
            contextLabel: locationLabel
          });
        }
      }
    );

    // Handle disconnect
    socket.on('disconnect', async (reason: string) => {
      console.log(`🔌 Socket Disconnected: ${userId} (${reason})`);

      // Update status to offline in DB & Redis
      await PresenceService.setUserPresence(userId, 'offline');
      await User.findByIdAndUpdate(userId, {
        presenceStatus: 'offline',
        lastActive: new Date()
      });

      socket.broadcast.emit('user:offline', {
        userId,
        status: 'offline'
      });
    });
  });
}
