export interface ComplimentTemplate {
  id: string;
  category: 'Vibe' | 'Focus' | 'Creativity' | 'Kindness' | 'General';
  text: string;
}

export const COMPLIMENT_TEMPLATES: ComplimentTemplate[] = [
  // Vibe
  { id: 'vibe_1', category: 'Vibe', text: 'Your energy makes this whole space feel brighter.' },
  { id: 'vibe_2', category: 'Vibe', text: 'You bring such a calm, grounded presence to the room.' },
  { id: 'vibe_3', category: 'Vibe', text: 'Your positive aura is genuinely contagious.' },

  // Focus
  { id: 'focus_1', category: 'Focus', text: 'Your dedication and focus right now is inspiring.' },
  { id: 'focus_2', category: 'Focus', text: 'Keep pushing! Your hard work doesn’t go unnoticed.' },
  { id: 'focus_3', category: 'Focus', text: 'You look like someone who gets things done efficiently.' },

  // Creativity
  { id: 'creativity_1', category: 'Creativity', text: 'You seem like someone with incredible ideas.' },
  { id: 'creativity_2', category: 'Creativity', text: 'Your unique perspective makes conversations fascinating.' },

  // Kindness
  { id: 'kindness_1', category: 'Kindness', text: 'Thank you for being someone who makes people feel welcomed.' },
  { id: 'kindness_2', category: 'Kindness', text: 'Someone nearby appreciated your helpful attitude today.' },

  // General
  { id: 'general_1', category: 'General', text: 'Just wanted to drop a random note of encouragement!' },
  { id: 'general_2', category: 'General', text: 'Hope your day is going as awesome as you are.' }
];

export function getTemplateById(id: string): ComplimentTemplate | undefined {
  return COMPLIMENT_TEMPLATES.find((t) => t.id === id);
}
