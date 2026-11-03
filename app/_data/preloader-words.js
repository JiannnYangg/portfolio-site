/**
 * Welcome greetings for the entry screen. Each one is the same greeting as
 * before, written in English letters (Latin script) so it is read with the
 * same pronunciation as the original word:
 * - Marathi: Namaskar (नमस्कार)
 * - Hindi: Namaste (नमस्ते), deliberately second, not first
 * - Gujarati: Kem Chho (કેમ છો, "how are you" is the everyday hello)
 * - Tamil: Vanakkam (வணக்கம்)
 * - Bengali: Nomoshkar (নমস্কার)
 * - Punjabi: Sat Sri Akal (ਸਤ ਸ੍ਰੀ ਅਕਾਲ)
 *
 * Keep exactly 6 entries: the intro length is FIRST_MS + (greetings - 1) *
 * EACH_MS in transition/preloader/index.jsx (600 + 5 * 300 = 2100 ms), and
 * the Transition timer in transition/index.jsx must match it. Add or remove
 * a greeting and both numbers have to change too.
 *
 * `lang` is kept even though the text is now in English letters: screen
 * readers use it to say each greeting with its own pronunciation.
 */
export const preloaderGreetings = [
  { text: 'Namaskar', lang: 'mr' },
  { text: 'Namaste', lang: 'hi' },
  { text: 'Kem Chho', lang: 'gu' },
  { text: 'Vanakkam', lang: 'ta' },
  { text: 'Nomoshkar', lang: 'bn' },
  { text: 'Sat Sri Akal', lang: 'pa' },
];

/** Plain-string list, kept for anything that only needs the words */
export const preloaderWords = preloaderGreetings.map(({ text }) => text);
