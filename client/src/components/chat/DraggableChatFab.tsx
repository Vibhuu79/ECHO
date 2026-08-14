import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';

interface DraggableChatFabProps {
  unreadCount: number;
  onClick: () => void;
}

export const DraggableChatFab: React.FC<DraggableChatFabProps> = ({ unreadCount, onClick }) => {
  const getContainerBounds = () => {
    const container = document.querySelector('.app-container');
    if (container) {
      const rect = container.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height
      };
    }
    return {
      left: 0,
      right: window.innerWidth,
      top: 0,
      bottom: window.innerHeight,
      width: window.innerWidth,
      height: window.innerHeight
    };
  };

  const getInitialPosition = () => {
    const bounds = getContainerBounds();
    const x = Math.max(bounds.left + 12, bounds.right - 125);
    const y = Math.max(bounds.top + 12, bounds.bottom - 110);
    return { x, y };
  };

  const [position, setPosition] = useState<{ x: number; y: number }>(getInitialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0
  });
  const hasMovedRef = useRef(false);

  // Recalculate position on window resize or mount to ensure FAB stays inside visible app shell
  useEffect(() => {
    const updatePosition = () => {
      const bounds = getContainerBounds();
      const newX = Math.max(bounds.left + 8, Math.min(bounds.right - 120, bounds.right - 125));
      const newY = Math.max(bounds.top + 8, Math.min(bounds.bottom - 60, bounds.bottom - 110));
      setPosition({ x: newX, y: newY });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  const handlePointerDown = (clientX: number, clientY: number) => {
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      posX: position.x,
      posY: position.y
    };
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    const deltaX = clientX - dragStartRef.current.startX;
    const deltaY = clientY - dragStartRef.current.startY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      hasMovedRef.current = true;
    }

    const bounds = getContainerBounds();
    const minX = bounds.left + 8;
    const maxX = Math.max(minX, bounds.right - 120);
    const minY = bounds.top + 8;
    const maxY = Math.max(minY, bounds.bottom - 60);

    const newX = Math.max(minX, Math.min(maxX, dragStartRef.current.posX + deltaX));
    const newY = Math.max(minY, Math.min(maxY, dragStartRef.current.posY + deltaY));

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Mouse Handlers
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handlePointerDown(e.clientX, e.clientY);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handlePointerMove(e.clientX, e.clientY);
      }
    };
    const onMouseUp = () => {
      if (isDragging) {
        handlePointerUp();
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  // Touch Handlers
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchEnd = () => {
    if (isDragging) {
      handlePointerUp();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.stopPropagation();
      return;
    }
    onClick();
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none',
        zIndex: 65
      }}
      className="select-none animate-fade-in"
    >
      <button
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={handleClick}
        className={`px-3.5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold text-xs shadow-[0_6px_25px_rgba(99,102,241,0.6)] border border-indigo-300/40 flex items-center space-x-2 cursor-grab active:cursor-grabbing transition-shadow ${
          isDragging ? 'scale-105 shadow-[0_10px_35px_rgba(99,102,241,0.8)] opacity-95' : 'hover:scale-105'
        }`}
        title="Drag anywhere or click to open Active Chats"
      >
        <div className="relative flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-white animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
        </div>
        <span className="font-extrabold tracking-wide">Chats</span>
        {unreadCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-mono font-extrabold text-[10px] shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};
