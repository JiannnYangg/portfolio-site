'use client';

import { motion } from 'framer-motion';
import { styled } from 'styled-components';

/*
 * Editor's-markup style: hairline, broken strokes drawn in the text's own
 * colour (theme foreground), so nothing new is added to the palette.
 * Marks are used sparingly: one outline, one strike, one dimension line, one
 * closing outline.
 */
const DASH = 'repeating-linear-gradient(to right, currentColor 0 6px, transparent 6px 10px)';

export const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  justify-content: space-between;
  gap: 2.5rem;
  /* top padding lifted: text sits much closer to the section above */
  padding-block: clamp(2.5em, 6vw, 7em) clamp(5em, 14vh, 16em);
  padding-inline: clamp(2.5em, 4vw, 8em);

  @media screen and (min-width: ${({ theme }) => theme?.breakpoints?.lg}) {
    flex-wrap: revert;
  }
`;

export const Title = styled.h4`
  font-size: clamp(1.5em, 2.2vw, 3em);
  line-height: 1.55;
`;

/* Layout box of a marked phrase. vertical-align: top keeps it locked to the
   line grid (the old inline-block drifted upward and overlapped lines). */
export const Mark = styled.span`
  position: relative;
  display: inline-block;
  vertical-align: top;
  margin-inline: ${({ $outlined }) => ($outlined ? '0.3em 0.6em' : '0 0.5rem')};

  /* struck-out words step back */
  ${({ $fade }) =>
    $fade &&
    `
    > span:not([aria-hidden='true']) {
      opacity: 0.5;
    }
  `}
`;

/* Hairline dashed outline that hugs the glyphs (not the full line height) */
export const Outline = styled(motion.span)`
  position: absolute;
  left: -0.3em;
  right: -0.3em;
  top: 0.2em;
  bottom: 0.14em;
  pointer-events: none;
  background-color: ${({ $tint }) => ($tint ? 'rgb(255 255 255 / 0.35)' : 'transparent')};

  svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    shape-rendering: crispEdges;
  }

  rect {
    fill: none;
    stroke: currentColor;
    stroke-width: 0.75;
    stroke-opacity: 0.7;
    stroke-dasharray: 5 4;
  }
`;

const corners = {
  tl: 'top: 0; left: 0; transform: translate(-50%, -50%);',
  tr: 'top: 0; right: 0; transform: translate(50%, -50%);',
  bl: 'bottom: 0; left: 0; transform: translate(-50%, 50%);',
  br: 'bottom: 0; right: 0; transform: translate(50%, 50%);',
};

/* Tiny hollow square handle: paper fill, hairline ink stroke */
export const Handle = styled.span`
  position: absolute;
  width: max(5px, 0.2em);
  height: max(5px, 0.2em);
  background-color: var(--paper);
  border: 1px solid currentColor;
  pointer-events: none;
  ${({ $pos }) => corners[$pos]}
`;

/* Broken strike line through "AI slop." */
export const Strike = styled(motion.span)`
  position: absolute;
  left: -2%;
  right: -2%;
  top: 56%;
  height: 1px;
  background-image: ${DASH};
  pointer-events: none;
`;

/* Technical dimension line under a phrase: dashed rule with end ticks */
export const Dimension = styled(motion.span)`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0.14em;
  height: 1px;
  background-image: ${DASH};
  pointer-events: none;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -0.22em;
    width: 1px;
    height: 0.45em;
    background-color: currentColor;
  }

  &::before {
    left: 0;
  }

  &::after {
    right: 0;
  }
`;
