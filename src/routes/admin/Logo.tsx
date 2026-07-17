// Logo Magister em SVG inline (importado do Claude Design). Duas peças:
// horizontal (com wordmark) e o ícone quadrado. O tom escolhe a cor do wordmark
// conforme o fundo (rail escuro vs. superfície clara).

type Tone = 'onLight' | 'onDark';

export function MagisterLogo({
  variant = 'full',
  tone = 'onLight',
  height = 30,
}: {
  variant?: 'full' | 'icon';
  tone?: Tone;
  height?: number;
}) {
  if (variant === 'icon') {
    return (
      <svg viewBox="0 0 48 48" style={{ height, width: 'auto', display: 'block' }} role="img" aria-label="Magister">
        <rect x="0" y="0" width="48" height="48" rx="12" fill="#20262B" />
        <rect x="0.75" y="0.75" width="46.5" height="46.5" rx="11.25" fill="none" stroke="#FFFFFF" strokeOpacity="0.08" />
        <text x="23.5" y="34.5" textAnchor="middle" fontSize="30" fontWeight="700" fill="#16C0BE" letterSpacing="-0.5" fontFamily="Poppins, sans-serif">
          M
        </text>
        <circle cx="37.5" cy="12" r="3" fill="#16C0BE" />
      </svg>
    );
  }

  const wordmark = tone === 'onDark' ? '#EEF2F3' : '#20262B';
  const teal = tone === 'onDark' ? '#19C6C4' : '#16C0BE';
  return (
    <svg viewBox="0 0 232 56" style={{ height, width: 'auto', display: 'block' }} role="img" aria-label="Magister">
      <rect x="4" y="4" width="48" height="48" rx="12" fill="#20262B" />
      {tone === 'onDark' && (
        <rect x="4.75" y="4.75" width="46.5" height="46.5" rx="11.25" fill="none" stroke="#FFFFFF" strokeOpacity="0.10" />
      )}
      <text x="27.5" y="38.5" textAnchor="middle" fontSize="30" fontWeight="700" fill={teal} letterSpacing="-0.5" fontFamily="Poppins, sans-serif">
        M
      </text>
      <circle cx="41.5" cy="16" r="3" fill={teal} />
      <text x="66" y="37" fontSize="27" fontWeight="600" fill={wordmark} letterSpacing="-0.4" fontFamily="Poppins, sans-serif">
        Magister
      </text>
      <circle cx="196" cy="36" r="4.5" fill={teal} />
    </svg>
  );
}
