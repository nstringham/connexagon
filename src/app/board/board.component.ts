import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription, fromEvent } from 'rxjs';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase';
import { DialogComponent, getWinnerAlert } from '../dialog/dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Pallet, PalletService, Color } from '../pallet.service';
import { Timestamp } from '@firebase/firestore-types';
import { ModalService } from '../modal.service';
import { FindValueSubscriber } from 'rxjs/internal/operators/find';

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

  constructor(
    private route: ActivatedRoute,
    private fireAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private modal: ModalService,
    public matDialog: MatDialog,
    public palletService: PalletService
  ) {
    this.subscriptions.push(this.fireAuth.authState.subscribe((user: User) => {
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
      delete this.board.move;
      this.gameSubscription?.unsubscribe();
      this.gameSubscription = this.gameDoc.valueChanges().subscribe(async (game: Game) => {
        console.log(game);
        this.board.game = game;
        this.updateIsTurn();
        this.board.redraw();
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
          this.dialogRef = this.matDialog.open(DialogComponent, getWinnerAlert(name, color));
        } else {
          if (this.isTurn) {
            this.modal.toast('it\'s your turn.');
          }
        }
      });
      navigator.serviceWorker.register('firebase-messaging-sw.js').then((registration) => {
        registration.getNotifications({ tag: paramMap.get('id') }).then((notifications) => {
          notifications.forEach((notification) => {
            notification.close();
          });
        });
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
    if (
      Math.abs(this.canvas.nativeElement.height - this.canvas.nativeElement.clientHeight * window.devicePixelRatio) > 1 ||
      Math.abs(this.canvas.nativeElement.width - this.canvas.nativeElement.clientWidth * window.devicePixelRatio) > 1
    ) {
      // this deals with a problem caused by samsung internet not using css min()
      this.resizeCanvas();
    }
    const canvas = event.target as Element;
    const x = event.x - canvas.getBoundingClientRect().left;
    const y = event.y - canvas.getBoundingClientRect().top;
    const position = this.board.getPosition(x * window.devicePixelRatio, y * window.devicePixelRatio);
    this.board.clickHex(position);
  }

  public submit() {
    if (this.board.move && this.isTurn) {
      this.gameDoc.collection('moves').doc(this.user.uid).set(this.board.move);
      delete this.board.move;
    }
  }

  private updateIsTurn() {
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
  gridSize: number;
  private center: Point;
  private length: number;

  table: number[][];
  hexagons: { color: Color | 'background'; highlighted: boolean; }[];
  spacing: number;

  constructor(private ctx: CanvasRenderingContext2D) {
    this.gridSize = 7; // TODO make dynamic

    const rows: number[][] = [];
    for (let row = 0, id = 0; row < this.gridSize * 2 - 1; row++) {
      rows[row] = [];
      for (let column = 0; column < (this.gridSize * 2 - 1) - Math.abs(row - (this.gridSize - 1)); column++) {
        rows[row][column] = id++;
      }
    }
    this.table = rows;

    this.hexagons = Array(3 * (this.gridSize - 1) * this.gridSize + 1).fill(null)
      .map(() => ({ color: 'background', highlighted: false }));

  }

  tableFocusHandler(id: number, focus: boolean) {
    this.hexagons[id].highlighted = focus;
    window.requestAnimationFrame(() => this.redraw());
  }

  clickHex(position) {
    if (this.hexagons[position]) {
      this.hexagons[position].color = 'red';
      window.requestAnimationFrame(() => this.redraw());
    }
  }

  redraw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.center = new Point(this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
    this.length = Math.min(this.ctx.canvas.width, this.ctx.canvas.height) * 0.9;

    this.spacing = (this.length * 0.5) / (this.gridSize * 2 - 1);
    this.ctx.lineWidth = this.spacing * 0.1;


    this.hexagons.forEach((hexagon, i) => {
      let column = i - Math.floor(this.hexagons.length / 2);
      let row = 0;
      while (Math.abs(column) > (2 * this.gridSize - Math.abs(row)) / 2 - 0.5) {
        const sign = column > 0 ? 1 : -1;
        row += sign;
        column -= (2 * this.gridSize - Math.abs(row) - 0.5) * sign;
      }
      this.ctx.fillStyle = this.pallet[hexagon.color];
      this.ctx.fillHex(
        this.center.x + (column * this.spacing * 2),
        this.center.y + (row * hexRatio * this.spacing * 2),
        this.spacing, true
      );
      if (hexagon.highlighted) {
        this.ctx.strokeStyle = this.pallet.main;
        this.ctx.stroke();
      }
    });
  }

  getPosition(x: number, y: number): number {
    x -= this.center.x;
    y -= this.center.y;
    let row = Math.floor((y / (hexRatio * this.spacing * 2)));
    let column = Math.floor(x / this.spacing);
    x -= column * this.spacing;
    y -= row * hexRatio * this.spacing * 2;
    const slopedLeft = (column + row + this.gridSize + this.gridSize) % 2 === 1;
    if (Math.sqrt(
      (x - (slopedLeft ? this.spacing : 0)) * (x - (slopedLeft ? this.spacing : 0))
      + (y) * (y)
    ) > Math.sqrt(
      (x - (!slopedLeft ? this.spacing : 0)) * (x - (!slopedLeft ? this.spacing : 0))
      + (y - (hexRatio * this.spacing * 2)) * (y - (hexRatio * this.spacing * 2))
    )) {
      row++;
    }
    if (Math.abs(column + 0.5) >= (this.gridSize * 2 - 1) - Math.abs(row) || Math.abs(row) > this.gridSize - 1) {
      return -1;
    }
    column = Math.floor((column + 1 - row) / 2);
    while (row !== 0) {
      const sign = row > 0 ? 1 : -1;
      row -= sign;
      column += sign * (2 * this.gridSize - 1 - Math.abs(row));
    }
    return column + Math.floor(this.hexagons.length / 2);
  }
}

class Point {
  constructor(public x: number, public y: number) { }
}

export interface Game {
  board: number[];
  players: Player[];
  turn: number;
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

const hexRatio = Math.sqrt(3) / 2;

declare global {
  interface CanvasRenderingContext2D {
    fillHex: (x: number, y: number, radius: number, rotated?: boolean) => void;
  }
}

CanvasRenderingContext2D.prototype.fillHex = function(x: number, y: number, radius: number, rotated?: boolean) {
  const apothem = radius * hexRatio;

  const points: [number, number][] = [
    [radius, 0],
    [(radius / 2), apothem],
    [-(radius / 2), apothem],
    [-radius, 0],
    [-(radius / 2), -apothem],
    [(radius / 2), -apothem]
  ].map(point => rotated ? point.reverse() : point).map(point => [x + point[0], y + point[1]]);

  this.beginPath();
  this.moveTo(...points.shift());
  points.forEach(point => this.lineTo(...point));
  this.closePath();
  this.fill();
};
