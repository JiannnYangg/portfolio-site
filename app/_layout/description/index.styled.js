'use client';

import { motion } from 'framer-motion';
import { styled } from 'styled-components';

/*
 * Intro paragraph: one extra mark, a brand-gradient strike on "AI slop."
 * The four D's in the side note get light, hand-placed marker swatches, one
 * per word, each in its own step of the logo's orange gradient.
 */
const STRIKE_GRADIENT =
  'linear-gradient(90deg, #f9a35a 0%, #f38034 50%, #ec6426 100%)';
/* Marker swatches behind the four D's: one step of the gradient per word,
   lightened so the dark text stays crisp on top */
const SWATCH_COLOR = {
  data: 'rgba(236, 100, 38, 0.24)',
  design: 'rgba(241, 114, 45, 0.26)',
  development: 'rgba(244, 138, 60, 0.26)',
  distribution: 'rgba(249, 163, 90, 0.28)',
};

/* Row / column behaviour (wrap on small screens, two columns from lg up) is set
   in index.jsx with Tailwind's flex-wrap / lg:flex-nowrap, so it follows the
   site's real lg breakpoint. */
export const Wrapper = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  /* stacked (phones, tablets): a tighter gap between the paragraph and the
     side note; from about 930px up this is the same value as before */
  gap: clamp(2.5rem, 6vw, 7rem);

  /* top padding lifted (was clamp(3em, 6vw, 7em)): the paragraph and the side
     note sit close to the dashed line above. The bottom padding is lighter
     than it used to be, because the "About us" circle is now part of the right
     column instead of being pinned into the bottom padding. */
  padding-block: clamp(2em, 3.6vw, 4.25em) clamp(3em, 10vh, 10em);

  /* --section-inset (globals.css) is the one inset every section shares: 1.25rem
     on phones, so the text column is as wide as it can be while still sitting
     clear of the dashed guides; 2.5rem and up from 640px. */
  padding-inline: var(--section-inset);
`;

export const Title = styled.h4`
  font-size: clamp(1.5em, 2.2vw, 3em);
  line-height: 1.55;

  /* Stacked layout (below lg): the vw curve above would stay at its 1.5em
     floor all the way up to a tablet. This one grows from 24px on a small
     phone to 32px, and the line spacing is a little tighter, so the paragraph
     does not turn into a tall, thin column. */
  @media (width < 1024px) {
    font-size: clamp(1.5rem, 4.2vw + 0.35rem, 2rem);
    line-height: 1.42;
  }
`;

/* Positioning context for the paragraph */
export const Frame = styled.div`
  position: relative;
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
  background-image: ${STRIKE_GRADIENT};
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
    background-color: ${({ $variant }) => SWATCH_COLOR[$variant]};
    pointer-events: none;
    ${({ $variant }) => swatches[$variant]}
  }
`;
