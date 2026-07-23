importScripts(
    "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"
);
importScripts(
    "https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
    apiKey: "AIzaSyBJOMPFTduxOIw9Y8hOiccjNfso5aUgyww",
  authDomain: "balm-app-628.firebaseapp.com",
  projectId: "balm-app-628",
  storageBucket: "balm-app-628.firebasestorage.app",
  messagingSenderId: "830029866969",
  appId: "1:830029866969:web:0893bcaaff1c8e17c59bc8",
  measurementId: "G-2B1NHHDG7B"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon,
        badge: "/logo.png",
    };

    return self.registration.showNotification(
        notificationTitle,
        notificationOptions
    );
});

self.addEventListener("notificationclick", (event) => {
    console.log("event", event);
    return event;
});

self.addEventListener("push", (event) => {
    console.log("get push")
    const { title, body } = event.data.json().notification;

    const options = {
        body: body,
        icon: "/logo.png",
        badge: "/logo.png",
    };

    event.waitUntil(self.registration.showNotification(title, options));
});
