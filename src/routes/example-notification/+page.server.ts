import type { Actions } from "./$types";
import { PRIVATE_VAPID_KEY } from "$env/static/private";
import { PUBLIC_VAPID_KEY } from "$env/static/public";
import webPush from "web-push";
import { error } from "@sveltejs/kit";

// Set the keys used for encrypting the push messages.
webPush.setVapidDetails("https://connexagon.com/", PUBLIC_VAPID_KEY, PRIVATE_VAPID_KEY);

export const actions: Actions = {
  sendNotification: async ({ locals: { supabase, user }, request }) => {
    if (user == null) {
      error(401, "you must be logged in to send push notifications");
    }

    const body = await request.formData();

    const timer = wait(Number(body.get("delay") as string) * 1000);

    const { data: subscriptions, error: subscriptionError } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", user.id);

    if (subscriptionError) {
      throw subscriptionError;
    }

    await timer;

    await Promise.all(
      subscriptions.map(({ subscription }) =>
        webPush.sendNotification(subscription as unknown as webPush.PushSubscription),
      ),
    );
  },
};

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
}
