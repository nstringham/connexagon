import { PRIVATE_VAPID_KEY } from "$env/static/private";
import { PUBLIC_VAPID_KEY } from "$env/static/public";
import { sql } from "./db.server";
import webPush from "web-push";

webPush.setVapidDetails("https://connexagon.com/", PUBLIC_VAPID_KEY, PRIVATE_VAPID_KEY);

export type NotificationPayload = Omit<NotificationOptions, "data"> & {
  title: string;
  data?: { url?: string };
};

export async function sendNotification(user_id: string, notification: NotificationPayload) {
  const subscriptions = await sql<webPush.PushSubscription[]>`
    select
      endpoint,
      expiration_time as "expirationTime",
      keys
    from
      push_subscriptions
    where
      user_id = ${user_id}
  `;

  return Promise.all(
    subscriptions.map((subscription) =>
      webPush.sendNotification(subscription, JSON.stringify(notification)),
    ),
  );
}
