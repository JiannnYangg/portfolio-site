'use client';

import { motion } from 'framer-motion';
import { styled } from 'styled-components';

/*
 * Selection-frame style from the reference: one dashed rectangle with solid
 * square handles on the four corners, drawn around the whole paragraph, in
 * the site's bright lime. One extra mark: a solid strike on "AI slop."
 * The four D's in the side note get hand-placed marker swatches in the same lime.
 */
const LIME = '#b6f500';

export const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  justify-content: space-between;
  /* generous gap so the frame (which reaches ~1.75rem outside the text)
     never crowds the side note */
  gap: clamp(3.5rem, 6vw, 7rem);
  /* top padding lifted: text sits much closer to the section above */
  padding-block: clamp(3em, 6vw, 7em) clamp(5em, 14vh, 16em);
  padding-inline: clamp(2.5em, 4vw, 8em);

  @media screen and (min-width: ${({ theme }) => theme?.breakpoints?.lg}) {
    flex-wrap: revert;
  }
`;

export const Title = styled.h4`
  font-size: clamp(1.5em, 2.2vw, 3em);
  line-height: 1.55;
`;

/* Positioning context for the frame around the whole paragraph */
export const Frame = styled.div`
  position: relative;
`;

/* The big dashed rectangle, with breathing room around the text */
export const FrameRect = styled(motion.span)`
  position: absolute;
  left: -1.75rem;
  right: -1.75rem;
  top: -1.5rem;
  bottom: -1.5rem;
  pointer-events: none;

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
    stroke-dasharray: 7 6;
  }
`;

const corners = {
  tl: 'top: 0; left: 0; transform: translate(-50%, -50%);',
  tr: 'top: 0; right: 0; transform: translate(50%, -50%);',
  bl: 'bottom: 0; left: 0; transform: translate(-50%, 50%);',
  br: 'bottom: 0; right: 0; transform: translate(50%, 50%);',
};

/* Solid square corner handle, as in the reference */
export const Handle = styled.span`
  position: absolute;
  width: 22px;
  height: 22px;
  background-color: ${LIME};
  border-radius: 3px;
  pointer-events: none;
  ${({ $pos }) => corners[$pos]}
`;

/* Layout box of the struck phrase. vertical-align: top keeps it on the line grid. */
export const Mark = styled.span`
  position: relative;
  display: inline-block;
  vertical-align: top;
  margin-inline: 0 0.5rem;

  /* struck-out words step back */
  > span:not([aria-hidden='true']) {
    opacity: 0.5;
  }
`;

/* Solid strike line through "AI slop." */
export const Strike = styled(motion.span)`
  position: absolute;
  left: -3%;
  right: -3%;
  top: 56%;
  height: 3px;
  background-color: ${LIME};
  border-radius: 2px;
  pointer-events: none;
`;

/* Four different marker swatches (position, tilt, shape), so the highlights
   feel hand-placed and asymmetric rather than four identical bars. */
const swatches = {
  data: `
    left: -0.2em; right: -0.12em; top: 46%; bottom: 2%;
    transform: rotate(-1.5deg);
  `,
  design: `
    left: -0.25em; right: -0.4em; top: 14%; bottom: 6%;
    transform: skewX(-14deg);
  `,
  development: `
    left: -0.12em; right: -0.25em; top: 58%; bottom: -6%;
    transform: rotate(1.2deg);
  `,
  distribution: `
    left: -0.3em; right: -0.12em; top: 26%; bottom: 0;
    clip-path: polygon(0 18%, 100% 0, 95% 100%, 3% 86%);
  `,
};

export const Highlight = styled.span`
  position: relative;
  isolation: isolate;
  white-space: nowrap;

  &::before {
    content: '';
    position: absolute;
    z-index: -1;
    background-color: ${LIME};
    pointer-events: none;
    ${({ $variant }) => swatches[$variant]}
  }
`;
