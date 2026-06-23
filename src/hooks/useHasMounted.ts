"use client";

import { useEffect, useState } from "react";

/** False on server and first client render; true after mount. Use before localStorage/window/Date UI. */
export function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setHasMounted(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  return hasMounted;
}
