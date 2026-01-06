"use client";

import { useEffect } from "react";
import { ServiceWorkerManager } from "@/shared/lib/notifications/service-worker-manager";
import { logger } from "@/shared/lib/utils/logger";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    const registerServiceWorker = async () => {
      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        try {
          await ServiceWorkerManager.register();
          logger.info("Service Worker registered successfully");
        } catch (error) {
          logger.error("Service Worker registration failed", error);
        }
      }
    };

    registerServiceWorker();
  }, []);

  return null;
}
