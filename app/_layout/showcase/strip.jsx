'use client';

import { motion } from 'framer-motion';

/**
 * The light version of the showcase: a plain CSS scroll-snap strip. No WebGL,
 * no three.js, images load lazily. Used on phones / tablets / small windows,
 * for reduced-motion, data-saver and low-spec devices, and whenever WebGL is
 * unavailable or fails.
 *
 * Layout (same idea as the desktop carousel: every panel has the SAME HEIGHT
 * and gets its width from its own aspect ratio, so nothing is stretched and
 * the row has no empty space under the shorter cards):
 *  - the row height --strip-h follows the screen width (about 13rem on a
 *    phone, up to 26rem on a tablet)
 *  - a card is as wide as its picture is at that height, but never wider than
 *    74% of the screen (a very wide picture is cropped a little instead of
 *    running off the page) and never narrower than 9.5rem, so its caption
 *    stays readable
 *  - the first card starts exactly where the section text starts (--edge:
 *    guide inset + section inset), and the snap points use the same edge, so
 *    a card settles under the text column, not centred. The next card always
 *    peeks in from the right, which is the swipe hint.
 *  - the side spacing is margin on the first / last card, not padding on the
 *    list: scroll padding at the end is ignored by some mobile browsers,
 *    margins are not.
 */
const EDGE =
  'calc((100% - min(100%, 1400px)) / 2 + var(--guide-inset) + var(--section-inset))';

export function ShowcaseStrip({ projects }) {
  return (
    <section
      aria-label='Selected work'
      className='pb-[clamp(2.5rem,6vw,5rem)] pt-[clamp(1.75rem,5vw,5rem)] [--strip-h:clamp(13rem,52vw,26rem)]'
    >
      <ul
        className='flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        style={{ '--edge': EDGE, scrollPaddingInline: 'var(--edge)' }}
        tabIndex={0}
        aria-label='Selected work, scroll sideways'
      >
        {projects.map(({ src, aspect, brand, desc }, i) => (
          <motion.li
            key={src}
            className='min-w-[9.5rem] shrink-0 snap-start first:ml-[var(--edge)] last:mr-[var(--edge)]'
            style={{
              width: `min(calc(var(--strip-h) * ${aspect || 0.75}), 74vw)`,
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: Math.min(i, 3) * 0.06 }}
          >
            <div
              className='overflow-hidden rounded-md'
              style={{ height: 'var(--strip-h)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${brand}: ${desc}`}
                width={Math.round((aspect || 0.75) * 720)}
                height={720}
                loading='lazy'
                decoding='async'
                draggable={false}
                className='size-full object-cover'
              />
            </div>
            <p className='mt-3 text-base leading-snug'>{brand}</p>
            <p className='text-sm leading-snug text-muted-foreground'>{desc}</p>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
