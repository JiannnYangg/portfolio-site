import { memo } from 'react';

import styles from '../index.module.css';
import { TILES } from '../tiles';

/**
 * The glass tiles. Purely decorative (aria-hidden, no pointer events).
 * Every tile paints its own slice of ONE shared gradient, so together they
 * read as a single bloom seen through glass (see index.module.css).
 *
 * @param {{ gridRef: import('react').MutableRefObject<HTMLDivElement> }} props
 */
export const GlassField = memo(function GlassField({ gridRef }) {
  return (
    <div ref={gridRef} aria-hidden='true' className={styles.grid}>
      {TILES.map(({ key, style }) => (
        <span key={key} className={styles.tile} style={style} />
      ))}
    </div>
  );
});
