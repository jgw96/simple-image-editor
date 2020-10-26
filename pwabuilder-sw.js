importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.1/workbox-sw.js');

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

async function shareTargetHandler({ event }) {
  console.log(event);
  const client = await self.clients.get(event.resultingClientId || event.clientId);

  const formData = await event.request.formData();
  const mediaFiles = formData.getAll('media');

  for (const mediaFile of mediaFiles) {
    // Do something with mediaFile
    // Maybe cache it or post it back to a server

    console.log('file', mediaFile);
    client.postMessage(mediaFile);
  };

  // Do something with the rest of formData as you need
  // Maybe save it to IndexedDB
};

workbox.routing.registerRoute(
  ({url}) => url.href.includes("comlink"),
  new workbox.strategies.CacheFirst(),
);

workbox.routing.registerRoute(
  '/',
  shareTargetHandler,
  'POST'
);


// workbox.precaching.precacheAndRoute(self.__WB_MANIFEST)