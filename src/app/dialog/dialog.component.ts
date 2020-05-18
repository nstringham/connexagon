import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import {FormBuilder, Validators, FormGroup} from "@angular/forms";

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
  type: 'alert' | 'confirm' | 'prompt';
  preTitle?: {text: string, color: string, bold?: boolean};
  title: string;
  body?: string;
  placeholder?: string;
  lable?: string;
}

export function getPrompt(title: string, body: string, lable?: string, placeholder?: string): MatDialogConfig {
  return {
    data: {
      type: 'prompt',
      title,
      body,
      placeholder,
      lable
    },
    minWidth: 250,
    disableClose: true
  };
}

export function getConfirm(title: string, body: string): MatDialogConfig {
  return {
    data: {
      type: 'confirm',
      title,
      body
    },
    minWidth: 250
  };
}

export function getAlert(title: string, body: string): MatDialogConfig {
  return {
    data: {
      type: 'alert',
      title,
      body
    },
    minWidth: 250
  };
}

export function getWinnerAlert(name: string, color: string): MatDialogConfig {
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
