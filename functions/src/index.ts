import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as types from './types';

admin.initializeApp();

const firestore = admin.firestore();
const messaging = admin.messaging();

export const makeTurn = functions.firestore.document('games/{gameID}').onUpdate((change, context) => {
    return firestore.runTransaction(transaction => {
        return transaction.get(change.after.ref).then(doc => {
            const data = doc.data();
            if(data?.move){
                data.board[data.move.position] = data.turn % data.players.length;
                delete data.move;
                data.winner = findWinner(data.board);
                if (data.winner === -1) {
                    data.turn++;
                }
                data.modified = admin.firestore.Timestamp.now();
                transaction.set(doc.ref, data);
                
            } else if(data) {
                let uids: string[];
                let message: string;
                if (data.winner === -1) {
                    uids = [data.players[data.turn % data.players.length].uid];
                    message = "Its your turn";
                } else {
                    uids = data.players.splice(data.turn % data.players.length, 1).map((player: types.Player) => {return player.uid;});
                    message = "Game Over";
                }
                return notify(doc.id, message, uids);
            }
            return;
        });
    });
});

export const handleGameQueues = functions.firestore.document('queues/{queueName}').onUpdate((change, context) => {
    return firestore.runTransaction(transaction => {
        return transaction.get(change.after.ref).then(doc => {
            const data = doc.data();
            if (data){
                const keys = Object.keys(data);
                const queueProperties = context.params.queueName.split('p');
                const playerCount = parseInt(queueProperties[0]);
                if (keys.length >= playerCount) {
                    const size = parseInt(queueProperties[1].split('x')[0]);
                    const players = keys.slice(0, playerCount)
                    return makeGame(size, players).then(() => {
                        players.forEach(player => delete data[player]);
                        transaction.set(doc.ref, data)
                    });
                }
            }
            return null;
        });
    });
});

export const deleteUserData = functions.auth.user().onDelete((user) => {
    return Promise.all([
        firestore.runTransaction(transaction => {
            const userGames= firestore.collection('games').where('players', 'array-contains-any', types.colors.map(color => ({uid: user.uid, color})));
            return transaction.get(userGames).then(gameDocs => {gameDocs.forEach(doc => {
                const data = doc.data();
                const index: number = data.players.findIndex((player: types.Player) => player.uid === user.uid);
                if(data.winner === -1){
                    data.turn -= Math.floor(data.turn / data.players.length);
                    data.players.splice(index, 1);
                    data.board = data.board.map((value: number) => value === index ? -1 : value > index ? value -1 : value);
                } else {
                    data.players[index].uid = 'deleted';
                }
                transaction.set(doc.ref, data);
            })});
        }),
        firestore.doc('users/'+user.uid+'/private/settings').delete(),
        firestore.doc('users/'+user.uid).delete()
    ]);
});


function findWinner(board: number[]): number{
    const sqrt = Math.sqrt(board.length);
    for (let i = 0; i < sqrt; i++) {
        let row = true;
        let col = true;
        for (let j = 1; j < sqrt; j++) {
            if (board[i * sqrt] !== board[j + i * sqrt]){
                row = false;
            }
            if (board[i] !== board[i + j * sqrt]){
                col = false;
            }
        }
        if(row && board[i * sqrt] !== -1) {
            return board[i * sqrt];
        }
        if(col && board[i] !== -1) {
            return board[i];
        }
    }
    let diagonal = true;
    let backDiagonal = true;
    for (let i = 1; i < sqrt; i++) {
        if (board[0] !== board[i + i * sqrt]){
            diagonal = false;
        }
        if (board[sqrt - 1] !== board[(i + 1) * (sqrt - 1)]){
            backDiagonal = false;
        }
    }
    if(diagonal && board[0] !== -1) {
        return board[0];
    }
    if(backDiagonal && board[sqrt - 1] !== -1) {
        return board[sqrt - 1];
    }
    return board.includes(-1) ? -1 : -2;
}

async function makeGame(size: number, uids: string[]) {
    const shuffledColors = shuffle(types.colors);
    const shuffledUIDs = shuffle(uids);
    return firestore.collection('games').add({
        board: new Array(size * size).fill(-1),
        players: shuffledUIDs.map((uid, i) => ({uid, color: shuffledColors[i]})),
        turn: 0,
        winner: -1,
        modified: admin.firestore.Timestamp.now()
    }).then(ref => notify(ref.id, "Its your turn", [shuffledUIDs[0]]));
}

async function notify(gameID: string, message: string, uids:string[]) {
    if(uids.length > 0) {
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
                        link: "https://nates-tic-tac-toe.web.app/games/" + gameID
                    },
                    notification: {
                        title: message,
                        body: "open this notification to view the game",
                        icon: "/assets/icons/icon-128x128.png",
                        badge: "/assets/icons/badge-72x72.png"
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

