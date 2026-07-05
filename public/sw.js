/* Monument of Dreams — Service Worker */

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener("push", (e) => {
  let data = {};
  try { data = e.data?.json() ?? {}; } catch {}

  const title = data.title ?? "Monument of Dreams";
  const body  = data.body  ?? "Uma nova dose de inspiração para ti.";
  const url   = data.url   ?? "/";

  e.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:  "/favicon.ico",
      badge: "/favicon.ico",
      tag:   "dreams-daily",
      renotify: true,
      data: { url },
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = e.notification.data?.url ?? "/";

  e.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        for (const c of list) {
          if (c.url.startsWith(self.location.origin) && "focus" in c) {
            c.navigate(target);
            return c.focus();
          }
        }
        return clients.openWindow(target);
      })
  );
});
