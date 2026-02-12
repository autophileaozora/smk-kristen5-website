import { useRef, useCallback } from 'react';

/**
 * Hook for touch/mouse swipe detection on carousels.
 * Returns event handlers to spread on the swipeable container.
 *
 * Usage:
 *   const swipeHandlers = useSwipe({ onLeft: nextSlide, onRight: prevSlide });
 *   <div {...swipeHandlers}> ... </div>
 */
const useSwipe = ({ onLeft, onRight, threshold = 50 }) => {
  const startX = useRef(0);
  const startY = useRef(0);
  const isDragging = useRef(false);

  const handleStart = useCallback((clientX, clientY) => {
    startX.current = clientX;
    startY.current = clientY;
    isDragging.current = true;
  }, []);

  const handleEnd = useCallback((clientX) => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const diffX = startX.current - clientX;

    if (Math.abs(diffX) < threshold) return;

    if (diffX > 0) {
      onLeft?.();
    } else {
      onRight?.();
    }
  }, [onLeft, onRight, threshold]);

  return {
    onTouchStart: (e) => {
      const t = e.touches[0];
      handleStart(t.clientX, t.clientY);
    },
    onTouchEnd: (e) => {
      const t = e.changedTouches[0];
      handleEnd(t.clientX);
    },
    onMouseDown: (e) => {
      handleStart(e.clientX, e.clientY);
    },
    onMouseUp: (e) => {
      handleEnd(e.clientX);
    },
    onMouseLeave: () => {
      isDragging.current = false;
    },
  };
};

export default useSwipe;
