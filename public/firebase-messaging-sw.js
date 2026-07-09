importScripts(
    "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"
);
importScripts(
    "https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
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
