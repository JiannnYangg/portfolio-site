/**
 * Welcome greetings for the entry screen, written in English letters (Latin
 * script) so each one is read with the same pronunciation as the original.
 * Order matters, and it is deliberate:
 * 1. Johar (Santali / Ho / Mundari, spoken by Adivasi communities): a very
 *    unpopular one on purpose, so the screen opens with a surprise.
 * 2. Namaste (Hindi, नमस्ते)
 * 3. Namaskar (Marathi, नमस्कार)
 * 4. Vanakkam (Tamil, வணக்கம்)
 * 5. Sat Sri Akal (Punjabi, ਸਤ ਸ੍ਰੀ ਅਕਾਲ)
 *
 * Every greeting is on screen for PRELOADER_GREETING_MS (0.4 s). The whole
 * intro is greetings * 400 ms, derived below, so adding or removing a greeting
 * changes the length everywhere (the preloader and the Transition timer both
 * read PRELOADER_DURATION_MS) and the two can never drift apart.
 *
 * NOTE: the hero timings (header, logos, navbar line and logo shine, page
 * heroes) are written in seconds and sit just after this total. If this value
 * changes, move them by the same amount.
 *
 * `lang` is kept even though the text is in English letters: screen readers
 * use it to say each greeting with its own pronunciation.
 */
export const preloaderGreetings = [
  { text: 'Johar', lang: 'sat' },
  { text: 'Namaste', lang: 'hi' },
  { text: 'Namaskar', lang: 'mr' },
  { text: 'Vanakkam', lang: 'ta' },
  { text: 'Sat Sri Akal', lang: 'pa' },
];

/** Time each greeting stays on screen (ms) */
export const PRELOADER_GREETING_MS = 400;

/** Total length of the intro (ms): 5 greetings * 400 ms = 2000 ms */
export const PRELOADER_DURATION_MS =
  preloaderGreetings.length * PRELOADER_GREETING_MS;

/** Plain-string list, kept for anything that only needs the words */
export const preloaderWords = preloaderGreetings.map(({ text }) => text);
