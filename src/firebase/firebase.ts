import { initializeApp } from "firebase/app";
import { getMessaging, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBJOMPFTduxOIw9Y8hOiccjNfso5aUgyww",
  authDomain: "balm-app-628.firebaseapp.com",
  projectId: "balm-app-628",
  storageBucket: "balm-app-628.firebasestorage.app",
  messagingSenderId: "830029866969",
  appId: "1:830029866969:web:0893bcaaff1c8e17c59bc8",
  measurementId: "G-2B1NHHDG7B"
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