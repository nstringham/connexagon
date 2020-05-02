import * as admin from 'firebase-admin';

export const colors = [
    'red',
    'blue',
    'green',
    'orange',
    'purple',
    'yellow'
];

export type Color = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

export interface Game {
    board: number[];
    players: Player[];
    turn: number;
    move: Move | null;
    winner: number;
    modified: admin.firestore.Timestamp;
}
  
export type Player = {
    uid: string;
    color: Color;
};

export type Move = {
    position: number;
};