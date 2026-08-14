import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket } from './presence.handler';
import { SparkService } from '../modules/spark/spark.service';
import { ContentFilterService } from '../modules/moderation/contentFilter.service';
import { TrustService } from '../modules/moderation/trust.service';

export function setupSparkSocketHandlers(io: SocketIOServer, socket: AuthenticatedSocket): void {
  const userId = socket.userId;
  if (!userId) return;

  // Join a Spark group room
  socket.on('spark:join', async (data: { sparkId: string }) => {
    try {
      const { sparkId } = data;
      if (!sparkId) return;

      socket.join(`spark:${sparkId}`);
      console.log(`⚡ Socket ${userId} joined room: spark:${sparkId}`);

      // Emit member joined alert to spark room
      socket.to(`spark:${sparkId}`).emit('spark:member-joined', {
        sparkId,
        userId
      });
    } catch (err: any) {
      console.error('Socket spark:join Error:', err.message);
      socket.emit('system:error', { message: err.message });
    }
  });

  // Leave a Spark group room
  socket.on('spark:leave', async (data: { sparkId: string }) => {
    try {
      const { sparkId } = data;
      if (!sparkId) return;

      socket.leave(`spark:${sparkId}`);
      console.log(`⚡ Socket ${userId} left room: spark:${sparkId}`);

      socket.to(`spark:${sparkId}`).emit('spark:member-left', {
        sparkId,
        userId
      });
    } catch (err: any) {
      console.error('Socket spark:leave Error:', err.message);
    }
  });

  // Send message in Spark group room
  socket.on(
    'spark:message',
    async (data: { sparkId: string; content: string; type?: 'text' | 'emoji' | 'system' }) => {
      try {
        const { sparkId, content, type } = data;
        if (!sparkId || !content) return;

        // Content moderation check
        const filterResult = ContentFilterService.containsBadWords(content);
        if (filterResult.contains) {
          await TrustService.adjustTrustScore(userId, -5, 'BAD_WORDS_VIOLATION');
          socket.emit('system:error', {
            message: 'CONTENT_VIOLATION: Spark message contains inappropriate language.'
          });
          return;
        }

        const messageDto = await SparkService.createSparkMessage(sparkId, userId, content, type || 'text');

        // Broadcast to all sockets in spark room
        io.to(`spark:${sparkId}`).emit('spark:message', messageDto);
      } catch (err: any) {
        console.error('Socket spark:message Error:', err.message);
        socket.emit('system:error', { message: err.message });
      }
    }
  );

  // Group typing indicators
  socket.on('spark:typing', (data: { sparkId: string }) => {
    const { sparkId } = data;
    if (sparkId) {
      socket.to(`spark:${sparkId}`).emit('spark:typing', {
        sparkId,
        userId
      });
    }
  });

  socket.on('spark:stop-typing', (data: { sparkId: string }) => {
    const { sparkId } = data;
    if (sparkId) {
      socket.to(`spark:${sparkId}`).emit('spark:stop-typing', {
        sparkId,
        userId
      });
    }
  });

  // Host kicks a member from Spark room
  socket.on('spark:kick', async (data: { sparkId: string; targetUserId: string }) => {
    try {
      const { sparkId, targetUserId } = data;
      if (!sparkId || !targetUserId) return;

      await SparkService.kickSparkMember(sparkId, userId, targetUserId);

      // Notify target user via personal room to dismount modal & toast
      io.to(`user:${targetUserId}`).emit('spark:kicked', {
        sparkId,
        message: 'You have been removed from this room by the host.'
      });

      // Broadcast kick event to spark room
      io.to(`spark:${sparkId}`).emit('spark:member-kicked', {
        sparkId,
        kickedUserId: targetUserId
      });
    } catch (err: any) {
      console.error('Socket spark:kick Error:', err.message);
      socket.emit('system:error', { message: err.message });
    }
  });
}
