// LEVEL UP — System Alert Service Worker
const CACHE_NAME = "levelup-sw-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Push notification receiver
self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: "SYSTEM ALERT",
        body: event.data.text(),
        url: "/dashboard",
      };
    }
  }

  const title = data.title || "LEVEL UP — SYSTEM DIRECTIVE";
  const options = {
    body: data.body || "Hunter command notification received.",
    icon: data.icon || "/swords.jpg",
    badge: data.badge || "/favicon.ico",
    tag: data.tag || "levelup-alert-" + Date.now(),
    data: {
      url: data.url || "/dashboard",
      timestamp: Date.now(),
    },
    vibrate: [200, 100, 200],
    requireInteraction: false,
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click router
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If a window is already open, focus it and navigate
        for (const client of clientList) {
          if (client.url && "focus" in client) {
            client.focus();
            if ("navigate" in client) {
              return client.navigate(targetUrl);
            }
            return;
          }
        }
        // If no client is open, open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

