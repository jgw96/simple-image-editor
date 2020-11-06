importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.1/workbox-sw.js');

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

async function shareTargetHandler({ event }) {
  event.respondWith(Response.redirect("/"));

  event.waitUntil(async function () {

    const data = await event.request.formData();
    console.log('data', data);
    const client = await self.clients.get(event.resultingClientId || event.clientId);
    // Get the data from the named element 'file'
    const file = data.get('file');

    console.log('file', file);
    client.postMessage({ file, action: 'load-image' });
  }());

  // Do something with the rest of formData as you need
  // Maybe save it to IndexedDB
};

workbox.routing.registerRoute(
  ({ url }) => url.href.includes("comlink"),
  new workbox.strategies.CacheFirst(),
);

workbox.routing.registerRoute(
  '/share/image/',
  shareTargetHandler,
  'POST'
);


// workbox.precaching.precacheAndRoute(self.__WB_MANIFEST)