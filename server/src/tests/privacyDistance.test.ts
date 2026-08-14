import { describe, it, expect } from 'vitest';
import { DiscoveryService } from '../modules/discovery/discovery.service';

describe('Privacy Distance Bucket Engine', () => {
  it('should round distances <= 50m to ~50m', () => {
    expect(DiscoveryService.roundDistanceBucket(12)).toBe('~50m');
    expect(DiscoveryService.roundDistanceBucket(50)).toBe('~50m');
  });

  it('should round distances <= 100m to ~100m', () => {
    expect(DiscoveryService.roundDistanceBucket(51)).toBe('~100m');
    expect(DiscoveryService.roundDistanceBucket(99)).toBe('~100m');
  });

  it('should round distances <= 150m to ~150m', () => {
    expect(DiscoveryService.roundDistanceBucket(140)).toBe('~150m');
  });

  it('should round distances <= 250m to ~250m', () => {
    expect(DiscoveryService.roundDistanceBucket(210)).toBe('~250m');
  });

  it('should round distances <= 500m to ~500m', () => {
    expect(DiscoveryService.roundDistanceBucket(480)).toBe('~500m');
  });

  it('should round distances > 500m to ~1km', () => {
    expect(DiscoveryService.roundDistanceBucket(750)).toBe('~1km');
  });
});
