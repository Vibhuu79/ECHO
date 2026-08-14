import React from 'react';

interface TypingIndicatorProps {
  username?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ username = 'Peer' }) => {
  return (
    <div className="flex items-center space-x-2 my-1 text-xs text-white/50 pl-2">
      <div className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-[11px] font-mono">{username} is typing...</span>
    </div>
  );
};
