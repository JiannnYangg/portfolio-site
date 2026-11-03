/**
 * three.js is only needed by this one section, and only on devices that can
 * run it. It is loaded on demand from a CDN (exact version, immutable URL,
 * cached by the browser) instead of being bundled, so it adds nothing to the
 * site's JavaScript and the page never pays for it unless the carousel boots.
 *
 * If the import fails (offline, blocked CDN) the promise rejects and the
 * section falls back to the lightweight strip.
 *
 * To bundle it instead: `pnpm add three`, then replace the body of
 * loadThree with `return import('three')`.
 */
const THREE_URL =
  'https://cdn.jsdelivr.net/npm/three@0.184.0/build/three.module.min.js';

let pending = null;

export function loadThree() {
  if (!pending) {
    pending = import(/* webpackIgnore: true */ THREE_URL).catch(error => {
      pending = null; // allow a retry on the next attempt
      throw error;
    });
  }
  return pending;
}
