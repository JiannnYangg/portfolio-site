/** Four-point star with curved sides. Drawn in the colour of its parent. */
export function Sparkle({ className }) {
  return (
    <svg
      viewBox='0 0 24 24'
      className={className}
      aria-hidden='true'
      focusable='false'
    >
      <path
        fill='currentColor'
        d='M12 0c.7 6.9 5.1 11.3 12 12-6.9.7-11.3 5.1-12 12-.7-6.9-5.1-11.3-12-12C6.9 11.3 11.3 6.9 12 0z'
      />
    </svg>
  );
}
