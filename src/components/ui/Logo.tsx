// Logo placeholder textual (adapta ao tema via currentColor).
// Quando a saida do Claude Design chegar, trocar por:
//   import logo from '@/assets/logo.svg';  ->  <img src={logo} height={height} alt="Magister" />
export function Logo({ height = 22 }: { height?: number }) {
  return (
    <span
      aria-label="Magister"
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 2,
        fontFamily: 'var(--font-heading)',
        fontWeight: 700,
        fontSize: height,
        lineHeight: 1,
        color: 'currentColor',
        letterSpacing: '-0.01em',
      }}
    >
      Magister
      <span aria-hidden="true" style={{ color: 'var(--accent)' }}>
        .
      </span>
    </span>
  );
}
