import { useEffect, useRef } from 'react';

export const useModalAwareButton = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handlePointerDown = (e: PointerEvent) => {
      // Only stop propagation, don't prevent default
      e.stopPropagation();
    };

    const handleClick = (e: MouseEvent) => {
      // Only stop propagation, don't prevent default
      e.stopPropagation();
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Only stop propagation, don't prevent default
      e.stopPropagation();
    };

    const handleTouchStart = (e: TouchEvent) => {
      // Only stop propagation, don't prevent default
      e.stopPropagation();
    };

    // Prevent backdrop clicks from bubbling up
    const handleBackdropClick = (e: Event) => {
      if (e.target === button || button.contains(e.target as Node)) {
        e.stopPropagation();
      }
    };

    button.addEventListener('pointerdown', handlePointerDown, true);
    button.addEventListener('click', handleClick, true);
    button.addEventListener('mousedown', handleMouseDown, true);
    button.addEventListener('touchstart', handleTouchStart, true);
    document.addEventListener('click', handleBackdropClick, true);

    return () => {
      button.removeEventListener('pointerdown', handlePointerDown, true);
      button.removeEventListener('click', handleClick, true);
      button.removeEventListener('mousedown', handleMouseDown, true);
      button.removeEventListener('touchstart', handleTouchStart, true);
      document.removeEventListener('click', handleBackdropClick, true);
    };
  }, []);

  return buttonRef;
}; 