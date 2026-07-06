import { VariantSwitcher } from "@/components/redesign/VariantSwitcher";

// VariantSwitcher is `position: fixed` by design (it's a floating dev toggle
// pinned to the viewport) — cfg.overrides.VariantSwitcher pins a card
// viewport so the fixed element renders inside the card instead of escaping.
export function OptionA() {
  return <VariantSwitcher value="a" onChange={() => {}} />;
}

export function OptionB() {
  return <VariantSwitcher value="b" onChange={() => {}} />;
}
