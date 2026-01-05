"use client";

import { useEffect } from "react";
import { ServiceWorkerManager } from "@/lib/notifications/service-worker-manager";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    const registerServiceWorker = async () => {
      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        try {
          await ServiceWorkerManager.register();
          console.log("Service Worker registered successfully");
        } catch (error) {
          console.error("Service Worker registration failed:", error);
        }
      }
    };

    registerServiceWorker();
  }, []);

  return null;
}
