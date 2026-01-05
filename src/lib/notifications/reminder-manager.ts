export class ReminderManager {
  private static readonly PERMISSION_KEY = "notification-permission";

  static async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  static hasPermission(): boolean {
    return (
      "Notification" in window && Notification.permission === "granted"
    );
  }

  static scheduleDaily(time: string): void {
    if (!this.hasPermission()) return;

    const [hours, minutes] = time.split(":").map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilNotification = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      this.showNotification();
      this.scheduleDaily(time);
    }, timeUntilNotification);
  }

  static showNotification(): void {
    if (!this.hasPermission()) return;

    new Notification("Time to journal! ✍️", {
      body: "Take a moment to reflect on your day.",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "daily-reminder",
      requireInteraction: false,
    });
  }

  static cancel(): void {
    // TODO: use Service Workers
  }
}

