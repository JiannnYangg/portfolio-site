'use client';

import { motion } from 'framer-motion';
import { styled } from 'styled-components';

/* Accent borrowed from the selection-box reference (dashed frame + square handles) */
const ACCENT = '#2f55ff';
const ACCENT_SOFT = 'rgb(47 85 255 / 0.35)';
const ACCENT_TINT = 'rgb(47 85 255 / 0.08)';

export const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  justify-content: space-between;
  gap: 2.5rem;
  /* top padding lifted: text now sits much closer to the section above */
  padding-block: clamp(2.5em, 6vw, 7em) clamp(5em, 14vh, 16em);
  padding-inline: clamp(2.5em, 4vw, 8em);

  @media screen and (min-width: ${({ theme }) => theme?.breakpoints?.lg}) {
    flex-wrap: revert;
  }
`;

export const Title = styled.h4`
  font-size: clamp(1.5em, 2.2vw, 3em);
  line-height: 1.6;
`;

/* Big off-centre dashed frame around the whole paragraph (reaches further
   right and down than up and left, so it feels hand-placed, not boxed in) */
export const Frame = styled.div`
  position: relative;
  font-size: clamp(1.5em, 2.2vw, 3em);
`;

export const FrameRect = styled(motion.span)`
  position: absolute;
  inset: -1.1rem -1.5rem -1.7rem -1rem;
  border: 1px dashed ${ACCENT_SOFT};
  pointer-events: none;
`;

const corners = {
  tl: 'top: 0; left: 0; transform: translate(-50%, -50%);',
  tr: 'top: 0; right: 0; transform: translate(50%, -50%);',
  bl: 'bottom: 0; left: 0; transform: translate(-50%, 50%);',
  br: 'bottom: 0; right: 0; transform: translate(50%, 50%);',
};

export const Handle = styled.span`
  position: absolute;
  width: max(7px, 0.34em);
  height: max(7px, 0.34em);
  background-color: ${ACCENT};
  border-radius: 1px;
  pointer-events: none;
  ${({ $pos }) => corners[$pos]}
`;

/* Inline selection box around a phrase */
export const Box = styled(motion.span)`
  position: relative;
  display: inline-block;
  margin-inline-end: 0.5rem;
  padding-inline: 0.3em;
  border: 1.5px dashed ${ACCENT};
  background-color: ${({ $tint }) => ($tint ? ACCENT_TINT : 'transparent')};
  opacity: ${({ $strike }) => ($strike ? 0.75 : 1)};
`;

/* Hand-drawn style strike line for the "AI slop" box */
export const Strike = styled(motion.span)`
  position: absolute;
  left: -2%;
  right: -2%;
  top: 54%;
  height: 2px;
  background-color: ${ACCENT};
  transform-origin: left center;
  rotate: -2deg;
  pointer-events: none;
`;
