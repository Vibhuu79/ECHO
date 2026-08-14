import { Server as SocketIOServer } from 'socket.io';
import { Spark } from './spark.model';

export class SparkWorker {
  private static timerId: NodeJS.Timeout | null = null;

  public static start(io: SocketIOServer, intervalMs: number = 10000): void {
    if (this.timerId) return;

    console.log('⚡ Starting Spark Auto-Expiration Worker (runs every 10s)...');

    this.timerId = setInterval(async () => {
      try {
        const now = new Date();
        const sixtySecondsFromNow = new Date(now.getTime() + 60 * 1000);

        // 1. Process 1-minute expiration warnings (remaining time <= 60s & warning not sent yet)
        const expiringSparks = await Spark.find({
          status: 'active',
          warningSent: false,
          expiresAt: { $gt: now, $lte: sixtySecondsFromNow }
        });

        for (const spark of expiringSparks) {
          spark.warningSent = true;
          await spark.save();

          const remainingSeconds = Math.max(0, Math.floor((spark.expiresAt.getTime() - now.getTime()) / 1000));

          io.to(`spark:${spark._id.toString()}`).emit('spark:expiring', {
            sparkId: spark._id.toString(),
            remainingSeconds,
            message: 'Spark room expires in less than 1 minute!'
          });

          console.log(`⚠️ Spark ${spark._id.toString()} ("${spark.text}") 1-minute expiration warning sent.`);
        }

        // 2. Process expired sparks (expiresAt <= now)
        const expiredSparks = await Spark.find({
          status: 'active',
          expiresAt: { $lte: now }
        });

        for (const spark of expiredSparks) {
          spark.status = 'expired';
          await spark.save();

          io.to(`spark:${spark._id.toString()}`).emit('spark:expired', {
            sparkId: spark._id.toString(),
            message: 'Spark room timer has expired. Room closed.'
          });

          console.log(`🔥 Spark ${spark._id.toString()} ("${spark.text}") expired and room closed.`);
        }
      } catch (err) {
        console.error('Spark Worker Error:', err);
      }
    }, intervalMs);
  }

  public static stop(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
      console.log('🛑 Spark Auto-Expiration Worker stopped.');
    }
  }
}
