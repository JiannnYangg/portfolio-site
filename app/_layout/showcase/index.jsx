'use client';

/*
 * Showcase: the liquid-glass carousel as a page section.
 *
 * All WebGL / animation logic lives in ./engine.js (based on
 * liquid-glass-carousel by Yousuf Soomro, MIT; see LICENSE-carousel.md).
 * This component only owns the DOM around it: the heading, the counter, the
 * "View" label that trails the pointer, the Close button, and the lightweight
 * fallback.
 *
 * Performance / robustness:
 * - Nothing heavy loads until the section is about to be seen: three.js and
 *   the engine are dynamically imported the first time it is 25% visible.
 * - The render loop is paused whenever the section is off screen.
 * - Phones, tablets, small windows, reduced-motion, data-saver, low-memory /
 *   low-core devices and browsers without WebGL get a plain CSS scroll strip
 *   (no WebGL, no three.js download).
 * - If WebGL fails or the GPU context is lost at any point, it switches to
 *   that same strip instead of leaving a blank block.
 */
import { useEffect, useRef, useState } from 'react';

import { gsap } from 'gsap';
import { createPortal } from 'react-dom';

import { ENTRY, PROJECTS, UI_ANIM } from './config';
import { ShowcaseStrip } from './strip';

/** Same cut-off as the original carousel: a wide-screen experience */
const MIN_VIEWPORT_WIDTH = 1025; // px
const BOOT_VISIBILITY = 0.25; // fraction of the section that boots the engine

const SECTION_HEIGHT =
  'h-screen min-h-[560px] [@supports(height:100svh)]:h-[100svh]';

/** Can this device afford the shader? Evaluated once, on the client. */
function canRunWebGL() {
  const nav = navigator;
  if (nav.connection?.saveData) return false;
  if (nav.deviceMemory && nav.deviceMemory < 4) return false;
  if (nav.hardwareConcurrency && nav.hardwareConcurrency < 4) return false;
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
  const sectionRef = useRef(null);
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
    const wide = window.matchMedia(`(min-width: ${MIN_VIEWPORT_WIDTH}px)`);
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

    let cancelled = false;
    let engine = null;
    let booting = false;
    let bootObserver = null;

    const fail = () => {
      if (cancelled) return;
      failedRef.current = true;
      setMode('fallback');
    };

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
          onActiveChange: setActive,
          onFocusChange: setFocused,
          onEntryDone: setEntryDone,
          onContextLost: fail,
        });
        engineRef.current = engine;
      } catch {
        fail();
      }
    };

    // boot once the section is meaningfully on screen
    bootObserver = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.intersectionRatio >= BOOT_VISIBILITY)) {
          bootObserver.disconnect();
          boot();
        }
      },
      { threshold: BOOT_VISIBILITY },
    );
    bootObserver.observe(sectionRef.current);

    // render only while any part of the section is on screen
    const visibilityObserver = new IntersectionObserver(entries => {
      const visible = entries.some(e => e.isIntersecting);
      if (visible) engine?.resume();
      else engine?.pause();
    });
    visibilityObserver.observe(sectionRef.current);

    return () => {
      cancelled = true;
      bootObserver.disconnect();
      visibilityObserver.disconnect();
      engine?.destroy();
      engineRef.current = null;
      revealPlayedRef.current = false;
      setActive(0);
      setFocused(false);
      setEntryDone(false);
    };
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

  const project = PROJECTS[active] ?? PROJECTS[0];

  return (
    <section
      ref={sectionRef}
      aria-label='Selected work'
      className={`relative w-full ${mode === 'pending' ? 'min-h-[70svh] lg:min-h-svh' : ''}`}
    >
      {mode === 'webgl' && (
        <div
          ref={mountRef}
          className={`relative w-full overflow-hidden ${SECTION_HEIGHT}`}
        >
          <div
            ref={topTextRef}
            aria-live='polite'
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
      )}

      {/* The "View" label is positioned against the viewport. It lives in a
          portal so no transformed ancestor can offset it. */}
      {mounted &&
        mode === 'webgl' &&
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
