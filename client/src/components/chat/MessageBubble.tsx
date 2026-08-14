import React from 'react';
import { ChatMessage } from '../../types';

interface MessageBubbleProps {
  message: ChatMessage;
  isSelf: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSelf }) => {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-3">
        <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col my-1.5 ${isSelf ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-xs shadow-md backdrop-blur-md transition-all break-words [overflow-wrap:anywhere] [word-break:break-word] ${
          isSelf
            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none'
            : 'bg-white/10 border border-white/10 text-white/90 rounded-bl-none'
        }`}
      >
        {message.type === 'icebreaker' && (
          <div className="text-[10px] font-semibold tracking-wide uppercase text-indigo-200 mb-1">
            🧊 Icebreaker Question
          </div>
        )}
        <p className="leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word]">{message.content}</p>
        <div className={`text-[9px] mt-1 text-right font-mono ${isSelf ? 'text-indigo-200/70' : 'text-white/40'}`}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
};
