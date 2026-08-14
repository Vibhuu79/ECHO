import { describe, it, expect } from 'vitest';
import { ContentFilterService } from '../modules/moderation/contentFilter.service';

describe('ContentFilterService', () => {
  it('should detect standard profanity', () => {
    const result = ContentFilterService.containsBadWords('This is a fuck bad word');
    expect(result.contains).toBe(true);
    expect(result.matchedPattern).toBeDefined();
  });

  it('should detect l33tsp34k variations', () => {
    const result = ContentFilterService.containsBadWords('f u c k this text');
    expect(result.contains).toBe(true);
  });

  it('should pass clean wholesome messages', () => {
    const result = ContentFilterService.containsBadWords('Hey, anyone up for a coffee break in the library?');
    expect(result.contains).toBe(false);
    expect(result.matchedPattern).toBeUndefined();
  });
});
