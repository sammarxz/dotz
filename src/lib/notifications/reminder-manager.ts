import { ServiceWorkerManager } from "./service-worker-manager";

export class ReminderManager {
  private static readonly PERMISSION_KEY = "notification-permission";

  /**
   * Solicita permissão para notificações
   */
  static async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      // Garante que o Service Worker está registrado
      await ServiceWorkerManager.register();
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Registra o Service Worker após permissão concedida
      await ServiceWorkerManager.register();
      return true;
    }

    return false;
  }

  /**
   * Verifica se tem permissão para notificações
   */
  static hasPermission(): boolean {
    return (
      "Notification" in window && Notification.permission === "granted"
    );
  }

  /**
   * Agenda notificação diária usando Service Worker
   */
  static async scheduleDaily(time: string): Promise<void> {
    if (!this.hasPermission()) {
      console.warn("Notification permission not granted");
      return;
    }

    // Garante que o Service Worker está registrado
    if (!ServiceWorkerManager.isRegistered()) {
      const registered = await ServiceWorkerManager.register();
      if (!registered) {
        console.error("Failed to register Service Worker");
        return;
      }
    }

    // Envia mensagem para o Service Worker agendar
    await ServiceWorkerManager.scheduleNotification(time, true);
  }

  /**
   * Cancela todas as notificações agendadas
   */
  static async cancel(): Promise<void> {
    await ServiceWorkerManager.cancelNotifications();
  }

  /**
   * Mostra notificação imediatamente (para testes)
   */
  static showNotification(): void {
    if (!this.hasPermission()) return;

    // Tenta usar Service Worker se disponível
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
      // Fallback para Notification API direta
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

