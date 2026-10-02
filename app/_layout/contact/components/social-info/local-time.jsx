'use client';

import { useEffect, useState } from 'react';

const formatIST = () =>
  `${new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  })} IST`;

/** Live Indian Standard Time (Asia/Kolkata). */
export function LocalTime() {
  const [time, setTime] = useState('--:-- -- IST');

  useEffect(() => {
    setTime(formatIST());
    const timer = setInterval(() => setTime(formatIST()), 10000);
    return () => clearInterval(timer);
  }, []);

  return <time suppressHydrationWarning>{time}</time>;
}
