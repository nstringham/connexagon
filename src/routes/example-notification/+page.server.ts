import type { Actions } from "./$types";
import { PRIVATE_VAPID_KEY } from "$env/static/private";
import { PUBLIC_VAPID_KEY } from "$env/static/public";
import webPush from "web-push";

// Set the keys used for encrypting the push messages.
webPush.setVapidDetails("https://connexagon.com/", PUBLIC_VAPID_KEY, PRIVATE_VAPID_KEY);

export const actions: Actions = {
  sendNotification: async ({ request }) => {
    const body = await request.formData();

    const subscription = JSON.parse(body.get("subscription") as string) as webPush.PushSubscription;
    const payload = null;
    const options = {
      TTL: Number(body.get("ttl") as string),
    };

    await wait(Number(body.get("delay") as string) * 1000);

    await webPush.sendNotification(subscription, payload, options);
  },
};

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
}
