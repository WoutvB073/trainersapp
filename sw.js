// Laatste service worker van de oude app op https://woutvb073.github.io/trainersapp/ (0.39.0). Hij neemt meteen over, gooit de
// opgeslagen oude app weg, meldt zichzelf af en laadt open vensters opnieuw: dan opent de doorstuurpagina ("TopTrainer is verhuisd").
// De gegevens in de opslag van de browser (localStorage) blijven staan; die neemt de doorstuurpagina mee naar het nieuwe adres.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const naam of await caches.keys()) await caches.delete(naam);
      await self.registration.unregister();
      const vensters = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const v of vensters) v.navigate(v.url).catch(() => {});
    })(),
  );
});
