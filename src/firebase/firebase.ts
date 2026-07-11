import { initializeApp } from "firebase/app";
import { getMessaging, type Messaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "abc",
    authDomain: "abc",
    projectId: "abc",
    storageBucket: "abc",
    messagingSenderId: "abc",
    appId: "abc",
    measurementId: "abc"
};

const app = initializeApp(firebaseConfig);

let messaging: Messaging | undefined;
if ("Notification" in window && navigator.serviceWorker) {
  messaging = getMessaging(app);
  // console.log(messaging, "messaging");

} else {
  console.warn("Push notifications not supported on this browser.");
}

export { messaging };