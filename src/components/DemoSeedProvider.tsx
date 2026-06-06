"use client";

import { useEffect } from "react";
import { seedPresentationDemo } from "@/lib/demo-seed";

export default function DemoSeedProvider() {
  useEffect(() => {
    seedPresentationDemo();
  }, []);
  return null;
}
