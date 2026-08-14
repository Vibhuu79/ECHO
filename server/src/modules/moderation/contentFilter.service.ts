/**
 * Server-side Content Moderation Engine
 * Fast compiled regex & l33tsp34k normalization for profanity and harassment filtering.
 */

// Common l33tsp34k replacements
const LEET_MAP: Record<string, string> = {
  '@': 'a',
  '4': 'a',
  '3': 'e',
  '1': 'i',
  '!': 'i',
  '|': 'i',
  '0': 'o',
  '$': 's',
  '5': 's',
  '7': 't',
  '+': 't',
  '8': 'b',
  'v': 'u',
  '*': ''
};

// Prohibited word patterns (regex matching root profanities and slurs)
const BANNED_PATTERNS: RegExp[] = [
  /f+u+c+k+/i,
  /s+h+i+t+/i,
  /b+i+t+c+h+/i,
  /a+s+s+h+o+l+e+/i,
  /c+u+n+t+/i,
  /d+i+c+k+/i,
  /p+u+s+s+y+/i,
  /f+a+g+g+o+t+/i,
  /n+i+g+g+e+r+/i,
  /n+i+g+g+a+/i,
  /s+l+u+t+/i,
  /w+h+o+r+e+/i,
  /c+o+c+k+/i,
  /b+a+s+t+a+r+d+/i,
  /k+y+s/i, // "kill yourself"
  /k+i+l+l+\s*y+o+u+r+s+e+l+f+/i,
  /r+a+p+e+/i
];

export class ContentFilterService {
  /**
   * Normalizes l33tsp34k and obfuscated punctuation into standard lower-case ASCII
   */
  static normalizeText(text: string): string {
    if (!text) return '';
    let normalized = text.toLowerCase();

    // Remove zero-width spaces and soft hyphens
    normalized = normalized.replace(/[\u200B-\u200D\uFEFF]/g, '');

    // Map common l33t substitutions
    let substituted = '';
    for (const char of normalized) {
      substituted += LEET_MAP[char] !== undefined ? LEET_MAP[char] : char;
    }

    return substituted;
  }

  /**
   * Checks if content contains profanity, slurs, or harassment phrases
   */
  static containsBadWords(text: string): { contains: boolean; matchedPattern?: string } {
    if (!text || typeof text !== 'string') return { contains: false };

    const normalized = this.normalizeText(text);
    // Remove non-alphanumeric separators to catch f.u.c.k or f-u-c-k
    const strippedPunctuation = normalized.replace(/[^a-z0-9\s]/g, '');
    // Remove all whitespace to catch f u c k or f  u  c  k
    const strippedAll = normalized.replace(/[^a-z0-9]/g, '');

    for (const pattern of BANNED_PATTERNS) {
      if (pattern.test(normalized) || pattern.test(strippedPunctuation) || pattern.test(strippedAll)) {
        return { contains: true, matchedPattern: pattern.source };
      }
    }


    return { contains: false };
  }

  /**
   * Replaces profanity words with asterisks
   */
  static sanitizeText(text: string): string {
    if (!text) return '';
    let result = text;
    const normalized = this.normalizeText(text);

    for (const pattern of BANNED_PATTERNS) {
      if (pattern.test(normalized)) {
        result = result.replace(pattern, '****');
      }
    }

    return result;
  }
}
