export function PawLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Toes */}
      <circle cx="9" cy="6" r="3" fill="#E07A5F" />
      <circle cx="19" cy="6" r="3" fill="#E07A5F" />
      <circle cx="5" cy="13" r="2.8" fill="#E07A5F" />
      <circle cx="23" cy="13" r="2.8" fill="#E07A5F" />
      {/* Pad */}
      <ellipse cx="14" cy="19" rx="6.5" ry="7.5" fill="#E07A5F" />
    </svg>
  );
}
