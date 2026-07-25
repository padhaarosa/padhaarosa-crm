"use client";

import { useEffect } from "react";

/**
 * Mounted once in the root layout (never remounts on navigation).
 * When a filter chip flags an in-flight navigation (window.__keepScrollY),
 * any framework-initiated jump back to the top is immediately undone.
 */
export function ScrollKeeper() {
  useEffect(() => {
    const onScroll = () => {
      const flag = (window as any).__keepScrollY as { y: number; until: number } | undefined;
      if (!flag) return;
      if (Date.now() > flag.until) {
        delete (window as any).__keepScrollY;
        return;
      }
      // Framework snapped us to the top mid-transition → restore.
      if (window.scrollY === 0 && flag.y > 0) {
        delete (window as any).__keepScrollY;
        requestAnimationFrame(() => window.scrollTo({ top: flag.y, behavior: "instant" as ScrollBehavior }));
      }
    };
    // user interaction cancels any pending restore
    const cancel = () => delete (window as any).__keepScrollY;
    window.addEventListener("scroll", onScroll);
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchmove", cancel, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchmove", cancel);
    };
  }, []);
  return null;
}
