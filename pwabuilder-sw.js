importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.1/workbox-sw.js');

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

async function shareTargetHandler({ event }) {
  const data = await event.request.formData();
  const client = await self.clients.get(event.resultingClientId || event.clientId);
  // Get the data from the named element 'file'
  const file = data.get('file');

  console.log('file', file);
  client.postMessage({ file, action: 'load-image' });
};

workbox.routing.registerRoute(
  '/',
  shareTargetHandler,
  'POST'
);


workbox.precaching.precacheAndRoute(self.__WB_MANIFEST)