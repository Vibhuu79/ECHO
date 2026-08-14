import { Server as SocketIOServer } from 'socket.io';
import { Conversation } from './conversation.model';

const TEN_MINUTES_MS = 10 * 60 * 1000;

export class InactivityWorker {
  private static timerId: NodeJS.Timeout | null = null;

  public static start(io: SocketIOServer, intervalMs: number = 60000): void {
    if (this.timerId) return;

    console.log('⏰ Starting Conversation Inactivity Worker (checks every 60s)...');

    this.timerId = setInterval(async () => {
      try {
        const tenMinsAgo = new Date(Date.now() - TEN_MINUTES_MS);

        // Find active, unsaved conversations with no activity for 10 minutes
        const inactiveConvs = await Conversation.find({
          status: 'active',
          isSaved: false,
          lastActivityAt: { $lt: tenMinsAgo }
        });

        for (const conv of inactiveConvs) {
          conv.status = 'sleeping';
          conv.sleepingSince = new Date();
          await conv.save();

          // Emit real-time notification to conversation room
          io.to(`chat:${conv._id.toString()}`).emit('chat:sleeping', {
            conversationId: conv._id.toString(),
            message: 'Conversation entered sleeping state due to 10 minutes of inactivity.'
          });

          console.log(`😴 Conversation ${conv._id.toString()} transitioned to sleeping state.`);
        }
      } catch (err) {
        console.error('Inactivity Worker Error:', err);
      }
    }, intervalMs);
  }

  public static stop(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
      console.log('🛑 Inactivity Worker stopped.');
    }
  }
}
