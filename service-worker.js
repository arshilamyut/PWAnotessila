const CACHE_NAME = "notes-app-v5";


const FILES_TO_CACHE = [

    "./",

    "./index.html",

    "./style.css",

    "./app.js",

    "./manifest.json",

    "./icon.png"

];


self.addEventListener(
    "install",
    function(event) {

        // Langsung aktifkan versi baru tanpa menunggu tab lama ditutup.
        self.skipWaiting();

        event.waitUntil(

            caches.open(CACHE_NAME)

                .then(function(cache) {

                    return cache.addAll(
                        FILES_TO_CACHE
                    );

                })

        );

    }
);


self.addEventListener(
    "activate",
    function(event) {

        event.waitUntil(

            caches.keys().then(function(keys) {

                return Promise.all(

                    keys.map(function(key) {

                        if (key !== CACHE_NAME) {

                            return caches.delete(key);

                        }

                    })

                );

            }).then(function() {

                // Ambil alih kontrol tab yang sedang terbuka saat ini juga.
                return self.clients.claim();

            })

        );

    }
);


self.addEventListener(
    "fetch",
    function(event) {

        event.respondWith(

            caches.match(event.request)

                .then(function(response) {

                    if (response) {

                        return response;

                    }

                    return fetch(event.request);

                })

        );

    }
);