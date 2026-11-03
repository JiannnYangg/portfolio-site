'use client';

/*
 * Showcase: the liquid-glass carousel as a page section.
 *
 * All WebGL / animation logic lives in ./engine.js (based on
 * liquid-glass-carousel by Yousuf Soomro, MIT; see LICENSE-carousel.md).
 * This component only owns the DOM around it: the pinned stage, the heading,
 * the counter, the "View" label that trails the pointer, the Close button, and
 * the lightweight fallback.
 *
 * Scroll-driven layout (SCROLL.enabled in ./config):
 *   <section .showcase-pin>      tall: one screen + the scroll length
 *     <div .showcase-stage>      sticky, one screen: the carousel lives here
 * While the section scrolls through the viewport the stage stays pinned and
 * the page's scroll progress (0..1) is fed to the engine, which slides the row
 * from the first card to the last. The footer only comes once the last card
 * has been reached. Needs `overflow: clip` (not hidden) on the page shell,
 * otherwise `position: sticky` has nothing to stick to — see globals.css.
 *
 * Performance / robustness:
 * - Nothing heavy loads until the section is about to be seen: three.js and
 *   the engine are dynamically imported the first time it is 25% visible.
 * - The render loop is paused whenever the section is off screen.
 * - Phones, tablets, small windows, reduced-motion, data-saver, low-memory /
 *   low-core devices, browsers without `overflow: clip` and browsers without
 *   WebGL get a plain CSS scroll strip (no WebGL, no three.js download, no
 *   scroll hijacking).
 * - If WebGL fails or the GPU context is lost at any point, it switches to
 *   that same strip instead of leaving a blank block.
 * - A page restored from the back/forward cache replays the animation from
 *   the start; a normal refresh builds a fresh carousel (and the page shell
 *   returns to the top, see Transition).
 */
import { useEffect, useRef, useState } from 'react';

import { gsap } from 'gsap';
import { createPortal } from 'react-dom';

import { ENTRY, PROJECTS, SCROLL, UI_ANIM, getScrollLength } from './config';
import { ShowcaseStrip } from './strip';

/** Same cut-off as the original carousel: a wide-screen experience */
const MIN_VIEWPORT_WIDTH = 1025; // px
/** The pinned stage is one screen tall (min 560px): shorter windows get the strip */
const MIN_VIEWPORT_HEIGHT = 560; // px
const BOOT_VISIBILITY = 0.25; // fraction of the section that boots the engine

/** Page scroll length (px) of the pinned section; fixed by the config */
const SCROLL_LENGTH = getScrollLength();

/** Used only when the section is not pinned (SCROLL.enabled = false) */
const SECTION_HEIGHT =
  'h-screen min-h-[560px] [@supports(height:100svh)]:h-[100svh]';

const WIDE_QUERY = SCROLL.enabled
  ? `(min-width: ${MIN_VIEWPORT_WIDTH}px) and (min-height: ${MIN_VIEWPORT_HEIGHT}px)`
  : `(min-width: ${MIN_VIEWPORT_WIDTH}px)`;

/** Can this device afford the shader? Evaluated once, on the client. */
function canRunWebGL() {
  const nav = navigator;
  if (nav.connection?.saveData) return false;
  if (nav.deviceMemory && nav.deviceMemory < 4) return false;
  if (nav.hardwareConcurrency && nav.hardwareConcurrency < 4) return false;
  // the pinned stage relies on `position: sticky` surviving the page shell,
  // which needs `overflow: clip`; without it the pin would silently not work
  if (
    SCROLL.enabled &&
    !(typeof CSS !== 'undefined' && CSS.supports?.('overflow', 'clip'))
  )
    return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function Showcase() {
  const wrapperRef = useRef(null); // the tall section the stage is pinned inside
  const sectionRef = useRef(null); // the stage: one pinned screen
  const mountRef = useRef(null); // the engine mounts its canvas here
  const cursorRef = useRef(null); // trailing "View" label, moved by the engine
  const topTextRef = useRef(null);
  const counterRef = useRef(null);
  const engineRef = useRef(null);
  const revealPlayedRef = useRef(false); // entry reveal runs exactly once
  const failedRef = useRef(false); // WebGL failed once: stay on the strip

  const [mode, setMode] = useState('pending'); // pending | webgl | fallback
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);
  const [entryDone, setEntryDone] = useState(false);

  useEffect(() => setMounted(true), []);

  // ---- decide how to render (and keep deciding when the window changes) ----
  useEffect(() => {
    const wide = window.matchMedia(WIDE_QUERY);
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const capable = canRunWebGL();
    const update = () =>
      setMode(
        capable && !failedRef.current && wide.matches && !calm.matches
          ? 'webgl'
          : 'fallback',
      );
    update();
    wide.addEventListener('change', update);
    calm.addEventListener('change', update);
    return () => {
      wide.removeEventListener('change', update);
      calm.removeEventListener('change', update);
    };
  }, []);

  // ---- engine lifecycle ----
  useEffect(() => {
    if (mode !== 'webgl') return undefined;

    const wrapper = wrapperRef.current;
    const stage = sectionRef.current;
    if (!wrapper || !stage) return undefined;

    let cancelled = false;
    let engine = null;
    let booting = false;
    let bootObserver = null;
    let frame = 0;

    const fail = () => {
      if (cancelled) return;
      failedRef.current = true;
      setMode('fallback');
    };

    // How far through the pinned scroll are we? 0 until the wrapper's top
    // reaches the top of the screen, 1 once its last screen is showing.
    const measureProgress = () => {
      if (!SCROLL.enabled) return 0;
      const length = wrapper.offsetHeight - stage.offsetHeight;
      if (length < 1) return 0;
      const top = wrapper.getBoundingClientRect().top;
      return Math.min(1, Math.max(0, -top / length));
    };
    const syncProgress = () => {
      frame = 0;
      engine?.setProgress(measureProgress());
    };
    const scheduleSync = () => {
      if (!frame) frame = requestAnimationFrame(syncProgress);
    };
    if (SCROLL.enabled) {
      window.addEventListener('scroll', scheduleSync, { passive: true });
      window.addEventListener('resize', scheduleSync);
    }

    const boot = async () => {
      if (booting || cancelled) return;
      booting = true;
      try {
        const [THREE, { createCarousel }] = await Promise.all([
          import('./load-three').then(m => m.loadThree()),
          import('./engine'),
        ]);
        if (cancelled || !mountRef.current) return;
        engine = createCarousel(THREE, mountRef.current, {
          cursorElement: cursorRef.current,
          scrollDriven: SCROLL.enabled,
          onActiveChange: setActive,
          onFocusChange: setFocused,
          onEntryDone: setEntryDone,
          onContextLost: fail,
        });
        engineRef.current = engine;
        // the page may already have scrolled while three.js was loading
        engine.setProgress(measureProgress());
      } catch {
        fail();
      }
    };

    // boot once the stage is meaningfully on screen
    bootObserver = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.intersectionRatio >= BOOT_VISIBILITY)) {
          bootObserver.disconnect();
          boot();
        }
      },
      { threshold: BOOT_VISIBILITY },
    );
    bootObserver.observe(stage);

    // render only while any part of the stage is on screen
    const visibilityObserver = new IntersectionObserver(entries => {
      const visible = entries.some(e => e.isIntersecting);
      if (visible) engine?.resume();
      else engine?.pause();
    });
    visibilityObserver.observe(stage);

    return () => {
      cancelled = true;
      bootObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener('scroll', scheduleSync);
      window.removeEventListener('resize', scheduleSync);
      if (frame) cancelAnimationFrame(frame);
      engine?.destroy();
      engineRef.current = null;
      revealPlayedRef.current = false;
      setActive(0);
      setFocused(false);
      setEntryDone(false);
    };
  }, [mode]);

  // Back/forward navigation can restore this page from the browser's cache
  // with the carousel frozen mid-animation (or mid-focus). Start it over.
  useEffect(() => {
    if (mode !== 'webgl') return undefined;
    const onPageShow = e => {
      if (e.persisted) engineRef.current?.reset();
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, [mode]);

  // Escape closes focus mode
  useEffect(() => {
    if (!focused) return undefined;
    const onKey = e => {
      if (e.key === 'Escape') engineRef.current?.closeFocus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focused]);

  // ---- overlay text transitions (GSAP, same vocabulary as the canvas) ----
  useEffect(() => {
    if (mode !== 'webgl') return;
    if (!topTextRef.current || !counterRef.current) return;
    if (!entryDone && ENTRY.enabled) {
      gsap.set([topTextRef.current, counterRef.current], { autoAlpha: 0 });
      revealPlayedRef.current = false;
      return; // stay hidden until the entry settles
    }
    gsap.set(topTextRef.current, { xPercent: -50 }); // GSAP owns the transform
    gsap.set(counterRef.current, { xPercent: -50 });
    const y = focused ? (UI_ANIM.topShiftVh / 100) * window.innerHeight : 0;

    if (entryDone && !focused && !revealPlayedRef.current) {
      // slow gentle fade, once after the entry (closing focus must not replay)
      revealPlayedRef.current = true;
      gsap.fromTo(
        topTextRef.current,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: UI_ANIM.revealDuration,
          ease: UI_ANIM.revealEase,
        },
      );
      gsap.fromTo(
        counterRef.current,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: UI_ANIM.revealDuration,
          ease: UI_ANIM.revealEase,
          delay: UI_ANIM.revealStagger,
        },
      );
      return;
    }

    gsap.to(topTextRef.current, {
      y,
      autoAlpha: 1,
      duration: UI_ANIM.duration,
      ease: UI_ANIM.ease,
    });
    gsap.to(counterRef.current, {
      autoAlpha: focused ? 0 : 1,
      duration: UI_ANIM.duration,
      ease: UI_ANIM.ease,
    });
  }, [mode, focused, entryDone]);

  if (mode === 'fallback') {
    return <ShowcaseStrip projects={PROJECTS} />;
  }

  if (mode === 'pending') {
    // reserve roughly the final height so nothing jumps once the mode is known
    return (
      <section
        aria-label='Selected work'
        className='relative min-h-[70svh] w-full lg:min-h-svh'
      />
    );
  }

  const project = PROJECTS[active] ?? PROJECTS[0];
  const pinned = SCROLL.enabled;

  return (
    <section
      ref={wrapperRef}
      aria-label='Selected work'
      className={pinned ? 'showcase-pin' : 'relative w-full'}
      style={pinned ? { '--showcase-travel': `${SCROLL_LENGTH}px` } : undefined}
    >
      <div ref={sectionRef} className={pinned ? 'showcase-stage' : 'relative'}>
        <div
          ref={mountRef}
          className={`relative w-full overflow-hidden ${pinned ? 'h-full' : SECTION_HEIGHT}`}
        >
          {/* The centered card changes on every few px of scroll, so the visible
              heading is hidden from assistive tech (it would announce nonstop);
              they get the whole list once instead. */}
          <ul className='sr-only'>
            {PROJECTS.map(({ src, brand, desc }) => (
              <li key={src}>
                {brand}: {desc}
              </li>
            ))}
          </ul>

          <div
            ref={topTextRef}
            aria-hidden='true'
            className='pointer-events-none absolute left-1/2 top-[15%] px-4 text-[#1f2024]'
            style={
              ENTRY.enabled ? { opacity: 0, visibility: 'hidden' } : undefined
            }
          >
            <div className='flex flex-col items-center justify-center'>
              <p className='text-center text-base'>{project.brand}</p>
              <p className='text-center'>{project.desc}</p>
            </div>
          </div>

          <div
            ref={counterRef}
            aria-hidden='true'
            className='pointer-events-none absolute bottom-[15%] left-1/2 px-4 text-[#1f2024]'
            style={
              ENTRY.enabled ? { opacity: 0, visibility: 'hidden' } : undefined
            }
          >
            <p className='text-center text-base'>
              {String(active + 1).padStart(2, '0')}/
              {String(PROJECTS.length).padStart(2, '0')}
            </p>
          </div>

          <button
            type='button'
            onClick={() => engineRef.current?.closeFocus()}
            aria-label='Close'
            tabIndex={focused ? 0 : -1}
            className='absolute right-6 top-6 z-10 rounded-full bg-[#1f2024] px-4 py-2 text-sm text-[#b6f500] transition-opacity duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f2024]'
            style={{
              opacity: focused ? 1 : 0,
              pointerEvents: focused ? 'auto' : 'none',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/* The "View" label is positioned against the viewport. It lives in a
          portal so no transformed ancestor can offset it. */}
      {mounted &&
        createPortal(
          <div
            ref={cursorRef}
            aria-hidden='true'
            className='pointer-events-none fixed left-4 top-4 z-50 whitespace-nowrap rounded-full bg-[#b6f500] px-3 py-1 text-sm text-[#1f2024]'
            style={{
              willChange: 'transform',
              opacity: 0,
              visibility: 'hidden',
            }}
          >
            View
          </div>,
          document.body,
        )}
    </section>
  );
}
