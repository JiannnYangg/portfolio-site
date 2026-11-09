'use client';

import { useEffect, useRef, useState } from 'react';

import { GRID_CELL, GRID_CELL_H, GRID_LINES } from '@/components';

/**
 * The site's graph-paper grid, continued inside the footer.
 *
 * The page background (components/backdrop) draws the grid over the whole
 * document, but the footer is a solid block on top of it, so without this the
 * notebook lines would stop dead at the footer's edge and the footer would
 * read as a different surface. This draws the very same grid (same colour,
 * same cell size) over the footer, and shifts it by the footer's distance from
 * the top of the page, so every line carries on exactly where the page's grid
 * left off. The css (.grid) then fades it out going down, so the notebook
 * paper slowly dissolves into the orange tiles.
 *
 * The offset is measured, not guessed, and re-measured whenever the page
 * changes size (images, fonts, the window). Until it is measured (the first
 * paint) the grid is simply unshifted, and corrects itself right after.
 */
export function FooterGrid({ className }) {
  const ref = useRef(null);
  const [shift, setShift] = useState(0);

  useEffect(() => {
    const footer = ref.current?.parentElement;
    if (!footer) return undefined;

    const update = () => {
      // distance from the top of the page (<body>) to the top of the footer,
      // ignoring transforms, so a running page animation cannot throw it off
      let top = 0;
      for (
        let node = footer;
        node && node !== document.body;
        node = node.offsetParent
      ) {
        top += node.offsetTop;
      }
      // a page line sits every GRID_CELL_H px from the top of the page; in
      // footer coordinates the first one is this far from the footer's top
      setShift(((-top % GRID_CELL_H) + GRID_CELL_H) % GRID_CELL_H);
    };

    update();

    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(document.body);
    window.addEventListener('resize', update);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden='true'
      className={className}
      style={{
        backgroundImage: GRID_LINES,
        backgroundSize: GRID_CELL,
        backgroundPosition: `0 ${shift}px`,
      }}
    />
  );
}
