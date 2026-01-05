/**
 * Gerencia o registro e comunicação com o Service Worker
 */
export class ServiceWorkerManager {
  private static registration: ServiceWorkerRegistration | null = null;

  /**
   * Registra o Service Worker
   */
  static async register(): Promise<boolean> {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      // Aguarda o Service Worker estar ativo
      if (this.registration.installing) {
        await new Promise<void>((resolve) => {
          this.registration!.installing!.addEventListener("statechange", () => {
            if (this.registration!.installing!.state === "installed") {
              resolve();
            }
          });
        });
      }

      return true;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return false;
    }
  }

  /**
   * Verifica se o Service Worker está registrado
   */
  static isRegistered(): boolean {
    return this.registration !== null;
  }

  /**
   * Obtém o Service Worker registration
   */
  static getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  /**
   * Envia mensagem para o Service Worker agendar notificação
   */
  static async scheduleNotification(time: string, enabled: boolean): Promise<void> {
    if (!this.registration) {
      await this.register();
    }

    if (!this.registration || !this.registration.active) {
      console.error("Service Worker not active");
      return;
    }

    this.registration.active.postMessage({
      type: "SCHEDULE_NOTIFICATION",
      time,
      enabled,
    });
  }

  /**
   * Cancela todas as notificações agendadas
   */
  static async cancelNotifications(): Promise<void> {
    if (!this.registration || !this.registration.active) {
      return;
    }

    this.registration.active.postMessage({
      type: "CANCEL_NOTIFICATIONS",
    });
  }

  /**
   * Atualiza o Service Worker
   */
  static async update(): Promise<void> {
    if (!this.registration) {
      return;
    }

    try {
      await this.registration.update();
    } catch (error) {
      console.error("Service Worker update failed:", error);
    }
  }
}
