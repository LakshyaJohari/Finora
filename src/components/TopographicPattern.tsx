export function TopographicPattern() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14]"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <pattern id="topo" width="160" height="160" patternUnits="userSpaceOnUse">
          <path
            d="M12,84 C12,40 56,16 100,16 C144,16 148,56 112,84 C80,108 12,128 12,84 Z"
            fill="none"
            stroke="#3F9C97"
            strokeWidth={1.5}
          />
          <path
            d="M26,84 C26,52 60,32 92,32 C124,32 128,58 104,80 C82,100 26,108 26,84 Z"
            fill="none"
            stroke="#3F9C97"
            strokeWidth={1.5}
          />
          <path
            d="M40,84 C40,62 64,48 86,48 C108,48 110,62 96,76 C84,88 40,92 40,84 Z"
            fill="none"
            stroke="#3F9C97"
            strokeWidth={1.5}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#topo)" />
    </svg>
  )
}
