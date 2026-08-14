import React from 'react';
import { MoodType } from '../types/discovery';

interface MoodSelectorModalProps {
  currentMood: MoodType;
  isOpen: boolean;
  onClose: () => void;
  onSelectMood: (mood: MoodType) => void;
}

interface MoodOption {
  type: MoodType;
  emoji: string;
  label: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { type: 'chill', emoji: '🙂', label: 'Chill' },
  { type: 'studying', emoji: '📚', label: 'Studying' },
  { type: 'coffee', emoji: '☕', label: 'Coffee Break' },
  { type: 'coding', emoji: '💻', label: 'Coding' },
  { type: 'bored', emoji: '😴', label: 'Bored' },
  { type: 'gaming', emoji: '🎮', label: 'Gaming' },
  { type: 'free', emoji: '😄', label: 'Free' },
  { type: null, emoji: '🚫', label: 'Clear Mood' }
];

export const MoodSelectorModal: React.FC<MoodSelectorModalProps> = ({
  currentMood,
  isOpen,
  onClose,
  onSelectMood
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Set Your Mood</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <p className="modal-subtitle">
          Let people nearby know what you're up to!
        </p>

        <div className="mood-grid">
          {MOOD_OPTIONS.map((option) => {
            const isSelected = currentMood === option.type;
            return (
              <button
                key={option.type || 'none'}
                className={`mood-item-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  onSelectMood(option.type);
                  onClose();
                }}
              >
                <span className="mood-item-emoji">{option.emoji}</span>
                <span className="mood-item-label">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
