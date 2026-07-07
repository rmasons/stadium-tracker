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
        background: "var(--surface)",
        borderRadius: 10,
        padding: "10px 12px",
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 800, color }}>
        {value}
        <span
          style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}
        >
          /{total}
        </span>
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
        }}
      >
        {label}
      </div>
    </div>
  );
}
