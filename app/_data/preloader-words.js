/**
 * Welcome greetings for the entry screen, each in its own script and in the
 * form people actually use in that culture:
 * - Hindi: नमस्ते (namaste)
 * - Marathi: नमस्कार (namaskar)
 * - Gujarati: કેમ છો (kem chho, "how are you" is the everyday hello)
 * - Tamil: வணக்கம் (vanakkam)
 * - Bengali: নমস্কার (nomoshkar)
 *
 * `lang` lets the browser pick the right system font for each script.
 */
export const preloaderGreetings = [
  { text: 'नमस्ते', lang: 'hi' },
  { text: 'नमस्कार', lang: 'mr' },
  { text: 'કેમ છો', lang: 'gu' },
  { text: 'வணக்கம்', lang: 'ta' },
  { text: 'নমস্কার', lang: 'bn' },
];

/** Plain-string list, kept for anything that only needs the words */
export const preloaderWords = preloaderGreetings.map(({ text }) => text);
