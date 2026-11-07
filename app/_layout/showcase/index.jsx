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
 * The entry animation (cards rise, then grow) is NOT tied to loading or to a
 * scroll threshold any more. It starts the moment the stage begins to come
 * into view, so the cards are already rising while the page settles onto the
 * pin: there is no empty stage and no waiting. As soon as the page is on the
 * pin it is held in place for the rest of the entry (see ./scroll-lock). That
 * is what stops a fast scroller from being several cards deep before the entry
 * ends, which used to skip the first cards. The hold is easy to leave: scrolling
 * up, a link click, or the fail-safe timer all release it.
 *
 * While a navigation click is scrolling the page (the logo, the top links, the
 * side menu: see @/hooks nav-scroll) the section stays out of the way: it does
 * not start its entry or hold the page as the scroll passes through it, so
 * "Contact" really arrives at the footer. When that scroll ends it checks where
 * the visitor landed (landing on the section itself plays the entry).
 *
 * Performance / robustness:
 * - three.js and the engine are fetched, and the shader compiled, in an idle
 *   moment shortly after the page loads (and at the latest when the section is
 *   about one screen away), so the cards are ready the instant it arrives and
 *   nothing hitches; the render loop runs only while the stage is on screen.
 * - The scroll listener only exists while the section is within a screen of
 *   the viewport, and reads the layout once per frame (heights are cached).
 * - Phones, tablets, small windows, reduced-motion, data-saver, low-memory /
 *   low-core devices, browsers without `overflow: clip` and browsers without
 *   WebGL get a plain CSS scroll strip (no WebGL, no three.js download, no
 *   scroll hijacking).
 * - On devices that pass those checks but still struggle, the engine lowers
 *   its resolution step by step (see QUALITY in ./engine).
 * - If WebGL fails or the GPU context is lost at any point, it switches to
 *   that same strip instead of leaving a blank block.
 * - A page restored from the back/forward cache replays the animation from
 *   the start; a normal refresh builds a fresh carousel (and the page shell
 *   returns to the top, see Transition).
 */
import { useEffect, useRef, useState } from 'react';

import { gsap } from 'gsap';
import { createPortal } from 'react-dom';

import { isNavScrolling, NAV_SCROLL_END } from '@/hooks';

import { ENTRY, getScrollLength, PROJECTS, SCROLL, UI_ANIM } from './config';
import { lockScroll, scrollToY } from './scroll-lock';
import { ShowcaseStrip } from './strip';

/** Same cut-off as the original carousel: a wide-screen experience */
const MIN_VIEWPORT_WIDTH = 1025; // px
/** The pinned stage is one screen tall (min 560px): shorter windows get the strip */
const MIN_VIEWPORT_HEIGHT = 560; // px
/** Start loading / compiling when the section is this close (viewport heights) */
const NEAR_MARGIN = '100% 0px 100% 0px';
/**
 * The entry starts once this share of the stage is on screen. Small on purpose:
 * the cards should already be rising as the stage slides into view, not wait
 * for it to be almost fully there. (The page is still guided onto the pin and
 * held for the entry, so a fast scroller cannot skip the first cards.)
 */
const ENTRY_VISIBILITY = 0.15;
/**
 * Load three.js, the engine and the textures, and compile the shader, this
 * long after the page mounts, in an idle moment (so the hero intro is not
 * disturbed). The near-observer below still boots immediately if the visitor
 * gets close to the section before that.
 */
const BOOT_DELAY_MS = 1500;
/** An idle moment is waited for at most this long before booting anyway */
const BOOT_IDLE_TIMEOUT_MS = 3000;
/** The page is only held if at least this share of the stage is on screen */
const LOCK_VISIBILITY = 0.5;

/** Page scroll length (px) of the pinned section; fixed by the config */
const SCROLL_LENGTH = getScrollLength();

/**
 * How long the entry can possibly run (ms) plus a safety margin. It is only the
 * fail-safe of the scroll hold: the hold normally ends with the entry itself.
 */
function getEntryLockMs() {
  const n = PROJECTS.length;
  const rise = ENTRY.stagger * Math.max(n - 1, 1) + ENTRY.riseDuration;
  const grow = ENTRY.growDelay + ENTRY.growStagger * n + ENTRY.growDuration;
  return Math.ceil((ENTRY.delay + rise + grow) * 1000) + 2500;
}
const ENTRY_LOCK_MS = getEntryLockMs();

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
    let frame = 0;
    let stageVisible = false; // is any part of the stage on screen
    let listening = false; // scroll / resize listeners attached
    let entryTriggered = false; // the entry is requested at most once
    let releaseLock = null;
    let gliding = false; // the page is being guided onto the pin
    let entryRunning = false; // the engine's entry animation is playing
    let bootTimer = 0; // delayed, idle-time boot
    let idleHandle = 0;
    let stageHeight = stage.offsetHeight; // cached; kept fresh by resizeObserver

    const fail = () => {
      if (cancelled) return;
      failedRef.current = true;
      setMode('fallback');
    };

    // Share (0..1) of the stage that is on screen right now.
    const stageVisibleShare = () => {
      const r = stage.getBoundingClientRect();
      const vh = window.innerHeight;
      const height = Math.min(r.height, vh) || 1;
      const seen = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      return Math.max(0, seen) / height;
    };

    // How far through the pinned scroll are we? 0 until the wrapper's top
    // reaches the top of the screen, 1 once its last screen is showing. One
    // layout read (the wrapper's rect); the stage height is cached.
    const measureProgress = () => {
      if (!SCROLL.enabled) return 0;
      const rect = wrapper.getBoundingClientRect();
      const length = rect.height - stageHeight;
      if (length < 1) return 0;
      return Math.min(1, Math.max(0, -rect.top / length));
    };

    // ---- entry: starts as the stage comes into view, never waits ----
    // The entry has to be over before the visitor can scroll on, otherwise a
    // fast scroller ends up several cards deep and the first cards are skipped
    // (that is what the page hold is for). It used to wait until most of the
    // stage was on screen AND the page had finished gliding onto the pin, and
    // only then began, so the stage sat empty for a moment. Now the entry
    // starts right away, the page glides onto the pin at the same time, and the
    // hold takes over the moment the page is on the pin.
    const checkEntry = () => {
      if (entryTriggered || !engine || cancelled || !ENTRY.enabled) return;
      // a navigation click is scrolling the page past us: not our moment
      if (isNavScrolling()) return;
      if (stageVisibleShare() < ENTRY_VISIBILITY) return;
      entryTriggered = true;
      const top = wrapper.getBoundingClientRect().top;
      if (top > 0.5) {
        // not on the pin yet: guide the page there while the cards rise. The
        // hold waits until the glide is over (holding would stop the glide).
        gliding = true;
        scrollToY(window.scrollY + top, () => {
          gliding = false;
          if (!cancelled && entryRunning) engageLock();
        });
      }
      engine.beginEntry();
    };

    const syncProgress = () => {
      frame = 0;
      if (!engine) return;
      engine.setProgress(measureProgress());
      checkEntry();
    };
    const scheduleSync = () => {
      if (!frame) frame = requestAnimationFrame(syncProgress);
    };

    // Hold the page still for the rest of the entry. If the stage is not mostly
    // on screen (e.g. a page restored from the back/forward cache while
    // scrolled elsewhere) nothing is held.
    const engageLock = () => {
      releaseLock?.();
      releaseLock = null;
      if (cancelled || isNavScrolling()) return;
      if (stageVisibleShare() < LOCK_VISIBILITY) return;
      releaseLock = lockScroll({
        maxMs: ENTRY_LOCK_MS,
        onRelease: () => {
          releaseLock = null;
        },
      });
    };
    // The engine tells us when an entry starts / ends. While the page is still
    // gliding onto the pin the hold is postponed (see checkEntry): it would
    // stop the glide half way.
    const onEntryStart = () => {
      entryRunning = true;
      if (gliding) return;
      engageLock();
    };
    const onEntryDone = done => {
      setEntryDone(done);
      if (done) {
        entryRunning = false;
        releaseLock?.();
        releaseLock = null;
      }
    };
    // A navigation scroll has ended (its own start already released our hold).
    // Look where the visitor landed: the entry may be due, and an entry that is
    // still playing under the page gets its hold back.
    const onNavScrollEnd = () => {
      if (cancelled) return;
      gliding = false;
      if (entryRunning && !releaseLock) engageLock();
      scheduleSync();
    };
    window.addEventListener(NAV_SCROLL_END, onNavScrollEnd);

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
          deferEntry: SCROLL.enabled && ENTRY.enabled,
          onActiveChange: setActive,
          onFocusChange: setFocused,
          onEntryStart,
          onEntryDone,
          onContextLost: fail,
        });
        engineRef.current = engine;
        // the page may already have scrolled while three.js was loading
        engine.setProgress(measureProgress());
        // it was created (and its shader compiled) possibly well before the
        // section is reached: don't keep rendering an off-screen canvas
        if (!stageVisible) engine.pause();
        checkEntry();
      } catch {
        fail();
      }
    };

    // Scroll / resize listeners only exist while the section is within about
    // a screen of the viewport; far away there is nothing to measure.
    const listen = on => {
      if (on === listening) return;
      listening = on;
      if (on) {
        window.addEventListener('scroll', scheduleSync, { passive: true });
        window.addEventListener('resize', scheduleSync);
        scheduleSync();
      } else {
        window.removeEventListener('scroll', scheduleSync);
        window.removeEventListener('resize', scheduleSync);
      }
    };

    // about a screen away: start loading, and keep the scroll maths running
    const nearObserver = new IntersectionObserver(
      entries => {
        const near = entries.some(e => e.isIntersecting);
        if (near) {
          listen(true);
          boot();
        } else {
          listen(false);
          // left far behind: park the row at the end it was left on
          if (engine && SCROLL.enabled)
            engine.setProgress(wrapper.getBoundingClientRect().top > 0 ? 0 : 1);
        }
      },
      { rootMargin: NEAR_MARGIN },
    );
    nearObserver.observe(wrapper);

    // Boot early, in an idle moment, instead of waiting until the visitor is a
    // screen away: three.js (CDN), the engine, the textures and the shader
    // compile are the slow part, and a visitor who scrolls straight down used to
    // reach the section before they were ready. The idle callback keeps it from
    // competing with the hero intro.
    bootTimer = window.setTimeout(() => {
      if (cancelled) return;
      if ('requestIdleCallback' in window) {
        idleHandle = window.requestIdleCallback(boot, {
          timeout: BOOT_IDLE_TIMEOUT_MS,
        });
      } else {
        boot();
      }
    }, BOOT_DELAY_MS);

    // render only while any part of the stage is on screen
    const visibilityObserver = new IntersectionObserver(entries => {
      stageVisible = entries.some(e => e.isIntersecting);
      if (stageVisible) {
        engine?.resume();
        scheduleSync();
      } else {
        engine?.pause();
      }
    });
    visibilityObserver.observe(stage);

    // keep the cached stage height right when the window / fonts change it
    const resizeObserver = new ResizeObserver(() => {
      stageHeight = stage.offsetHeight;
      if (listening) scheduleSync();
    });
    resizeObserver.observe(stage);

    return () => {
      cancelled = true;
      window.removeEventListener(NAV_SCROLL_END, onNavScrollEnd);
      nearObserver.disconnect();
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      listen(false);
      if (frame) cancelAnimationFrame(frame);
      window.clearTimeout(bootTimer);
      if (idleHandle && 'cancelIdleCallback' in window)
        window.cancelIdleCallback(idleHandle);
      releaseLock?.(); // never leave the page held
      releaseLock = null;
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
            className='absolute right-6 top-6 z-10 rounded-full bg-[#1f2024] px-4 py-2 text-sm text-[#9aa6ff] transition-opacity duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f2024]'
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
            className='pointer-events-none fixed left-4 top-4 z-50 whitespace-nowrap rounded-full bg-[#5a6cff] px-3 py-1 text-sm text-white'
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
