'use client';

import { motion } from 'framer-motion';
import { styled } from 'styled-components';

/*
 * Marks are drawn in the site's lime (same family as the backdrop blooms and
 * grid) with a soft lime glow. Only two marks on the whole paragraph: a strike
 * on "AI slop." and a closing selection box on "new status quo."
 */
const LIME = '#8fcf00';
const GLOW = 'rgb(182 245 0 / 0.9)';
const DASH = `repeating-linear-gradient(to right, ${LIME} 0 12px, transparent 12px 18px)`;

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

/* Layout box of a marked phrase. vertical-align: top keeps it on the line grid. */
export const Mark = styled.span`
  position: relative;
  display: inline-block;
  vertical-align: top;
  margin-inline: ${({ $outlined }) => ($outlined ? '0.35em 0.2em' : '0 0.5rem')};

  /* struck-out words step back */
  ${({ $fade }) =>
    $fade &&
    `
    > span:not([aria-hidden='true']) {
      opacity: 0.5;
    }
  `}
`;

/* Dashed selection outline that hugs the glyphs */
export const Outline = styled(motion.span)`
  position: absolute;
  left: -0.35em;
  right: -0.35em;
  top: 0.18em;
  bottom: 0.12em;
  pointer-events: none;
  background-color: ${({ $tint }) => ($tint ? 'rgb(182 245 0 / 0.14)' : 'transparent')};
  filter: drop-shadow(0 0 6px ${GLOW});

  svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  rect {
    fill: none;
    stroke: ${LIME};
    stroke-width: 2;
    stroke-dasharray: 9 6;
    stroke-linecap: round;
  }
`;

const corners = {
  tl: 'top: 0; left: 0; transform: translate(-50%, -50%);',
  tr: 'top: 0; right: 0; transform: translate(50%, -50%);',
  bl: 'bottom: 0; left: 0; transform: translate(-50%, 50%);',
  br: 'bottom: 0; right: 0; transform: translate(50%, 50%);',
};

/* Solid lime square handle with glow */
export const Handle = styled.span`
  position: absolute;
  width: max(9px, 0.3em);
  height: max(9px, 0.3em);
  background-color: ${LIME};
  border-radius: 2px;
  box-shadow: 0 0 8px 1px ${GLOW};
  pointer-events: none;
  ${({ $pos }) => corners[$pos]}
`;

/* Broken strike line through "AI slop." */
export const Strike = styled(motion.span)`
  position: absolute;
  left: -3%;
  right: -3%;
  top: 56%;
  height: 3px;
  background-image: ${DASH};
  border-radius: 2px;
  filter: drop-shadow(0 0 5px ${GLOW});
  pointer-events: none;
`;
