type BrandCarProps = {
  size?: number;
};

/** The A Punto mark: a compact, front-facing car built to remain clear at favicon size. */
export function BrandCar({ size = 32 }: BrandCarProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 64 64"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14 43.5 17.7 29c.7-2.9 3.3-5 6.3-5h16c3 0 5.6 2.1 6.3 5L50 43.5v7.2c0 1.8-1.5 3.3-3.3 3.3h-4.4c-1.8 0-3.3-1.5-3.3-3.3v-2.2H25v2.2c0 1.8-1.5 3.3-3.3 3.3h-4.4c-1.8 0-3.3-1.5-3.3-3.3v-7.2Z" fill="currentColor" />
      <path d="M21.5 29.5h21l2.4 9.5H19.1l2.4-9.5Z" fill="#121714" />
      <path d="M24 32.5h16" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
      <path d="M19 42h7v5h-8.5c-1.4 0-2.5-1.1-2.5-2.5S16.1 42 17.5 42H19Zm19 0h7v5h-8.5c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5H38Z" fill="#121714" />
      <path d="M28 45.5h8" stroke="#121714" strokeLinecap="round" strokeWidth="2.5" />
      <path d="M21 27.5h22" stroke="#121714" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}
