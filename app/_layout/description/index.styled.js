'use client';

import { motion } from 'framer-motion';
import { styled } from 'styled-components';

/*
 * Selection-frame style from the reference: one dashed rectangle with solid
 * square handles on the four corners, drawn around the whole paragraph, in
 * the site's bright lime. One extra mark: a solid strike on "AI slop."
 * The four D's in the side note get light, hand-placed marker swatches in the
 * same lime, one per word.
 */
const LIME = '#b6f500';
/* Same lime, lightened: used for the marker swatches behind the four D's */
const LIME_LIGHT = 'rgba(182, 245, 0, 0.36)';

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

/*
 * Marker swatches for the four D's. Each one hugs its own word (a hair of
 * overhang on both sides, never a whole letter), covers only the lower part
 * of the letters like a highlighter stroke, and has its own uneven edges and
 * tiny tilt, so the four read as hand-drawn and asymmetric, not as bars.
 */
const swatches = {
  data: `
    left: -0.08em; right: -0.04em; top: 50%; bottom: 8%;
    transform: rotate(-0.8deg);
    clip-path: polygon(0 14%, 100% 0, 97% 100%, 2% 86%);
  `,
  design: `
    left: -0.05em; right: -0.1em; top: 46%; bottom: 10%;
    transform: rotate(0.6deg);
    clip-path: polygon(3% 0, 98% 16%, 100% 92%, 0 100%);
  `,
  development: `
    left: -0.1em; right: -0.05em; top: 54%; bottom: 6%;
    transform: rotate(-0.5deg);
    clip-path: polygon(0 0, 99% 12%, 100% 100%, 4% 82%);
  `,
  distribution: `
    left: -0.04em; right: -0.09em; top: 48%; bottom: 9%;
    transform: rotate(0.8deg);
    clip-path: polygon(1% 16%, 100% 0, 95% 90%, 0 100%);
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
    background-color: ${LIME_LIGHT};
    pointer-events: none;
    ${({ $variant }) => swatches[$variant]}
  }
`;
