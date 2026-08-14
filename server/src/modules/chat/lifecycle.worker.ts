import { Server as SocketIOServer } from 'socket.io';
import { Conversation } from './conversation.model';
import { Message } from './message.model';

const TEN_MINUTES_MS = 10 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export class LifecycleWorker {
  private static timerId: NodeJS.Timeout | null = null;

  public static start(io: SocketIOServer, intervalMs: number = 60000): void {
    if (this.timerId) return;

    console.log('⏰ Starting Conversation Lifecycle Worker (runs every 60s)...');

    this.timerId = setInterval(async () => {
      try {
        const now = new Date();
        const tenMinsAgo = new Date(now.getTime() - TEN_MINUTES_MS);
        const twentyFourHoursAgo = new Date(now.getTime() - TWENTY_FOUR_HOURS_MS);

        // 1. Check for 10-minute inactive chats -> sleeping state
        const inactiveConvs = await Conversation.find({
          status: 'active',
          isSaved: false,
          lastActivityAt: { $lt: tenMinsAgo }
        });

        for (const conv of inactiveConvs) {
          conv.status = 'sleeping';
          conv.sleepingSince = now;
          await conv.save();

          io.to(`chat:${conv._id.toString()}`).emit('chat:sleeping', {
            conversationId: conv._id.toString(),
            message: 'Conversation entered sleeping state due to 10 minutes of inactivity.'
          });

          console.log(`😴 Conversation ${conv._id.toString()} transitioned to sleeping state.`);
        }

        // 2. Check for 24-hour inactive unsaved chats -> auto-purge expiration
        const expiredUnsavedConvs = await Conversation.find({
          status: { $in: ['active', 'sleeping', 'archived'] },
          isSaved: false,
          lastActivityAt: { $lt: twentyFourHoursAgo }
        });

        for (const conv of expiredUnsavedConvs) {
          // Delete all messages associated with unsaved expired conversation
          await Message.deleteMany({ conversationId: conv._id });

          conv.status = 'deleted';
          await conv.save();

          io.to(`chat:${conv._id.toString()}`).emit('chat:deleted', {
            conversationId: conv._id.toString(),
            message: 'Unsaved conversation auto-deleted after 24 hours of inactivity.'
          });

          console.log(`🗑️ Unsaved conversation ${conv._id.toString()} auto-deleted after 24h of inactivity.`);
        }
      } catch (err) {
        console.error('Lifecycle Worker Error:', err);
      }
    }, intervalMs);
  }

  public static stop(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
      console.log('🛑 Conversation Lifecycle Worker stopped.');
    }
  }
}
