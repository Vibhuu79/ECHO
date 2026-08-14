import { Request, Response } from 'express';
import { DiscoveryService } from './discovery.service';
import { PresenceService } from './presence.service';
import { User } from '../user/user.model';
import { getContextLabel } from '../../utils/geofence';

export class DiscoveryController {
  /**
   * GET /api/discover/nearby
   */
  static async getNearby(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      let latitude = parseFloat(req.query.latitude as string);
      let longitude = parseFloat(req.query.longitude as string);
      const radius = parseInt(req.query.radius as string) || 500;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      // Fallback to stored user location if query params not present
      if (isNaN(latitude) || isNaN(longitude)) {
        const user = await User.findById(userId).select('location');
        if (user?.location?.coordinates && user.location.coordinates.length === 2) {
          longitude = user.location.coordinates[0];
          latitude = user.location.coordinates[1];
        } else {
          res.status(400).json({
            message: 'Location coordinates required. Please enable GPS location access.'
          });
          return;
        }
      }

      const result = await DiscoveryService.getNearbyUsers(
        userId,
        longitude,
        latitude,
        radius,
        limit,
        offset
      );

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error fetching nearby users:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * PATCH /api/users/me/location
   */
  static async updateLocation(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { latitude, longitude } = req.body;
      if (
        typeof latitude !== 'number' ||
        typeof longitude !== 'number' ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        res.status(400).json({ message: 'Invalid latitude or longitude coordinates' });
        return;
      }

      const locationLabel = getContextLabel(longitude, latitude);

      await User.findByIdAndUpdate(userId, {
        location: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        locationLabel,
        lastActive: new Date()
      });

      // Sync to Redis GEO index
      await PresenceService.updateUserGeo(userId, longitude, latitude);

      res.status(200).json({
        message: 'Location updated successfully',
        contextLabel: locationLabel
      });
    } catch (error: any) {
      console.error('Error updating user location:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * PATCH /api/users/me/mood
   */
  static async updateMood(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { mood } = req.body;
      const validMoods = [
        'chill',
        'studying',
        'coffee',
        'coding',
        'bored',
        'gaming',
        'free',
        null
      ];

      if (!validMoods.includes(mood)) {
        res.status(400).json({ message: 'Invalid mood status' });
        return;
      }

      await User.findByIdAndUpdate(userId, { mood });

      // Sync presence in Redis
      await PresenceService.setUserPresence(userId, 'online', undefined, mood);

      res.status(200).json({
        message: 'Mood updated successfully',
        mood
      });
    } catch (error: any) {
      console.error('Error updating user mood:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
