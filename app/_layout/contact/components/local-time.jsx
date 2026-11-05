'use client';

import { useEffect, useState } from 'react';

const OPTIONS = { hour: '2-digit', minute: '2-digit', hour12: true };
/** Same width as a real value, so nothing shifts when the clock appears */
const PLACEHOLDER = '--:-- -- IST';

/** Time in India. If the browser cannot do time zones, show the visitor's own
 *  clock and say so, instead of a wrong time with an IST label. */
function formatTime() {
  try {
    const time = new Date().toLocaleTimeString('en-US', {
      ...OPTIONS,
      timeZone: 'Asia/Kolkata',
    });
    return `${time} IST`;
  } catch {
    return `${new Date().toLocaleTimeString('en-US', OPTIONS)} local`;
  }
}

/**
 * Live Indian Standard Time (Asia/Kolkata). Only minutes are shown, so it
 * wakes up once a minute, right on the minute, instead of polling every few
 * seconds, and it sleeps while the tab is hidden (battery friendly on phones
 * and low-spec machines). It catches up the moment the tab is visible again.
 */
export function LocalTime() {
  const [time, setTime] = useState(PLACEHOLDER);

  useEffect(() => {
    let timer = 0;

    const tick = () => {
      setTime(formatTime());
      // sleep until the next minute starts (+50ms so we land after it)
      const wait = 60000 - (Date.now() % 60000) + 50;
      timer = window.setTimeout(tick, wait);
    };

    const onVisibility = () => {
      window.clearTimeout(timer);
      if (!document.hidden) tick();
    };

    tick();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <time suppressHydrationWarning>{time}</time>;
}
