import React from 'react';
import { Compass, Sparkles, MapPin } from 'lucide-react';

interface RadarScanAnimationProps {
  onScanClick?: () => void;
  isScanning?: boolean;
}

export const RadarScanAnimation: React.FC<RadarScanAnimationProps> = ({
  onScanClick,
  isScanning = false
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 text-center w-full max-w-sm mx-auto select-none overflow-hidden">
      {/* Sonar Radar Dish Graphic */}
      <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center mb-5 overflow-hidden rounded-full bg-white/[0.01]">
        {/* Expanding Pulsing Ripple Rings */}
        <div className="absolute inset-0 rounded-full border border-[var(--neon-cyan)]/30 ripple-ring" style={{ animationDelay: '0s' }} />
        <div className="absolute inset-0 rounded-full border border-[var(--hyper-pink)]/20 ripple-ring" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 rounded-full border border-[var(--electric-violet)]/20 ripple-ring" style={{ animationDelay: '2s' }} />

        {/* Concentric Static Distance Rings */}
        <div className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full border border-white/10 bg-white/[0.02]" />
        <div className="absolute w-32 h-32 sm:w-36 sm:h-36 rounded-full border border-white/15 bg-white/[0.02]" />
        <div className="absolute w-20 h-20 sm:w-22 sm:h-22 rounded-full border border-white/20 bg-white/[0.03]" />

        {/* Crosshair Lines */}
        <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent" />

        {/* Rotating Sonar Laser Sweep Beam */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none radar-sweep-line">
          <div
            className="w-1/2 h-1/2 absolute top-0 right-0 origin-bottom-left"
            style={{
              background: 'conic-gradient(from 0deg, rgba(0, 245, 255, 0.45) 0deg, rgba(0, 245, 255, 0) 60deg)'
            }}
          />
        </div>

        {/* Simulated Nearby Blip Points */}
        <div className="absolute top-10 right-12 w-3 h-3 rounded-full bg-[var(--acid-lime)] ping-dot shadow-[0_0_10px_var(--acid-lime)]" />
        <div className="absolute bottom-14 left-10 w-2.5 h-2.5 rounded-full bg-[var(--neon-cyan)] ping-dot shadow-[0_0_8px_var(--neon-cyan)]" style={{ animationDelay: '0.7s' }} />
        <div className="absolute top-16 left-12 w-2 h-2 rounded-full bg-[var(--hyper-pink)] ping-dot shadow-[0_0_8px_var(--hyper-pink)]" style={{ animationDelay: '1.4s' }} />

        {/* Center Glowing Hub Icon */}
        <div className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[var(--electric-violet)] via-[var(--hyper-pink)] to-[var(--neon-cyan)] p-[2px] shadow-[0_0_25px_rgba(0,245,255,0.4)]">
          <div className="w-full h-full rounded-full bg-[#0d0722] flex items-center justify-center text-white">
            <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--neon-cyan)] animate-bounce" />
          </div>
        </div>
      </div>

      {/* Text Info */}
      <h3 className="text-xl font-extrabold text-white tracking-wide mb-1 flex items-center gap-2">
        <span>Scanning Nearby Zone</span>
        <Sparkles className="w-4 h-4 text-[var(--hyper-pink)] animate-spin" style={{ animationDuration: '6s' }} />
      </h3>
      <p className="text-xs text-white/60 leading-relaxed max-w-xs mb-6">
        No users in immediate range right now. Expand your presence or trigger a manual radar scan.
      </p>

      {/* Manual Trigger Button */}
      {onScanClick && (
        <button
          onClick={onScanClick}
          disabled={isScanning}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[var(--neon-cyan)] via-[var(--electric-violet)] to-[var(--hyper-pink)] text-white text-xs font-bold tracking-wider uppercase shadow-[0_0_25px_rgba(0,245,255,0.35)] hover:shadow-[0_0_35px_rgba(255,0,127,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <Compass className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Pinging Radar...' : 'Radar Pulse Scan'}</span>
        </button>
      )}
    </div>
  );
};
