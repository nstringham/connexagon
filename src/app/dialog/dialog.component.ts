import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

}

export interface DialogData {
  type: 'alert' | 'confirm';
  preTitle?: {text: string, color: string, bold?: boolean};
  title: string;
  body?: string;
}

export function alert(title: string, body: string): MatDialogConfig {
  return {
    data: {
      type: 'alert',
      title,
      body
    },
    minWidth: 300
  };
}

export function winnerAlert(name: string, color: string): MatDialogConfig {
  return {
    data: {
      type: 'alert',
      preTitle: {
        text: name,
        color,
        bold: true
      },
      title: ' won the game!',
      body: ''
    },
    minWidth: 300
  };
}
