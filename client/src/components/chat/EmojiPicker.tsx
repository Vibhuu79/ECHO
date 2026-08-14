import React from 'react';

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

const POPULAR_EMOJIS = [
  '👋', '😊', '🔥', '☕', '📚', '💻', '🎮', '🚀',
  '❤️', '✨', '👍', '🎉', '💯', '🤔', '👀', '😎',
  '🙌', '💡', '🎵', '🍕', '🍻', '🤝', '⚡', '🌟'
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelectEmoji, onClose }) => {
  return (
    <div className="absolute bottom-16 left-4 z-50 p-3 bg-[#12141d]/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl w-64 animate-fade-in">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs font-semibold text-white/70">
        <span>Quick Emojis</span>
        <button onClick={onClose} className="text-white/40 hover:text-white">✕</button>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {POPULAR_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelectEmoji(emoji)}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-white/10 rounded-lg transition-transform active:scale-125"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
