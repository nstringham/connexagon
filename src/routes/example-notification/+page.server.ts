import type { Actions } from "./$types";
import { error } from "@sveltejs/kit";
import { sendNotification } from "$lib/notifications.server";

export const actions: Actions = {
  sendNotification: async ({ locals: { user }, request }) => {
    if (user == null) {
      error(401, "you must be logged in to send push notifications");
    }

    const body = await request.formData();

    await wait(Number(body.get("delay") as string) * 1000);

    await sendNotification(user.id, {
      title: body.get("title") as string,
      body: "Click here to open connexagon",
      data: { url: "/" },
    });
  },
};

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
}
