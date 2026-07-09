import { initializeApp } from "firebase/app";
import { getMessaging, type Messaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
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