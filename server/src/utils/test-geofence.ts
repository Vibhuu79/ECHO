import { DiscoveryService } from '../modules/discovery/discovery.service';
import { getContextLabel } from './geofence';

console.log('🧪 Testing Phase 2 Discovery Utilities...\n');

// Test 1: Distance Rounding Buckets
const testDistances = [
  { input: 12, expected: '~50m' },
  { input: 48, expected: '~50m' },
  { input: 85, expected: '~100m' },
  { input: 140, expected: '~150m' },
  { input: 210, expected: '~250m' },
  { input: 450, expected: '~500m' },
  { input: 750, expected: '~1km' }
];

let passedCount = 0;
testDistances.forEach(({ input, expected }) => {
  const result = DiscoveryService.roundDistanceBucket(input);
  if (result === expected) {
    console.log(`✅ Distance ${input}m -> ${result}`);
    passedCount++;
  } else {
    console.error(`❌ FAILED: ${input}m expected ${expected}, got ${result}`);
  }
});

// Test 2: ITM University Geofencing Label Lookup
// Central Library coordinates: [78.1965, 26.2235]
const libLabel = getContextLabel(78.1965, 26.2235);
console.log(`\n📍 Coordinates [78.1965, 26.2235] -> "${libLabel}"`);

// Campus Hostel Complex coordinates: [78.1945, 26.2250]
const hostelLabel = getContextLabel(78.1945, 26.2250);
console.log(`📍 Coordinates [78.1945, 26.2250] -> "${hostelLabel}"`);

// Outside coordinates (5km away)
const outsideLabel = getContextLabel(78.1000, 26.1000);
console.log(`📍 Outside Coordinates [78.1000, 26.1000] -> "${outsideLabel}"`);

if (
  passedCount === testDistances.length &&
  libLabel === 'Central Library' &&
  hostelLabel === 'Campus Hostel Complex' &&
  outsideLabel === 'Nearby Zone'
) {
  console.log('\n🎉 ALL DISCOVERY & PRIVACY UNIT TESTS PASSED SUCCESSFULLY!');
} else {
  console.error('\n❌ SOME TESTS FAILED');
  process.exit(1);
}
