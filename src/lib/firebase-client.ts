import { browser } from "$app/environment";
import { PUBLIC_FCM_VAPID, PUBLIC_FIREBASE_CONFIG } from "$env/static/public";
import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

export async function getFcmToken(): Promise<string> {
  if (!browser) {
    throw new Error("Firebase SDK is browser only!");
  }

  // eslint-disable-next-line compat/compat
  const registration = await navigator.serviceWorker.ready;

  const app = initializeApp(JSON.parse(PUBLIC_FIREBASE_CONFIG) as FirebaseOptions);
  const messaging = getMessaging(app);
  const token = await getToken(messaging, {
    vapidKey: PUBLIC_FCM_VAPID,
    serviceWorkerRegistration: registration,
  });

  return token;
}
