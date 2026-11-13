'use client';

/*
 * ShowcaseLite: the pinned, scroll-driven work row for phones, tablets, small
 * windows and any device that can't afford the WebGL lens (see ./index).
 *
 * It behaves like the desktop carousel:
 *   <section .showcase-pin>   one screen + the scroll length
 *     <div .showcase-stage>   sticky, one screen: the row lives here
 * While the section scrolls through the viewport the stage stays pinned and the
 * page's scroll progress (0..1) slides the row sideways, so each card arrives
 * at the centre one after the other. The page only moves on to the next section
 * once the last card has been reached. Nothing hijacks the scroll: this is plain
 * `position: sticky`, so the browser's own touch scrolling, momentum and
 * address-bar handling all keep working, and there is no way to get trapped.
 *
 * Performance:
 * - No WebGL, no three.js. The row is ONE transformed element moved with
 *   translate3d, once per animation frame, only while the section is within a
 *   screen of the viewport (the scroll listener does not exist otherwise).
 * - One layout read per frame (the section's rect). Sizes are measured when
 *   the stage is resized, not while scrolling.
 * - Card images are fetched only for the centred card and its neighbours
 *   (LITE.preload), not all twelve up front. They stay once loaded.
 * - `will-change` is on only while the stage is on screen.
 *
 * Robustness: a zero-size stage, a missing image, a restored back/forward page,
 * rotating the phone, or a missing IntersectionObserver are all handled below.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { LITE, PROJECTS, SCROLL } from './config';

/** The scroll maths run while the section is this close (viewport heights) */
const NEAR_MARGIN = '100% 0px 100% 0px';
/** The entry starts once this share of the stage is on screen */
const ENTRY_VISIBILITY = 0.15;

// useLayoutEffect warns during server rendering; the effect is client-only
const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Card sizes, centres and the page scroll length for a stage of the given size.
 * Every card has the same height and gets its width from its aspect ratio
 * (like the desktop row), but never more than LITE.maxWidthShare of the screen.
 * Returns null while the stage has no size (hidden / not laid out yet).
 */
export function computeLiteLayout(stageW, stageH) {
  if (!(stageW > 0) || !(stageH > 0)) return null;
  const count = PROJECTS.length;
  const cardH = Math.round(
    clamp(stageH * LITE.heightShare, LITE.minHeight, LITE.maxHeight),
  );
  const maxW = stageW * LITE.maxWidthShare;
  const minW = Math.min(LITE.minWidth, maxW);

  const widths = [];
  const centers = [];
  let x = 0;
  for (let i = 0; i < count; i++) {
    const aspect = PROJECTS[i].aspect > 0 ? PROJECTS[i].aspect : 0.75;
    const w = Math.round(clamp(aspect * cardH, minW, maxW));
    widths.push(w);
    centers.push(x + w / 2);
    x += w + LITE.gap;
  }

  const travel = count > 1 ? centers[count - 1] - centers[0] : 0;
  return {
    stageW,
    stageH,
    cardH,
    widths,
    centers,
    scrollLength: Math.round(travel * LITE.pxPerPx),
    compact: stageH < LITE.compactBelow,
  };
}

/** Index of the card whose centre is closest to the given row position */
function nearestCard(centers, pos) {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < centers.length; i++) {
    const d = Math.abs(centers[i] - pos);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

export function ShowcaseLite() {
  const wrapperRef = useRef(null); // the tall section the stage is pinned in
  const stageRef = useRef(null); // the pinned screen
  const trackRef = useRef(null); // the row, moved with translate3d
  const layoutRef = useRef(null);
  const activeRef = useRef(0);

  const [layout, setLayout] = useState(null);
  const [active, setActive] = useState(0);
  const [entered, setEntered] = useState(false);
  // images are fetched around the centred card only; a card keeps its image
  // once it has one, so scrolling back never shows a blank card
  const [loaded, setLoaded] = useState(
    () => new Set(Array.from({ length: LITE.preload + 1 }, (_, i) => i)),
  );

  // ---- measure the stage (and again whenever its size changes) ----
  useIsoLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const measure = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const prev = layoutRef.current;
      if (prev && prev.stageW === w && prev.stageH === h) return;
      const next = computeLiteLayout(w, h);
      if (!next) return; // keep the last good layout while hidden
      layoutRef.current = next;
      setLayout(next);
    };
    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(stage);
    return () => resizeObserver.disconnect();
  }, []);

  // ---- scroll progress -> row position (re-created when the layout changes) ----
  useEffect(() => {
    if (!layout) return undefined;
    const wrapper = wrapperRef.current;
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!wrapper || !stage || !track) return undefined;

    const { centers, stageW, scrollLength } = layout;
    const first = centers[0];
    const last = centers[centers.length - 1];
    const span = Math.max(0.05, 1 - SCROLL.holdStart - SCROLL.holdEnd);

    let frame = 0;
    let listening = false;
    let cancelled = false;

    // One layout read (the wrapper's rect). 0 until the wrapper's top reaches
    // the top of the screen, 1 once its last screen is showing.
    const apply = () => {
      frame = 0;
      if (cancelled) return;
      const rect = wrapper.getBoundingClientRect();
      const progress =
        scrollLength > 1 ? clamp(-rect.top / scrollLength, 0, 1) : 0;
      // the first / last card rest centred for a short hold at each end
      const q = clamp((progress - SCROLL.holdStart) / span, 0, 1);
      const pos = first + (last - first) * q; // row point at the screen centre
      const x = Math.round(stageW / 2 - pos); // whole px: pictures stay sharp
      track.style.transform = `translate3d(${x}px,0,0)`;

      const index = nearestCard(centers, pos);
      if (index !== activeRef.current) {
        activeRef.current = index;
        setActive(index);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const listen = on => {
      if (on === listening) return;
      listening = on;
      if (on) {
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        schedule();
      } else {
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
      }
    };

    // position the row right away (the page may already be scrolled: reload,
    // #hash, back/forward restore)
    apply();

    let nearObserver = null;
    let visibleObserver = null;

    if (typeof IntersectionObserver === 'undefined') {
      listen(true);
      setEntered(true);
    } else {
      // the scroll listener only exists while the section is about a screen away
      nearObserver = new IntersectionObserver(
        entries => {
          const near = entries.some(e => e.isIntersecting);
          listen(near);
          // left far behind: park the row at the end it was left on
          if (!near) schedule();
        },
        { rootMargin: NEAR_MARGIN },
      );
      nearObserver.observe(wrapper);

      // compositor hint only while the stage is on screen; the entry starts as
      // the stage comes into view
      visibleObserver = new IntersectionObserver(
        entries => {
          const entry = entries[entries.length - 1];
          track.style.willChange = entry.isIntersecting ? 'transform' : 'auto';
          if (entry.intersectionRatio >= ENTRY_VISIBILITY) setEntered(true);
        },
        { threshold: [0, ENTRY_VISIBILITY] },
      );
      visibleObserver.observe(stage);
    }

    // a page restored from the back/forward cache keeps its scroll position
    const onPageShow = () => schedule();
    window.addEventListener('pageshow', onPageShow);

    return () => {
      cancelled = true;
      nearObserver?.disconnect();
      visibleObserver?.disconnect();
      listen(false);
      window.removeEventListener('pageshow', onPageShow);
      if (frame) cancelAnimationFrame(frame);
      track.style.willChange = 'auto';
    };
  }, [layout]);

  // ---- fetch images around the centred card ----
  useEffect(() => {
    setLoaded(prev => {
      let next = null;
      for (let d = -LITE.preload; d <= LITE.preload; d++) {
        const i = active + d;
        if (i < 0 || i >= PROJECTS.length || prev.has(i)) continue;
        next ??= new Set(prev);
        next.add(i);
      }
      return next ?? prev;
    });
  }, [active]);

  const project = PROJECTS[active] ?? PROJECTS[0];
  const compact = layout?.compact ?? false;
  const counter = `${String(active + 1).padStart(2, '0')}/${String(PROJECTS.length).padStart(2, '0')}`;

  const delays = useMemo(
    () =>
      PROJECTS.map(
        (_, i) => Math.min(i, LITE.entryStaggerMax) * LITE.entryStagger,
      ),
    [],
  );

  return (
    <section
      ref={wrapperRef}
      aria-label='Selected work'
      className='showcase-pin showcase-pin--lite'
      style={{ '--showcase-travel': `${layout?.scrollLength ?? 0}px` }}
    >
      <div ref={stageRef} className='showcase-stage'>
        {/* The centred card changes on every few px of scroll, so the visible
            heading is hidden from assistive tech (it would announce nonstop);
            they get the whole list once instead. */}
        <ul className='sr-only'>
          {PROJECTS.map(({ src, brand, desc }) => (
            <li key={src}>
              {brand}: {desc}
            </li>
          ))}
        </ul>

        {layout && (
          <div
            ref={trackRef}
            aria-hidden='true'
            className='absolute inset-y-0 left-0 flex items-center'
            style={{ gap: LITE.gap }}
          >
            {PROJECTS.map(({ src }, i) => (
              <div
                key={src}
                className='shrink-0 overflow-hidden rounded-md bg-black/5'
                style={{
                  width: layout.widths[i],
                  height: layout.cardH,
                  opacity: entered ? 1 : 0,
                  transform: entered
                    ? 'translate3d(0,0,0) scale(1)'
                    : `translate3d(0,${LITE.entryOffset}px,0) scale(${LITE.entryScale})`,
                  transition: `opacity ${LITE.entryDuration * 0.7}s ease-out ${delays[i]}s, transform ${LITE.entryDuration}s cubic-bezier(0.16, 1, 0.3, 1) ${delays[i]}s`,
                }}
              >
                {loaded.has(i) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt=''
                    width={layout.widths[i]}
                    height={layout.cardH}
                    decoding='async'
                    draggable={false}
                    className='size-full select-none object-cover'
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {!compact && (
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-x-0 top-[max(5rem,12%)] px-6 text-center text-[#1f2024]'
            style={{
              opacity: entered ? 1 : 0,
              transition: 'opacity 1.2s ease-out 0.6s',
            }}
          >
            <div
              key={active}
              className='flex flex-col items-center duration-300 animate-in fade-in'
            >
              <p className='text-base'>{project.brand}</p>
              <p>{project.desc}</p>
            </div>
          </div>
        )}

        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-x-0 bottom-[max(2.5rem,10%)] px-6 text-center text-[#1f2024]'
          style={{
            opacity: entered ? 1 : 0,
            transition: 'opacity 1.2s ease-out 0.8s',
          }}
        >
          <p className='text-base'>
            {compact ? `${project.brand} · ${counter}` : counter}
          </p>
        </div>
      </div>
    </section>
  );
}
