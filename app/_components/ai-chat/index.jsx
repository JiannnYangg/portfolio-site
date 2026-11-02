'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { motion, useReducedMotion } from 'framer-motion';
import { AudioWaveform, Mic, Search } from 'lucide-react';

import './ai-chat.css';

const PROMPTS = [
  'Ask me anything...',
  'Ask about my work...',
  'Ask about my projects...',
  "Ask what I'm building...",
];

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

/**
 * Glass AI chat box: orb on the left, input, mic + waveform actions
 * and a round submit button on the right.
 *
 * @param {{
 *   delay?: number,
 *   className?: string,
 *   onSubmit?: (value: string) => void,
 * }} props
 * `delay` (seconds) postpones the intro animation.
 */
export function AiChat({ delay = 0, className = '', onSubmit }) {
  const reduceMotion = useReducedMotion();
  const inputRef = useRef(null);
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [placeholder, setPlaceholder] = useState('');

  /* typing-effect placeholder, paused while focused or once there is text */
  useEffect(() => {
    if (focused || value) return undefined;

    if (reduceMotion) {
      setPlaceholder(PROMPTS[0]);
      return undefined;
    }

    let promptIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timer;

    const tick = () => {
      const current = PROMPTS[promptIdx];
      charIdx += deleting ? -1 : 1;
      setPlaceholder(current.slice(0, charIdx));

      let wait = deleting ? 22 : 55 + Math.random() * 40;
      if (!deleting && charIdx === current.length) {
        wait = 2200;
        deleting = true;
      } else if (deleting && charIdx === 0) {
        deleting = false;
        promptIdx = (promptIdx + 1) % PROMPTS.length;
        wait = 400;
      }
      timer = setTimeout(tick, wait);
    };

    timer = setTimeout(tick, (delay + 1.2) * 1000);
    return () => clearTimeout(timer);
  }, [focused, value, delay, reduceMotion]);

  const handleSubmit = useCallback(
    event => {
      event.preventDefault();
      const trimmed = value.trim();
      if (!trimmed) {
        inputRef.current?.focus();
        return;
      }
      onSubmit?.(trimmed);
      setValue('');
    },
    [value, onSubmit],
  );

  const showCaret = !focused && !value;

  return (
    <motion.form
      role='search'
      aria-label='AI chat'
      onSubmit={handleSubmit}
      className={`flex w-full max-w-[34rem] items-center gap-3 font-[family-name:var(--font-montserrat)] ${className}`}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: EASE_OUT_EXPO }}
    >
      {/* pill: opens from the centre */}
      <motion.div
        className='ai-chat-glass flex h-14 min-w-0 flex-1 items-center gap-2 rounded-full pl-2 pr-2.5 text-white md:h-16 md:gap-3'
        initial={
          reduceMotion ? false : { clipPath: 'inset(0 50% 0 50% round 999px)' }
        }
        animate={{ clipPath: 'inset(0 0% 0 0% round 999px)' }}
        transition={{ delay: delay + 0.35, duration: 1.1, ease: EASE_OUT_EXPO }}
      >
        <span className='ai-orb' aria-hidden='true' />

        <div className='relative flex min-w-0 flex-1 items-center'>
          <input
            ref={inputRef}
            type='text'
            value={value}
            onChange={event => setValue(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={focused ? 'Type...' : placeholder}
            aria-label='Ask a question'
            autoComplete='off'
            spellCheck={false}
            className='w-full bg-transparent pl-[18px] text-base font-medium text-white caret-white/80 outline-none placeholder:text-white/75'
          />
          {showCaret && (
            <span
              aria-hidden='true'
              className='ai-chat-caret pointer-events-none absolute left-3 top-1/2 h-[18px] w-0.5 -translate-y-1/2 rounded-sm bg-white/75'
            />
          )}
        </div>

        <div className='flex shrink-0 items-center gap-1'>
          <button
            type='button'
            aria-label='Voice input'
            className='flex size-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white md:size-11'
          >
            <Mic size={20} strokeWidth={2} />
          </button>
          <button
            type='button'
            aria-label='Start audio'
            className='flex size-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white md:size-11'
          >
            <AudioWaveform size={20} strokeWidth={2} />
          </button>
        </div>
      </motion.div>

      {/* round submit button */}
      <motion.button
        type='submit'
        aria-label='Send'
        className='ai-chat-glass flex size-14 shrink-0 items-center justify-center rounded-full text-white transition-transform duration-300 ease-in-expo hover:scale-105 md:size-16'
        initial={reduceMotion ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          delay: delay + 0.1,
          duration: 0.5,
          ease: [0.34, 1.56, 0.64, 1],
        }}
      >
        <Search size={22} strokeWidth={2} />
      </motion.button>
    </motion.form>
  );
}
