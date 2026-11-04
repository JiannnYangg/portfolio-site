import { MAX_COLS, MAX_ROWS, STAIR } from './config';

/** Small fixed hash -> 0..1. Same result on the server and in the browser. */
function noise(col, row) {
  const n = ((col + 1) * 374761 + (row + 1) * 668265 + 12345) % 65521;
  return ((n * 40503 + 1013) % 65521) / 65521;
}

/**
 * How much white sits on a tile's face: a little on the frosted top edge,
 * almost none deeper down, where the bloom should show through clearly.
 */
function gloss(depth, n) {
  if (depth === 0) return 0.3 + n * 0.08;
  if (depth === 1) return 0.18 + n * 0.06;
  return 0.04 + n * 0.08 + (n > 0.9 ? 0.1 : 0);
}

/**
 * How solid a tile is. The colour is strongest low down and thins out toward
 * the skyline, so the top of the field dissolves into the paper like mist
 * instead of stopping at a hard edge. `depth` = tiles below the skyline.
 */
const FADE = [0.46, 0.68, 0.85, 0.95, 1];

function solidity(depth, n) {
  const base = FADE[Math.min(depth, FADE.length - 1)];
  return Math.min(1, base + (depth < FADE.length - 1 ? (n - 0.5) * 0.1 : 0));
}

function buildTiles() {
  const tiles = [];

  for (let col = 0; col < MAX_COLS; col += 1) {
    for (let row = STAIR[col]; row < MAX_ROWS; row += 1) {
      const depth = row - STAIR[col];
      const n = noise(col, row);
      const white = gloss(depth, n);

      tiles.push({
        key: `${col}-${row}`,
        style: {
          '--ft-c': col,
          '--ft-r': row,
          '--ft-g': `${Math.round(white * 100)}%`,
          '--ft-o': solidity(depth, n).toFixed(2),
        },
      });
    }
  }

  return tiles;
}

/** Built once when the module loads, never per render. */
export const TILES = buildTiles();
