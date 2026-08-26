type BrandCarProps = {
  size?: number;
};

/** The A Punto mark: a side-profile car that stays identifiable at favicon size. */
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
      <path d="M6 41.5c0-3.2 2-6.1 5-7.1l7.5-2.5 6-11.1c.8-1.5 2.4-2.5 4.1-2.5h11.7c1.8 0 3.4.9 4.3 2.4l6.2 10.5h5.7c3.1 0 5.5 2.5 5.5 5.5v9.8c0 2.5-2 4.5-4.5 4.5h-3.6a7.8 7.8 0 0 1-15.4 0H27.4a7.8 7.8 0 0 1-15.4 0h-1.5A4.5 4.5 0 0 1 6 46.5v-5Z" fill="currentColor" />
      <path d="M23.3 31.9 27.5 24c.2-.4.6-.7 1.1-.7h5.3v8.6h-10.6Zm13.1-8.6h3.9c.5 0 .9.3 1.2.7l4.6 7.9H36.4v-8.6Z" fill="#d2df59" />
      <path d="M51.5 35.7h5" stroke="#d2df59" strokeLinecap="round" strokeWidth="2.5" />
      <circle cx="19.7" cy="48.5" fill="#121714" r="5.6" />
      <circle cx="46.1" cy="48.5" fill="#121714" r="5.6" />
      <circle cx="19.7" cy="48.5" fill="#d2df59" r="2" />
      <circle cx="46.1" cy="48.5" fill="#d2df59" r="2" />
    </svg>
  );
}
