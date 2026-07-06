export function StatTile({
  value,
  total,
  label,
  color,
}: {
  value: number;
  total: number;
  label: string;
  color: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: "oklch(97% 0.006 95)",
        borderRadius: 10,
        padding: "10px 12px",
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 800, color }}>
        {value}
        <span
          style={{ fontSize: 12, fontWeight: 600, color: "oklch(55% 0.01 90)" }}
        >
          /{total}
        </span>
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "oklch(50% 0.01 90)",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
        }}
      >
        {label}
      </div>
    </div>
  );
}
