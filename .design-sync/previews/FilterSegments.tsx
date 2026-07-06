import { FilterSegments } from "@/components/FilterSegments";

export function CardAll() {
  return (
    <div style={{ width: 220 }}>
      <FilterSegments value="ALL" onChange={() => {}} variant="card" />
    </div>
  );
}

export function CardMLB() {
  return (
    <div style={{ width: 220 }}>
      <FilterSegments value="MLB" onChange={() => {}} variant="card" />
    </div>
  );
}

export function CardNFL() {
  return (
    <div style={{ width: 220 }}>
      <FilterSegments value="NFL" onChange={() => {}} variant="card" />
    </div>
  );
}

export function Sidebar() {
  return (
    <div style={{ width: 300, padding: 20, background: "#fff" }}>
      <FilterSegments value="ALL" onChange={() => {}} variant="sidebar" />
    </div>
  );
}
