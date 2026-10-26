import type { ReactNode } from "react";
import { SiteNav } from "./SiteNav";
import { SiteFooter } from "./SiteFooter";

export function PageShell({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div className={dark ? "min-h-screen bg-ink" : "min-h-screen bg-background"}>
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
