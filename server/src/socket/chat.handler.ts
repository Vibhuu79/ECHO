import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket } from './presence.handler';
import { ChatService } from '../modules/chat/chat.service';
import { ContentFilterService } from '../modules/moderation/contentFilter.service';
import { ModerationService } from '../modules/moderation/moderation.service';
import { TrustService } from '../modules/moderation/trust.service';

export function setupChatSocketHandlers(io: SocketIOServer, socket: AuthenticatedSocket): void {
  const userId = socket.userId;
  if (!userId) return;

  // Join a 1-on-1 conversation room
  socket.on('chat:join', (data: { conversationId: string }) => {
    const { conversationId } = data;
    if (conversationId) {
      socket.join(`chat:${conversationId}`);
      console.log(`💬 Socket ${userId} joined room: chat:${conversationId}`);
    }
  });

  // Send message real-time handler
  socket.on(
    'chat:message',
    async (
      data: { conversationId: string; content: string; type?: 'text' | 'emoji' | 'icebreaker' | 'system' },
      callback?: (response: { success: boolean; message?: any; error?: string }) => void
    ) => {
      try {
        const { conversationId, content, type } = data;
        if (!conversationId || !content) {
          if (callback) callback({ success: false, error: 'INVALID_PAYLOAD' });
          return;
        }

        // Content moderation check
        const filterResult = ContentFilterService.containsBadWords(content);
        if (filterResult.contains) {
          await TrustService.adjustTrustScore(userId, -5, 'BAD_WORDS_VIOLATION');
          socket.emit('system:error', {
            message: 'CONTENT_VIOLATION: Message contains inappropriate language.'
          });
          if (callback) callback({ success: false, error: 'CONTENT_VIOLATION: Inappropriate language.' });
          return;
        }

        const result = await ChatService.createMessage(conversationId, userId, content, type || 'text');

        // Broadcast new message to conversation room
        io.to(`chat:${conversationId}`).emit('chat:message', result.message);

        // Broadcast new message and activity to participants on their user channels
        for (const pId of result.participants) {
          const isMuted = pId !== userId ? await ModerationService.isUserMuted(pId, userId) : false;
          if (!isMuted) {
            io.to(`user:${pId}`).emit('chat:message', result.message);
            if (pId !== userId) {
              io.to(`user:${pId}`).emit('chat:activity', {
                conversationId,
                lastMessage: result.message
              });
            }
          }
        }

        if (callback) callback({ success: true, message: result.message });
      } catch (err: any) {
        console.error('Socket chat:message Error:', err.message);
        socket.emit('system:error', { message: err.message });
        if (callback) callback({ success: false, error: err.message });
      }
    }
  );

  // Typing indicator handlers
  socket.on('chat:typing', (data: { conversationId: string }) => {
    const { conversationId } = data;
    if (conversationId) {
      socket.to(`chat:${conversationId}`).emit('chat:typing', {
        conversationId,
        userId
      });
    }
  });

  socket.on('chat:stop-typing', (data: { conversationId: string }) => {
    const { conversationId } = data;
    if (conversationId) {
      socket.to(`chat:${conversationId}`).emit('chat:stop-typing', {
        conversationId,
        userId
      });
    }
  });

  // Continue sleeping conversation
  socket.on('chat:continue', async (data: { conversationId: string }) => {
    try {
      const { conversationId } = data;
      const result = await ChatService.continueConversation(conversationId, userId);

      io.to(`chat:${conversationId}`).emit('chat:awakened', {
        conversationId,
        status: result.status
      });
    } catch (err: any) {
      console.error('Socket chat:continue Error:', err.message);
      socket.emit('system:error', { message: err.message });
    }
  });

  // Save conversation handler
  socket.on('chat:save', async (data: { conversationId: string }) => {
    try {
      const { conversationId } = data;
      const result = await ChatService.saveConversation(conversationId, userId);

      if (result.isSaved) {
        // Broadcast mutual saved event to conversation room & user channels
        io.to(`chat:${conversationId}`).emit('chat:saved', {
          conversationId,
          isSaved: true,
          status: 'saved',
          message: 'Connection permanently saved!'
        });
        result.participants.forEach((pId) => {
          io.to(`user:${pId}`).emit('chat:updated', { conversationId, isSaved: true, status: 'saved' });
        });
      } else {
        // Broadcast save-request event to partner
        io.to(`chat:${conversationId}`).emit('chat:save-requested', {
          conversationId,
          requestedBy: userId,
          saveRequestsCount: result.saveRequestsCount
        });
      }
    } catch (err: any) {
      console.error('Socket chat:save Error:', err.message);
      socket.emit('system:error', { message: err.message });
    }
  });
}
