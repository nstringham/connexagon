import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore, DocumentChangeAction, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AuthService } from '../auth.service';
import { Observable } from 'rxjs';
import { PalletService } from '../pallet.service';
import { Color, Game } from 'functions/src/types';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { AngularFireFunctions } from '@angular/fire/functions';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss']
})
export class GamesComponent {

  public spinner: {
    visible: boolean,
    mode: ProgressSpinnerMode,
    value: number
  } = {
      visible: false,
      mode: 'indeterminate',
      value: 0
    };

  public gameLists$: Observable<{ games: GameListElement[], display: string }[]>;

  constructor(
    private route: ActivatedRoute,
    public authService: AuthService,
    private firestore: AngularFirestore,
    private functions: AngularFireFunctions,
    public palletService: PalletService
  ) {
    this.gameLists$ = authService.games$.pipe(map((actions: DocumentChangeAction<Game>[]) => {
      const gameLists: { games: GameListElement[], display: string }[] = [
        { games: [], display: 'Your Turn' },
        { games: [], display: 'Current Games' },
        { games: [], display: 'Finished Games' }
      ];
      const newGameList = gameLists.map((element => ({ games: [], display: element.display })));
      const skipTurn = this.functions.httpsCallable('skipTurn');
      actions.forEach(action => {
        const game = action.payload.doc.data();
        let gameArr: GameListElement[];
        if (game.winner === -1) {
          if (game.uids[game.turn % game.players.length] === authService.currentUID) {
            gameArr = newGameList[0].games;
          } else {
            gameArr = newGameList[1].games;
            if (game.modified.toMillis() < new Date().getTime() - 6.048e+8) {
              skipTurn(action.payload.doc.id).subscribe();
            }
          }
        } else {
          gameArr = newGameList[2].games;
        }
        const players = game.players.map((player, i) => ({
          nick: player.nickname,
          color: player.color,
          winner: game.winner === i
        }));
        gameArr.push({
          players: players.slice(game.turn % players.length).concat(players.slice(0, game.turn % players.length)),
          modified: game.modified.toDate(),
          id: action.payload.doc.id,
        });
      });
      for (let i = 0; i < newGameList.length; i++) {
        if (JSON.stringify(gameLists[i].games.map(game => game.id)) !== JSON.stringify(newGameList[i].games.map(game => game.id))) {
          gameLists[i] = newGameList[i];
        }
      }
      return gameLists;
    }));
  }

  public joinQueue(players: number) {
    this.spinner.visible = true;
    this.spinner.mode = 'indeterminate';
    const data = {};
    data[this.authService.currentUID] = true;
    const queueDoc = this.firestore.doc<{ [key: string]: boolean }>('queues/' + players + 'p' + (7 + players) + 'x' + (7 + players));
    queueDoc.update(data).then(() => this.listenToQueue(queueDoc), () => this.listenToQueue(queueDoc));
  }

  private listenToQueue(queueDoc: AngularFirestoreDocument<{ [key: string]: boolean; }>) {
    const players = parseInt(queueDoc.ref.id.split('p')[0]);
    const subscription = queueDoc.valueChanges().subscribe(queue => {
      if (this.spinner) {
        const keys = Object.keys(queue);
        if (keys?.includes(this.authService.currentUID)) {
          this.spinner.mode = 'determinate';
          this.spinner.value = (100 * keys.length) / players;
        } else {
          this.spinner.mode = 'indeterminate';
          this.spinner.visible = false;
          subscription.unsubscribe();
        }
      }
    });
  }
}

type GameListElement = {
  players: { nick: string, color: Color, winner: boolean }[],
  modified: Date,
  id: string,
};
