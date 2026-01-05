import { ServiceWorkerManager } from "./service-worker-manager";

export class ReminderManager {
  private static readonly PERMISSION_KEY = "notification-permission";

  static async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      await ServiceWorkerManager.register();
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      await ServiceWorkerManager.register();
      return true;
    }

    return false;
  }

  static hasPermission(): boolean {
    return "Notification" in window && Notification.permission === "granted";
  }

  static async scheduleDaily(time: string): Promise<void> {
    if (!this.hasPermission()) {
      console.warn("Notification permission not granted");
      return;
    }

    if (!ServiceWorkerManager.isRegistered()) {
      const registered = await ServiceWorkerManager.register();
      if (!registered) {
        console.error("Failed to register Service Worker");
        return;
      }
    }

    await ServiceWorkerManager.scheduleNotification(time, true);
  }

  static async cancel(): Promise<void> {
    await ServiceWorkerManager.cancelNotifications();
  }

  static showNotification(): void {
    if (!this.hasPermission()) return;

    const registration = ServiceWorkerManager.getRegistration();
    if (registration) {
      registration.showNotification("Time to journal! ✍️", {
        body: "Take a moment to reflect on your day.",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "daily-reminder",
        requireInteraction: false,
      });
    } else {
      new Notification("Time to journal! ✍️", {
        body: "Take a moment to reflect on your day.",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "daily-reminder",
        requireInteraction: false,
      });
    }
  }
}
