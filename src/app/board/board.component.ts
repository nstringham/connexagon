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

  public canvasClickHandler(click: MouseEvent | number) {
    if (
      Math.abs(this.canvas.nativeElement.height - this.canvas.nativeElement.clientHeight * window.devicePixelRatio) > 1 ||
      Math.abs(this.canvas.nativeElement.width - this.canvas.nativeElement.clientWidth * window.devicePixelRatio) > 1
    ) {
      // this deals with a problem caused by samsung internet not using css min()
      this.resizeCanvas();
    }
    if (this.isTurn) {
      if (typeof click === 'number') {
        this.board.clickHex(click);
      } else {
        const canvas = click.target as Element;
        const x = click.x - canvas.getBoundingClientRect().left;
        const y = click.y - canvas.getBoundingClientRect().top;
        const position = this.board.getPosition(x * window.devicePixelRatio, y * window.devicePixelRatio);
        this.board.clickHex(position);
      }
    }
  }

  public submit() {
    if (this.board.move?.positions?.length === 2 && this.isTurn) {
      this.gameDoc.collection('moves').doc(this.user.uid).set(this.board.move);
      delete this.board.move;
    }
  }

  private updateIsTurn() {
    try {
      this.isTurn = this.board.game.uids[this.board.game.turn % this.board.game.players.length] === this.user.uid
        && this.board.game.winner === -1;
    } catch (error) {
      this.isTurn = false;
    }
  }
}

class Board {
  pallet: Pallet;
  move: Move;
  gridSize: number;
  private privateGame: Game;
  private center: Point;
  private length: number;

  table: number[][];
  private focus = -1;
  spacing: number;

  constructor(private ctx: CanvasRenderingContext2D) { }

  set game(game: Game) {
    this.privateGame = game;
    this.gridSize = 0.5 + Math.sqrt(12 * game.board.length - 3) / 6;

    const rows: number[][] = [];
    for (let row = 0, id = 0; row < this.gridSize * 2 - 1; row++) {
      rows[row] = [];
      for (let column = 0; column < (this.gridSize * 2 - 1) - Math.abs(row - (this.gridSize - 1)); column++) {
        rows[row][column] = id++;
      }
    }
    this.table = rows;
  }

  get game() {
    return this.privateGame;
  }

  canvasKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
        (document.activeElement.parentElement.previousElementSibling?.firstElementChild as HTMLElement)?.focus();
        break;
      case 'ArrowRight':
        (document.activeElement.parentElement.nextElementSibling?.firstElementChild as HTMLElement)?.focus();
        break;
      case 'ArrowUp':
        {
          const row = document.activeElement.parentElement.parentElement;
          if (row.previousElementSibling) {
            let index = Array.from(row.children)
              .indexOf(document.activeElement.parentElement);
            if (row.previousElementSibling.children.length < row.children.length) {
              index--;
            }
            index = Math.max(0, Math.min(index, row.previousElementSibling.children.length));
            (row.previousElementSibling.children.item(index).firstElementChild as HTMLElement).focus();
          }
        }
        break;
      case 'ArrowDown':
        {
          const row = document.activeElement.parentElement.parentElement;
          if (row.nextElementSibling) {
            let index = Array.from(row.children)
              .indexOf(document.activeElement.parentElement);
            if (row.nextElementSibling.children.length > row.children.length) {
              index++;
            }
            index = Math.max(0, Math.min(index, row.nextElementSibling.children.length - 1));
            (row.nextElementSibling.children.item(index).firstElementChild as HTMLElement).focus();
          }
        }
        break;
    }
  }

  tableFocusHandler(id: number) {
    this.focus = id;
    window.requestAnimationFrame(() => this.redraw());
  }

  clickHex(position) {
    if (this.move?.positions.includes(position)) {
      this.move.positions = this.move.positions.filter(pos => pos !== position);
    } else if (this.game.board[position].owner === -1 && !this.game.board[position].tower) {
      if (!this.move) {
        this.move = { positions: [] };
      }
      this.move.positions.push(position);
    }
    window.requestAnimationFrame(() => this.redraw());
  }

  redraw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.center = new Point(this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
    this.length = Math.min(this.ctx.canvas.width, this.ctx.canvas.height / HEX_RATIO) * 0.9;

    this.spacing = (this.length * 0.5) / (this.gridSize * 2 - 1);
    this.ctx.lineWidth = this.spacing * 0.1;

    if (this.game) {
      for (let i = 0; i < this.game.board.length; i++) {
        let column = i - Math.floor(this.game.board.length / 2);
        let row = 0;
        while (Math.abs(column) > (2 * this.gridSize - Math.abs(row)) / 2 - 0.5) {
          const sign = column > 0 ? 1 : -1;
          row += sign;
          column -= (2 * this.gridSize - Math.abs(row) - 0.5) * sign;
        }
        const center = {
          x: this.center.x + (column * this.spacing * 2),
          y: this.center.y + (row * HEX_RATIO * this.spacing * 2)
        };
        if (this.game.board[i].tower) {
          this.ctx.fillStyle = this.pallet.main;
          this.ctx.hex(center.x, center.y, this.spacing, true);
          this.ctx.fill();
          if (this.game.board[i].owner !== -1) {
            this.ctx.fillStyle = this.pallet[this.game.players[this.game.board[i].owner]?.color || 'background'];
            this.ctx.hex(center.x, center.y, this.spacing * 0.5, true);
            this.ctx.fill();
          }
        } else {
          this.ctx.fillStyle = this.pallet[this.game.players[this.game.board[i].owner]?.color || 'background'];
          this.ctx.hex(center.x, center.y, this.spacing, true);
          this.ctx.fill();
        }
        if (i === this.focus) {
          this.ctx.hex(center.x, center.y, this.spacing * 1.05, true);
          this.ctx.strokeStyle = this.pallet.main;
          this.ctx.stroke();
        }
        if (this.move?.positions.includes(i)) {
          this.ctx.hex(center.x, center.y, this.spacing * 0.95, true);
          this.ctx.strokeStyle = this.pallet[this.game.players[this.game.turn % this.game.players.length].color];
          this.ctx.stroke();
        }
      }
    }
  }

  getPosition(x: number, y: number): number {
    x -= this.center.x;
    y -= this.center.y;
    let row = Math.floor((y / (HEX_RATIO * this.spacing * 2)));
    let column = Math.floor(x / this.spacing);
    x -= column * this.spacing;
    y -= row * HEX_RATIO * this.spacing * 2;
    const slopedLeft = (column + row + this.gridSize + this.gridSize) % 2 === 1;
    if (Math.sqrt(
      (x - (slopedLeft ? this.spacing : 0)) * (x - (slopedLeft ? this.spacing : 0))
      + (y) * (y)
    ) > Math.sqrt(
      (x - (!slopedLeft ? this.spacing : 0)) * (x - (!slopedLeft ? this.spacing : 0))
      + (y - (HEX_RATIO * this.spacing * 2)) * (y - (HEX_RATIO * this.spacing * 2))
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
    return column + Math.floor(this.game.board.length / 2);
  }
}

class Point {
  constructor(public x: number, public y: number) { }
}

export interface Game {
  board: { owner: number, tower: boolean }[];
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
  positions: number[];
};

export const HEX_RATIO = Math.sqrt(3) / 2;

declare global {
  interface CanvasRenderingContext2D {
    hex: (x: number, y: number, radius: number, rotated?: boolean) => void;
  }
}

CanvasRenderingContext2D.prototype.hex = function(x: number, y: number, radius: number, rotated?: boolean) {
  const apothem = radius * HEX_RATIO;

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
};
