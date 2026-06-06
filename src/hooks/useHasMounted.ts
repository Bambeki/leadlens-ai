"use client";

import { useEffect, useState } from "react";

/** False on server and first client render; true after mount. Use before localStorage/window/Date UI. */
export function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}
