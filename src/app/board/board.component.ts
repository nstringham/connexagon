import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription, fromEvent, merge } from 'rxjs';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase';
import { UserData } from '../auth.service';
import { DialogComponent, winnerAlert } from '../dialog/dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Pallet, PalletService, Color } from '../pallet.service';
import { Timestamp } from '@firebase/firestore-types';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;
  public board: Board;

  private gameSubscription: Subscription;

  private subscriptions: Subscription[] = [];

  private user: User;

  public isTurn: boolean;

  private gameDoc: AngularFirestoreDocument<Game>;

  private dialogRef: MatDialogRef<DialogComponent>;

  update(move: Move) {
    console.log({move});
    this.gameDoc.update({move});
  }

  constructor(
    private route: ActivatedRoute,
    private fireAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    public dialog: MatDialog,
    public palletService: PalletService
  ) {
    this.subscriptions.push(fireAuth.authState.subscribe((user: User) => {
      this.user = user;
      this.updateIsTurn();
    }));
  }

  ngOnInit() {
    this.board = new Board(this.canvas.nativeElement.getContext('2d'));

    this.subscriptions.push(this.palletService.pallet$.subscribe(pallet => {
      this.board.pallet = pallet;
      this.board.redraw();
    }));

    this.subscriptions.push(this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.gameDoc = this.firestore.doc<Game>('games/' + paramMap.get('id'));
      this.gameSubscription = this.gameDoc.valueChanges().subscribe(async (game: Game) => {
        console.log(game);
        this.board.game = game;
        this.updateIsTurn();
        this.board.drawLetters();
        this?.dialogRef?.close();
        if (game.winner !== -1) {
          let name: string;
          let color: string;
          if (game.winner === -2) {
            name = 'No one';
            color = 'inherit';
          } else {
            const player = game.players[game.winner];
            name = '🏆' + (player.nickname);
            color = this.board.pallet[player.color];
          }
          this.dialogRef = this.dialog.open(DialogComponent, winnerAlert(name, color));
        }
      });
    }));
  }

  ngAfterViewInit() {
    this.subscriptions.push(fromEvent(window, 'resize').subscribe(() => this.resizeCanvas()));
    this.resizeCanvas();
  }

  ngOnDestroy() {
    this.gameSubscription.unsubscribe();
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

  private resizeCanvas() {
    this.canvas.nativeElement.parentElement.style.setProperty(
      '--header-height', document.getElementById('toolbar').getBoundingClientRect().bottom + 'px'
    );
    this.canvas.nativeElement.width = this.canvas.nativeElement.clientWidth * window.devicePixelRatio;
    this.canvas.nativeElement.height = this.canvas.nativeElement.clientHeight * window.devicePixelRatio;
    this.board.redraw();
  }

  public canvasClickHandler(event: MouseEvent) {
    const x = event.x - this.canvas.nativeElement.getBoundingClientRect().left;
    const y = event.y - this.canvas.nativeElement.getBoundingClientRect().top;
    const position = this.board.getPosition(x * window.devicePixelRatio, y * window.devicePixelRatio);
    if (this.board.game.board[position] === -1) {
      if (this.isTurn && this.board.game.winner === -1){
        this.board.move = {position};
        this.board.drawLetters();
      } else {
        console.log('not turn');
      }
    }
  }

  public submit() {
    if (this.board.move && this.isTurn) {
      this.update(this.board.move);
      delete this.board.move;
    }
  }

  private updateIsTurn(){
    try {
      this.isTurn = this.board.game.uids[this.board.game.turn % this.board.game.players.length] === this.user.uid;
    } catch (error) {
      this.isTurn = false;
    }
  }
}

class Board {
  pallet: Pallet;
  game: Game;
  move: Move;
  private center: Point;
  private length: number;

  constructor(private ctx: CanvasRenderingContext2D) { }

  redraw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.center = new Point(this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
    this.length = Math.min(this.ctx.canvas.width, this.ctx.canvas.height) * 0.9;

    this.ctx.lineWidth = 2 + this.length * 0.025;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = this.pallet.main;
    this.ctx.beginPath();

    this.ctx.moveTo(this.center.x - this.length / 2, this.center.y - this.length / 6);
    this.ctx.lineTo(this.center.x + this.length / 2, this.center.y - this.length / 6);

    this.ctx.moveTo(this.center.x - this.length / 2, this.center.y + this.length / 6);
    this.ctx.lineTo(this.center.x + this.length / 2, this.center.y + this.length / 6);

    this.ctx.moveTo(this.center.x + this.length / 6, this.center.y - this.length / 2);
    this.ctx.lineTo(this.center.x + this.length / 6, this.center.y + this.length / 2);

    this.ctx.moveTo(this.center.x - this.length / 6, this.center.y - this.length / 2);
    this.ctx.lineTo(this.center.x - this.length / 6, this.center.y + this.length / 2);

    this.ctx.stroke();


    if (this.game != null) {
      this.drawLetters();
    }
  }

  drawLetters() {
    if (!this.center){
      this.redraw();
      return;
    }
    for (let i = 0; i < this.game.board.length; i++) {
      this.drawLetter(this.game.board[i], i);
    }
    if (this.game.move) {
      this.drawLetter(this.game.turn % this.game.players.length, this.game.move.position);
    }
    if (this.move) {
      this.drawLetter(this.game.turn % this.game.players.length, this.move.position);
    }
  }

  drawLetter(player: number, position: number) {

    const center = new Point(
      this.center.x + (((position % 3) - 1) * this.length / 3),
      this.center.y + ((Math.floor(position / 3) - 1) * this.length / 3)
    );
    const radius = this.length / 6 - this.ctx.lineWidth * 1.8;

    this.ctx.clearRect(
      center.x - (radius + this.ctx.lineWidth),
      center.y - (radius + this.ctx.lineWidth),
      (radius + this.ctx.lineWidth) * 2,
      (radius + this.ctx.lineWidth) * 2
    );

    if (player < 0) {
      return;
    }

    this.ctx.strokeStyle = this.pallet[this.game.players[player].color];
    this.ctx.beginPath();
    if (player === 0) {
      this.ctx.moveTo(center.x + radius, center.y + radius);
      this.ctx.lineTo(center.x - radius, center.y - radius);

      this.ctx.moveTo(center.x + radius, center.y - radius);
      this.ctx.lineTo(center.x - radius, center.y + radius);
    } else if (player === 1) {
      this.ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
    } else {
      this.ctx.rect(center.x - radius, center.y - radius, radius * 2, radius * 2);
    }
    this.ctx.stroke();
  }

  getPosition(x: number, y: number): number {
    x = x - this.center.x;
    y = y - this.center.y;
    if (Math.abs(x) > this.length / 2 || Math.abs(y) > this.length / 2) {
      return -1;
    }
    x = Math.floor((x + (this.length / 2)) / (this.length / 3));
    y = Math.floor((y + (this.length / 2)) / (this.length / 3));
    return x + y * 3;
  }
}

class Point {
  constructor(public x: number, public y: number) { }
}

export interface Game {
  board: number[];
  players: Player[];
  turn: number;
  move: Move | null;
  winner: number;
  modified: Timestamp;
  uids: string[];
}

export type Player = {
  color: Color;
  nickname: string;
};

export type Move = {
  position: number;
};
