"use client";

/** Restyled Mapbox zoom buttons for 1B, replacing the default NavigationControl. */
export function ZoomControls({
  onZoomIn,
  onZoomOut,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  const buttonStyle: React.CSSProperties = {
    width: 34,
    height: 34,
    background: "var(--card)",
    borderRadius: 9,
    boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 16,
    color: "var(--ink-medium)",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        zIndex: 10,
      }}
    >
      <button onClick={onZoomIn} aria-label="Zoom in" style={buttonStyle}>
        +
      </button>
      <button onClick={onZoomOut} aria-label="Zoom out" style={buttonStyle}>
        −
      </button>
    </div>
  );
}
