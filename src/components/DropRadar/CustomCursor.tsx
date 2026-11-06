import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable custom cursor on non-touch screens
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable =
          target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.closest('button') ||
          target.closest('a') ||
          target.closest('[data-cursor="pointer"]');
        setIsHovered(!!isClickable);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  // Smooth trailing effect
  useEffect(() => {
    let animId: number;
    const follow = () => {
      setTrailingPos((prev) => ({
        x: prev.x + (pos.x - prev.x) * 0.22,
        y: prev.y + (pos.y - prev.y) * 0.22
      }));
      animId = requestAnimationFrame(follow);
    };
    animId = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(animId);
  }, [pos]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Outer Glowing Ring */}
      <div
        className="fixed top-0 left-0 rounded-full transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${trailingPos.x - (isHovered ? 24 : 16)}px, ${trailingPos.y - (isHovered ? 24 : 16)}px, 0)`,
          width: isHovered ? '48px' : '32px',
          height: isHovered ? '48px' : '32px',
          border: isHovered ? '2px solid #22d3ee' : '1.5px solid rgba(139, 92, 246, 0.6)',
          backgroundColor: isHovered ? 'rgba(34, 211, 238, 0.15)' : 'transparent',
          boxShadow: isHovered ? '0 0 20px rgba(34, 211, 238, 0.5)' : '0 0 10px rgba(139, 92, 246, 0.3)'
        }}
      />
      {/* Inner Dot */}
      <div
        className="fixed top-0 left-0 rounded-full bg-cyan-400"
        style={{
          transform: `translate3d(${pos.x - 3}px, ${pos.y - 3}px, 0)`,
          width: '6px',
          height: '6px',
          boxShadow: '0 0 8px #22d3ee'
        }}
      />
    </div>
  );
};
