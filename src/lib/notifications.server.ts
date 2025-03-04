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
      public.push_subscriptions
    where
      user_id = ${user_id}
  `;

  await Promise.allSettled(
    subscriptions.map((subscription) =>
      webPush.sendNotification(subscription, JSON.stringify(notification)),
    ),
  );
}

export async function sendNotificationsForTurn(game_id: string) {
  type result = webPush.PushSubscription & { title: string; body: string };

  const subscriptions = await sql<result[]>`
    with
      player_count as (
        select
          game_id,
          count(*) as count
        from
          public.players
        where
          game_id = ${game_id}
        group by
          game_id
      ),
      notifications as (
        select
          player.user_id,
          'It''s your turn' as title,
          'Click here to play your turn' as body
        from
          public.games as game
          join player_count on player_count.game_id = game.id
          join public.players as player on game.id = player.game_id
        where
          game.id = ${game_id}
          and game.completed_at is null
          and player.turn_order = game.turn % player_count.count
          and not (
            game.turn = 0
            and game.host_user_id = player.user_id
          )
        union
        select
          player.user_id,
          'Game over' as title,
          'Click here to view game' as body
        from
          public.games as game
          join player_count on player_count.game_id = game.id
          join public.players as player on game.id = player.game_id
        where
          game.id = ${game_id}
          and game.completed_at is not null
          and player.turn_order != game.turn % player_count.count
      )
    select
      notification.title,
      notification.body,
      subscription.endpoint,
      subscription.expiration_time as "expirationTime",
      subscription.keys
    from
      notifications as notification
      join public.push_subscriptions as subscription on notification.user_id = subscription.user_id
  `;

  await Promise.allSettled(
    subscriptions.map(({ title, body, ...subscription }) => {
      const notification: NotificationPayload = {
        title,
        body,
        icon: `/games/${game_id}/preview`,
        data: { url: `/games/${game_id}` },
      };

      return webPush.sendNotification(subscription, JSON.stringify(notification));
    }),
  );
}
