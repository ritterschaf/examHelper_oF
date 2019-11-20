if('serviceWorker' in navigator){
    try {
        navigator.serviceWorker.register('service-worker.js');
        navigator.serviceWorker.ready.then(registration => registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: new Uint8Array([4, 191, 233, 62, 39, 98, 127, 174, 92, 188, 24, 206, 75, 102, 64, 151, 179, 246, 199, 199, 219, 147, 249, 90, 66, 204, 23, 151, 155, 154, 18, 134, 126, 21, 153, 253, 75, 104, 5, 95, 151, 16, 109, 15, 234, 218, 212, 117, 61, 187, 17, 226, 211, 17, 158, 185, 129, 165, 64, 74, 207, 85, 127, 255, 18])
        })).then(subscription => {
            mySub = subscription.toJSON();
            console.log(mySub);
        }, error => console.log(error));

        console.log("Service Worker Registered");
    } catch (error) {
        console.log("Service Worker Registration Failed");
    }
}

const staticAssets=[
    '',
    'index.html',
    'js/examHelper.js',
    'css/styles.css',
    'images/icons/icon-128x128.png',
    'images/icons/icon-144x144.png',
    'images/icons/icon-152x152.png',
    'images/icons/icon-192x192.png',
    'images/icons/icon-256x256.png',
    'images/icons/icon-512x512.png',
];


// self.addEventListener('install', async event=>{
//     const cache = await caches.open('examHelper-v1');
//     cache.addAll(staticAssets)
//         .then(() => {/*success*/} )
//         .catch(err => console.error(err));
// });

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('examHelper-v1')
            .then(cache => cache.addAll(staticAssets))
            .then(() => self.skipWaiting())
    );
});
//Installation wird so lange verzügert, bis gewünschte INhalte dem Cache hinzugefügt wurden.

self.addEventListener('fetch', event => {
    const req = event.request;
    const url = new URL(req.url);

    if(url.origin === location.url){
        event.respondWith(cacheFirst(req));
    } else {
        event.respondWith(networkFirst(req));
    }
});

async function cacheFirst(req){
    const cachedResponse = caches.match(req);
    return cachedResponse || fetch(req);
}

async function networkFirst(req){
    const cache = await caches.open('dynamic-cache');

    try {
        const res = await fetch(req);
        cache.put(req, res.clone());
        return res;
    } catch (error) {
        return await cache.match(req);
    }
}


//Push API


self.addEventListener('push', event => {
    const notification = event.data.json();
    const title = 'Notification-Titel!';
    const options = {
        body: 'Erste Zeiler der Benachrichtigung.\n Zweite Zeile der Benachrichtigung.',
        icon: '/images/icons/icon-512x512.png'
    };
    //self.registration.showNotification(notification.title, notification);
    self.registration.showNotification(title, options);
});



self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll().then(windowClients => windowClients.length ?
        windowClients[0].focus() : clients.openWindow('/index.html'))
    );
});
