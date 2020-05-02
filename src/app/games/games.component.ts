import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';
import { AuthService, UserData } from '../auth.service';
import { Observable, Subscription } from 'rxjs';
import { Game } from '../board/board.component';
import { Color, PalletService } from '../pallet.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss']
})
export class GamesComponent implements OnInit, OnDestroy {

  private gamesSubscription: Subscription;

  public gameLists: {games: GameListElement[], display: string}[] = [
    {games: [], display: 'Your Turn'},
    {games: [], display: 'Current Games'},
    {games: [], display: 'Finished Games'}
  ];

  constructor(
    private route: ActivatedRoute,
    public authService: AuthService,
    private firestore: AngularFirestore,
    public palletService: PalletService
  ) {
    this.gamesSubscription = authService.games$.subscribe((actions: DocumentChangeAction<Game>[]) => {
      const newGameList = this.gameLists.map((element => ({games: [], display: element.display})));
      actions.forEach(action => {
        const game = action.payload.doc.data();
        let gameArr: GameListElement[];
        if (game.winner === -1){
          if (game.players[game.turn % game.players.length].uid === authService.currentUID && game.move == null) {
            gameArr = newGameList[0].games;
          } else {
            gameArr = newGameList[1].games;
          }
        } else {
          gameArr = newGameList[2].games;
        }
        const players = game.players.map((player, i) => ({
          nick$: this.getNickObservable(player.uid),
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

  public getNickObservable(uid: string){
    return this.firestore.doc<UserData>('users/' + uid).valueChanges().pipe(map((userData: UserData) => userData ? userData.nickname : '[No Name]'));
  }

  public joinQueue() {
    const data = {};
    data[this.authService.currentUID] = true;
    this.firestore.doc('queues/2p3x3').update(data).then(() => console.log('added to queue'))
  }
}

type GameListElement = {
  players: {nick$: Observable<string>, color: Color, winner: boolean}[],
  modified: Date,
  id: string,
};
