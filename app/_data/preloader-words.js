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
 * Every greeting is on screen for PRELOADER_GREETING_MS (0.5 s). The whole
 * intro is greetings * 500 ms, derived below, so adding or removing a greeting
 * changes the length everywhere (the preloader and the Transition timer both
 * read PRELOADER_DURATION_MS) and the two can never drift apart.
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
export const PRELOADER_GREETING_MS = 500;

/** Total length of the intro (ms): 5 greetings * 500 ms = 2500 ms */
export const PRELOADER_DURATION_MS =
  preloaderGreetings.length * PRELOADER_GREETING_MS;

/** Plain-string list, kept for anything that only needs the words */
export const preloaderWords = preloaderGreetings.map(({ text }) => text);
