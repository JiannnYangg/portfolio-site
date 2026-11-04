'use client';

import { useEffect, useState } from 'react';

const OPTIONS = { hour: '2-digit', minute: '2-digit', hour12: true };

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

/** Live Indian Standard Time (Asia/Kolkata). */
export function LocalTime() {
  const [time, setTime] = useState('--:-- -- IST');

  useEffect(() => {
    setTime(formatTime());
    const timer = setInterval(() => setTime(formatTime()), 10000);
    return () => clearInterval(timer);
  }, []);

  return <time suppressHydrationWarning>{time}</time>;
}
