import { ZoomControls } from "@/components/redesign/ZoomControls";

export function Default() {
  return (
    <div
      style={{
        position: "relative",
        width: 120,
        height: 110,
        background: "oklch(97% 0.006 95)",
      }}
    >
      <ZoomControls onZoomIn={() => {}} onZoomOut={() => {}} />
    </div>
  );
}
