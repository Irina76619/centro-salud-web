/** Ilustración propia (SVG) para estados vacíos: un calendario con un reloj y destellos en forma de cruz. */
export function IlustracionAgenda() {
  const dias = Array.from({ length: 15 }, (_, i) => ({ x: 52 + (i % 5) * 17, y: 66 + Math.floor(i / 5) * 15, marcado: i === 6 }));
  const cruz = (x: number, y: number, s: number, o: number) => (
    <path transform={`translate(${x} ${y}) scale(${s})`} d="M6 0h6v6h6v6h-6v6h-6v-6H0V6h6z" fill="#5fd3b8" fillOpacity={o} />
  );
  return (
    <svg viewBox="0 0 200 160" role="img" aria-label="Calendario vacío" className="h-auto w-full">
      <ellipse cx="100" cy="84" rx="86" ry="64" fill="#dcf0ea" />
      {cruz(24, 38, 0.7, 0.9)}
      {cruz(168, 30, 0.5, 0.8)}
      {cruz(176, 96, 0.4, 0.7)}
      {/* calendario */}
      <rect x="40" y="34" width="112" height="92" rx="14" fill="#ffffff" stroke="#0b6b5c" strokeWidth="2.5" />
      <path d="M40 48a14 14 0 0 1 14-14h84a14 14 0 0 1 14 14v10H40z" fill="#0b6b5c" />
      <rect x="64" y="26" width="8" height="18" rx="4" fill="#07554a" />
      <rect x="120" y="26" width="8" height="18" rx="4" fill="#07554a" />
      {dias.map((d, i) => (
        <rect key={i} x={d.x} y={d.y} width="11" height="9" rx="2.5" fill={d.marcado ? '#0b6b5c' : '#d9e5e1'} />
      ))}
      {/* reloj */}
      <circle cx="140" cy="116" r="25" fill="#ffffff" stroke="#0b6b5c" strokeWidth="2.5" />
      <circle cx="140" cy="116" r="19" fill="#dcf0ea" />
      <path d="M140 104v12l8 5" fill="none" stroke="#07554a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}