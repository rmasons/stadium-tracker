// Gradient square logo mark (blue → red, MLB → NFL) that replaces the 🏟️
// emoji across the app. `dot` renders the small centered white dot used in
// the 1A header; 1B's sidebar header omits it (see design_handoff_redesign).
export function LogoMark({
  size = 30,
  radius,
  dot = true,
}: {
  size?: number;
  radius?: number;
  dot?: boolean;
}) {
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: radius ?? Math.round(size * 0.27),
        background:
          "linear-gradient(135deg, oklch(55% 0.14 250), oklch(55% 0.14 25))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {dot && (
        <div
          style={{
            width: Math.round(size / 3),
            height: Math.round(size / 3),
            borderRadius: 9999,
            background: "#fff",
          }}
        />
      )}
    </div>
  );
}
