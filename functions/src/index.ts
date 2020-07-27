import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Game, isValidMove, colors, getArrayLength } from './types';

admin.initializeApp();

const firestore = admin.firestore();
const messaging = admin.messaging();

export const makeTurn = functions.firestore.document('games/{gameId}/moves/{userId}').onCreate((moveSnapshot, context) => {
  const move = moveSnapshot.data();
  const gameRef = moveSnapshot.ref.parent.parent;
  if (!gameRef) {
    return null;
  }
  return firestore.runTransaction(transaction => {
    return Promise.all([
      transaction.get(gameRef).then(doc => {
        const game = doc.data() as Game | undefined;
        if (game && isValidMove(move, game) && context.params.userId === game.uids[game.turn % game.players.length]) {
          move.positions.forEach(position => {
            game.board[position].owner = game.turn % game.players.length;
          });
          game.winner = findWinner(game.board);
          if (game.winner === -1) {
            game.turn++;
          }
          game.modified = admin.firestore.Timestamp.now();
          transaction.set(doc.ref, game);
          return game;
        } else {
          return null;
        }
      }),
      moveSnapshot.ref.delete(),
    ]);
  }).then(result => {
    const game = result[0];
    if (game) {
      let uids: string[];
      let message: string;
      if (game.winner === -1) {
        uids = [game.uids[game.turn % game.players.length]];
        message = "Its your turn";
      } else {
        game.uids.splice(game.turn % game.players.length, 1);
        uids = game.uids;
        message = "Game Over";
      }
      return notify(gameRef.id, message, uids);
    } else {
      return null;
    }
  });
});

export const handleGameQueues = functions.firestore.document('queues/{queueName}').onUpdate((change, context) => {
  const after = change.after.data();
  const queueProperties = context.params.queueName.split('p');
  const playerCount = parseInt(queueProperties[0]);
  if (after && Object.keys(after).length >= playerCount) {
    return firestore.runTransaction(transaction => {
      return transaction.get(change.after.ref).then(doc => {
        const data = doc.data();
        if (data) {
          const keys = Object.keys(data);
          if (keys.length >= playerCount) {
            const size = parseInt(queueProperties[1].split('x')[0]);
            const players = keys.slice(0, playerCount);
            return makeGame(size, players).then(() => {
              players.forEach(player => delete data[player]);
              transaction.set(doc.ref, data)
            });
          }
        }
        return null;
      });
    });
  }
  return null;
});

export const skipTurn = functions.https.onCall((id, context) => {
  if (context.auth?.uid && typeof id === 'string') {
    return firestore.runTransaction(transaction => {
      return transaction.get(firestore.doc(`games/${id}`)).then(doc => {
        const data = doc.data() as Game;
        if (context.auth?.uid && data.uids.includes(context.auth?.uid)) {
          if (data.modified.toMillis() < admin.firestore.Timestamp.now().toMillis() - 6.048e+8) {
            return transaction.set(doc.ref, { turn: data.turn + 1, modified: admin.firestore.Timestamp.now() }, { merge: true });
          } else {
            throw new functions.https.HttpsError('failed-precondition', 'turn must be a week old to report it as late');
          }
        } else {
          throw new functions.https.HttpsError('permission-denied', 'must be in a game to report a turn in it as late');
        }
      });
    });
  } else {
    throw new functions.https.HttpsError('unauthenticated', 'must be logged in to report a late turn');
  }
});

export const handleUserDataChange = functions.firestore.document('users/{uid}').onUpdate((change, context) => {
  const nickname: string | undefined = change.after.data()?.nickname;
  if (nickname && nickname !== change.before.data()?.nickname) {
    return firestore.collection('games').where('uids', 'array-contains', change.after.id)
      .orderBy('modified', 'desc').limit(1000).get().then(snapshot => {
        return Promise.all(snapshot.docs.map(gameDoc => {
          const index: number = gameDoc.data().uids.indexOf(change.after.id);
          return firestore.runTransaction(async transaction => {
            const players = (await transaction.get(gameDoc.ref)).data()?.players
            if (players) {
              players[index].nickname = nickname;
              transaction.update(gameDoc.ref, { players })
            }
          })
        }));
      })
  }
  return null;
});

export const deleteUserData = functions.auth.user().onDelete((user) => {
  return Promise.all([
    firestore.runTransaction(transaction => {
      const userGames = firestore.collection('games').where('uids', 'array-contains', user.uid);
      return transaction.get(userGames).then(gameDocs => {
        gameDocs.forEach(doc => {
          const data = doc.data();
          const index: number = data.uids.indexOf(user.uid);
          if (data.winner === -1) {
            data.turn -= Math.floor(data.turn / data.players.length);
            data.players.splice(index, 1);
            data.uids.splice(index, 1);
            data.board = data.board.map((value: number) => value === index ? -1 : value > index ? value - 1 : value);
          } else {
            data.uids[index] = 'deleted';
          }
          transaction.set(doc.ref, data);
        })
      });
    }),
    firestore.doc('users/' + user.uid + '/private/tokens').delete(),
    firestore.doc('users/' + user.uid).delete()
  ]);
});


function findWinner(board: { owner: number, tower: boolean }[]): number {
  return board.find(cell => cell.owner === -1 && !cell.tower) ? -1 : -2;
}

async function makeGame(size: number, uids: string[]) {
  const shuffledColors = shuffle(colors);
  const shuffledUIDs = shuffle(uids);
  const board = new Array(getArrayLength(size)).fill({ owner: -1, tower: false });
  for (let i = 0; i < uids.length * 4 + 1;) {
    const index = Math.floor(Math.random() * board.length);
    if (!board[index].tower) {
      board[index] = { owner: -1, tower: true };
      i++;
    }
  }
  return firestore.collection('games').add({
    board,
    players: await Promise.all(shuffledUIDs.map(async (uid, i) => ({
      color: shuffledColors[i],
      nickname: (await firestore.doc('users/' + uid).get()).data()?.nickname || '[No Name]'
    }))),
    uids: shuffledUIDs,
    turn: 0,
    winner: -1,
    modified: admin.firestore.Timestamp.now()
  }).then(ref => notify(ref.id, "Its your turn", [shuffledUIDs[0]]));
}

async function notify(gameID: string, message: string, uids: string[]) {
  if (uids.length > 0) {
    const tokens: string[] = (await Promise.all(uids.map(async (uid: string) => {
      const tokenSet = (await firestore.doc('users/' + uid + '/private/tokens').get()).data();
      if (tokenSet && Object.keys(tokenSet).length > 0) {
        return Object.keys(tokenSet);
      } else {
        return [];
      }

    }))).reduce((acc, val) => acc.concat(val), []);
    if (tokens.length > 0) {
      await messaging.sendMulticast({
        webpush: {
          fcmOptions: {
            link: "/games/" + gameID
          },
          notification: {
            title: message,
            body: "open this notification to view the game",
            icon: "/assets/icons/icon-128x128.png",
            badge: "/assets/icons/badge-72x72.png",
            tag: gameID
          }
        },
        tokens
      });
    }
  }
}

// Fisher–Yates Shuffle from https://bost.ocks.org/mike/shuffle/
function shuffle<T>(array: T[]): T[] {
  let m = array.length, t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

