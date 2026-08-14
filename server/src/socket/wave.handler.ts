import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket } from './presence.handler';
import { WaveService } from '../modules/wave/wave.service';
import { User } from '../modules/user/user.model';
import { ModerationService } from '../modules/moderation/moderation.service';

export function setupWaveSocketHandlers(io: SocketIOServer, socket: AuthenticatedSocket): void {
  const userId = socket.userId;
  if (!userId) return;

  // Real-time wave:send handler
  socket.on('wave:send', async (data: { targetEchoId: string; iceBreakerText?: string }) => {
    try {
      const { targetEchoId, iceBreakerText } = data;
      const { wave, targetUserId } = await WaveService.sendWave(userId, targetEchoId, iceBreakerText);

      const sender = await User.findById(userId).select('username echoId mood presenceStatus locationLabel');

      // Check if target user muted sender
      const isMuted = await ModerationService.isUserMuted(targetUserId, userId);

      if (!isMuted) {
        // Emit to recipient's private user room
        io.to(`user:${targetUserId}`).emit('wave:received', {
          id: wave._id.toString(),
          fromUser: {
            id: userId,
            username: sender?.username || 'Anonymous',
            echoId: sender?.echoId || '',
            mood: sender?.mood || null,
            presence: sender?.presenceStatus || 'online',
            locationLabel: sender?.locationLabel || ''
          },
          icebreaker: wave.iceBreaker || null,
          createdAt: wave.createdAt
        });
      }

      // Acknowledge back to sender socket
      socket.emit('wave:sent_success', {
        waveId: wave._id.toString(),
        targetUserId
      });
    } catch (err: any) {
      console.error('Socket wave:send Error:', err.message);
      socket.emit('system:error', { message: err.message });
    }
  });

  // Real-time wave:accept handler
  socket.on('wave:accept', async (data: { waveId: string }) => {
    try {
      const { waveId } = data;
      const result = await WaveService.acceptWave(waveId, userId);

      // Notify sender and receiver
      io.to(`user:${result.senderId}`).emit('wave:accepted', {
        waveId,
        conversationId: result.conversationId
      });
      io.to(`user:${result.receiverId}`).emit('wave:accepted', {
        waveId,
        conversationId: result.conversationId
      });

      // Trigger chat:started event
      io.to(`user:${result.senderId}`).emit('chat:started', { conversationId: result.conversationId });
      io.to(`user:${result.receiverId}`).emit('chat:started', { conversationId: result.conversationId });
    } catch (err: any) {
      console.error('Socket wave:accept Error:', err.message);
      socket.emit('system:error', { message: err.message });
    }
  });
}
