'use client';

import { useEffect } from 'react';

/**
 * A soft glass "lens" that follows the pointer across the tile field.
 *
 * It only writes three CSS variables (--ft-mx, --ft-my, --ft-spot) on the
 * field, at most once per frame, so React never re-renders for it. Mouse and
 * pen only: on touch there is no hover, and a finger scrolling the page must
 * not leave a glow behind. It is also repainted on scroll, because the page
 * moves under a resting pointer without firing a pointer event.
 *
 * @param {import('react').MutableRefObject<HTMLElement>} areaRef listens here
 * @param {import('react').MutableRefObject<HTMLElement>} fieldRef the tiles
 */
export function useSpotlight(areaRef, fieldRef) {
  useEffect(() => {
    const area = areaRef.current;
    const field = fieldRef.current;
    const canHover = window.matchMedia?.('(hover: hover)').matches;

    if (!area || !field || !canHover) return undefined;

    let frame = 0;
    let point = null;

    const paint = () => {
      frame = 0;
      if (!point) return;
      const rect = field.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = ((point.x - rect.left) / rect.width) * 100;
      const y = ((point.y - rect.top) / rect.height) * 100;
      field.style.setProperty('--ft-mx', `${x.toFixed(2)}%`);
      field.style.setProperty('--ft-my', `${y.toFixed(2)}%`);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onMove = event => {
      if (event.pointerType === 'touch') return;
      point = { x: event.clientX, y: event.clientY };
      field.style.setProperty('--ft-spot', '1');
      schedule();
    };

    const onLeave = () => {
      point = null;
      field.style.setProperty('--ft-spot', '0');
    };

    const onScroll = () => {
      if (point) schedule();
    };

    area.addEventListener('pointermove', onMove, { passive: true });
    area.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      area.removeEventListener('pointermove', onMove);
      area.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [areaRef, fieldRef]);
}
