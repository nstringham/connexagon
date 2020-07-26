import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { PalletService } from '../pallet.service';
import { Color, Game } from 'functions/src/types';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { AngularFireFunctions } from '@angular/fire/functions';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss']
})
export class GamesComponent implements OnInit, OnDestroy {

  private gamesSubscription: Subscription;

  public spinner: {
    visible: boolean,
    mode: ProgressSpinnerMode,
    value: number
  } = {
      visible: false,
      mode: 'indeterminate',
      value: 0
    };

  public gameLists: { games: GameListElement[], display: string }[] = [
    { games: [], display: 'Your Turn' },
    { games: [], display: 'Current Games' },
    { games: [], display: 'Finished Games' }
  ];

  constructor(
    private route: ActivatedRoute,
    public authService: AuthService,
    private firestore: AngularFirestore,
    private functions: AngularFireFunctions,
    public palletService: PalletService
  ) {
    this.gamesSubscription = authService.games$.subscribe((actions: DocumentChangeAction<Game>[]) => {
      const newGameList = this.gameLists.map((element => ({ games: [], display: element.display })));
      const skipTurn = functions.httpsCallable('skipTurn');
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
        if (JSON.stringify(this.gameLists[i].games.map(game => game.id)) !== JSON.stringify(newGameList[i].games.map(game => game.id))) {
          this.gameLists[i] = newGameList[i];
        }
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.gamesSubscription.unsubscribe();
  }

  public joinQueue() {
    this.spinner.visible = true;
    this.spinner.mode = 'indeterminate';
    const data = {};
    data[this.authService.currentUID] = true;
    this.firestore.doc('queues/2p3x3').update(data).then(() => this.listenToQueue(), () => this.listenToQueue());
  }

  private listenToQueue() {
    const subscription = this.firestore.doc<{}>('queues/2p3x3').valueChanges().subscribe(queue => {
      if (this.spinner) {
        const keys = Object.keys(queue);
        if (keys?.includes(this.authService.currentUID)) {
          this.spinner.mode = 'determinate';
          this.spinner.value = 100 * keys.length / 2;
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
