import { LogoMark } from "@/components/LogoMark";

export function Default() {
  return <LogoMark size={30} />;
}

export function NoDot() {
  return <LogoMark size={26} dot={false} />;
}

export function Small() {
  return <LogoMark size={20} />;
}
