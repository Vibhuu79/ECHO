interface GeofenceZone {
  name: string;
  category: 'academic' | 'social' | 'recreation' | 'residence' | 'general';
  // Center point [longitude, latitude] and radius in meters
  center: [number, number];
  radiusMeters: number;
}

// Pre-configured ITM University Campus Zones (Representative campus coordinates)
const ITM_UNIVERSITY_ZONES: GeofenceZone[] = [
  {
    name: 'Central Library',
    category: 'academic',
    center: [78.1965, 26.2235],
    radiusMeters: 80
  },
  {
    name: 'Engineering & Tech Block',
    category: 'academic',
    center: [78.1972, 26.2241],
    radiusMeters: 100
  },
  {
    name: 'Central Cafeteria',
    category: 'social',
    center: [78.1958, 26.2229],
    radiusMeters: 70
  },
  {
    name: 'Sports Complex & Arena',
    category: 'recreation',
    center: [78.1985, 26.2220],
    radiusMeters: 120
  },
  {
    name: 'Student Quad & Lounge',
    category: 'social',
    center: [78.1962, 26.2238],
    radiusMeters: 60
  },
  {
    name: 'Campus Hostel Complex',
    category: 'residence',
    center: [78.1945, 26.2250],
    radiusMeters: 150
  }
];

/**
 * Calculates distance in meters between two [longitude, latitude] points using Haversine formula.
 */
export function getHaversineDistanceMeters(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Determines a human-readable context label for a given latitude and longitude.
 * Priority:
 * 1. Matching ITM University pre-configured campus zone.
 * 2. Fallback to generic campus/area sector label.
 */
export function getContextLabel(longitude: number, latitude: number): string {
  const userCoords: [number, number] = [longitude, latitude];

  for (const zone of ITM_UNIVERSITY_ZONES) {
    const distance = getHaversineDistanceMeters(userCoords, zone.center);
    if (distance <= zone.radiusMeters) {
      return zone.name;
    }
  }

  // Check if near overall ITM University campus area (~500m radius of campus center)
  const campusCenter: [number, number] = [78.1965, 26.2235];
  const distToCampus = getHaversineDistanceMeters(userCoords, campusCenter);

  if (distToCampus <= 800) {
    return 'ITM Campus Area';
  }

  // General fallback zone if outside campus
  return 'Nearby Zone';
}
