// Service Worker para notificações diárias
const CACHE_NAME = 'journal-notifications-v1';
const NOTIFICATION_TAG = 'daily-reminder';

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});


// Mensagem do cliente para agendar notificação
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { time, enabled } = event.data;
    if (enabled) {
      scheduleDailyNotification(time);
    } else {
      cancelAllNotifications();
    }
  } else if (event.data && event.data.type === 'CANCEL_NOTIFICATIONS') {
    cancelAllNotifications();
  }
});

// Armazena o horário configurado
let scheduledTime = null;
let notificationTimeout = null;

// Função para agendar notificação diária
function scheduleDailyNotification(time) {
  // Cancela notificações anteriores
  cancelAllNotifications();

  scheduledTime = time;
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const targetTime = new Date();
  targetTime.setHours(hours, minutes, 0, 0);

  // Se o horário já passou hoje, agenda para amanhã
  if (targetTime <= now) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  const timeUntilNotification = targetTime.getTime() - now.getTime();

  // Agenda a primeira notificação
  notificationTimeout = setTimeout(() => {
    showNotification();
    // Agenda a próxima notificação (24 horas depois)
    scheduleRecurring();
  }, timeUntilNotification);

  // Salva o estado no IndexedDB para persistência
  saveScheduleState(time);
}

// Função para agendar notificações recorrentes (a cada 24 horas)
function scheduleRecurring() {
  if (!scheduledTime) return;

  // Cancela qualquer timeout anterior
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }

  // Agenda para 24 horas depois
  const oneDay = 24 * 60 * 60 * 1000;
  notificationTimeout = setTimeout(() => {
    showNotification();
    // Continua agendando
    scheduleRecurring();
  }, oneDay);
}

// Salva o estado do agendamento
function saveScheduleState(time) {
  if ('indexedDB' in self) {
    const request = indexedDB.open('journal-notifications', 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('schedule')) {
        db.createObjectStore('schedule', { keyPath: 'id' });
      }
    };
    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction('schedule', 'readwrite');
      const store = tx.objectStore('schedule');
      store.put({ id: 'daily', time: time, enabled: true });
    };
  }
}

// Restaura o estado do agendamento ao ativar
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Limpa caches antigos
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );

      // Restaura agendamento se existir
      if ('indexedDB' in self) {
        try {
          const db = await new Promise((resolve, reject) => {
            const request = indexedDB.open('journal-notifications', 1);
            request.onupgradeneeded = (event) => {
              const db = event.target.result;
              if (!db.objectStoreNames.contains('schedule')) {
                db.createObjectStore('schedule', { keyPath: 'id' });
              }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });

          const tx = db.transaction('schedule', 'readonly');
          const store = tx.objectStore('schedule');
          const data = await new Promise((resolve) => {
            const getRequest = store.get('daily');
            getRequest.onsuccess = () => resolve(getRequest.result);
            getRequest.onerror = () => resolve(null);
          });

          if (data && data.enabled && data.time) {
            scheduleDailyNotification(data.time);
          }
        } catch (error) {
          console.error('Failed to restore schedule:', error);
        }
      }

      return self.clients.claim();
    })()
  );
});

// Função para mostrar notificação
function showNotification() {
  self.registration.showNotification('Time to journal! ✍️', {
    body: 'Take a moment to reflect on your day.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: NOTIFICATION_TAG,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      timestamp: Date.now(),
    },
  });
}

// Função para cancelar todas as notificações
function cancelAllNotifications() {
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
    notificationTimeout = null;
  }
  scheduledTime = null;
  
  // Cancela notificações pendentes
  self.registration.getNotifications({ tag: NOTIFICATION_TAG }).then((notifications) => {
    notifications.forEach((notification) => notification.close());
  });

  // Remove do IndexedDB
  if ('indexedDB' in self) {
    const request = indexedDB.open('journal-notifications', 1);
    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction('schedule', 'readwrite');
      const store = tx.objectStore('schedule');
      store.delete('daily');
    };
  }
}

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se já existe uma janela aberta, foca nela
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Caso contrário, abre uma nova janela
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
