import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";

declare let self: ServiceWorkerGlobalScope;
const DAY_IN_SECONDS = 24 * 60 * 60;
const WEEK_IN_SECONDS = DAY_IN_SECONDS * 7;
// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST);

// clean old assets
cleanupOutdatedCaches();

registerRoute(
  /(.*)\/(icon|image|cover)\/(.*?)\.(png|jpe?g|svg|gif|bmp|psd|tiff|tga|eps|webp)/,
  new CacheFirst({
    cacheName: "avatar-image",
    plugins: [
      new ExpirationPlugin({
        maxEntries: Number.POSITIVE_INFINITY,
        maxAgeSeconds: WEEK_IN_SECONDS
      })
    ]
  })
);

registerRoute(
  /icon\/(.*)\.json/g,
  new CacheFirst({
    cacheName: "avatar-icon-api",
    plugins: [
      new ExpirationPlugin({
        maxEntries: Number.POSITIVE_INFINITY,
        maxAgeSeconds: WEEK_IN_SECONDS
      })
    ]
  })
);

registerRoute(
  /api\/(.*)\.json/g,
  new CacheFirst({
    cacheName: "avatar-api",
    plugins: [
      new ExpirationPlugin({
        maxEntries: Number.POSITIVE_INFINITY,
        maxAgeSeconds: WEEK_IN_SECONDS
      })
    ]
  })
);

// to allow work offline
registerRoute(new NavigationRoute(createHandlerBoundToURL("index.html"), {}));

// eslint-disable-next-line ts/ban-ts-comment
// @ts-expect-error
self.skipWaiting();
clientsClaim();
