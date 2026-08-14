import { describe, it, expect } from 'vitest';
import { COMPLIMENT_TEMPLATES, getTemplateById } from '../modules/compliment/compliment.templates';

describe('Compliment Templates Repository', () => {
  it('should contain pre-approved wholesome templates across 5 categories', () => {
    expect(COMPLIMENT_TEMPLATES.length).toBeGreaterThanOrEqual(10);
    const categories = new Set(COMPLIMENT_TEMPLATES.map((t) => t.category));
    expect(categories.has('Vibe')).toBe(true);
    expect(categories.has('Focus')).toBe(true);
    expect(categories.has('Creativity')).toBe(true);
    expect(categories.has('Kindness')).toBe(true);
    expect(categories.has('General')).toBe(true);
  });

  it('should look up template by ID accurately', () => {
    const template = getTemplateById('vibe_1');
    expect(template).toBeDefined();
    expect(template?.category).toBe('Vibe');
    expect(template?.text).toContain('makes this whole space feel brighter');
  });

  it('should return undefined for non-existent template IDs', () => {
    const template = getTemplateById('fake_id_999');
    expect(template).toBeUndefined();
  });
});
