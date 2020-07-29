import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { FormGroup, FormControl, AbstractControl, Validators } from '@angular/forms';
import emojiRegex from 'emoji-regex/text.js';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {
  formGroup: FormGroup;
  field: FormControl;

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    const groupData: { [key: string]: AbstractControl } = {};
    switch (data.type) {
      case 'prompt':
        const validators = [Validators.required, noEmojiValidator];
        if (this.data.field.length.max) {
          validators.push(Validators.maxLength(this.data.field.length.max));
        }
        if (this.data.field.length.min) {
          validators.push(Validators.minLength(this.data.field.length.min));
        }
        this.field = new FormControl(data.field.placeholder, validators);
        groupData.field = this.field;
        break;
    }
    this.formGroup = new FormGroup(groupData);
  }

  onSubmit() {
    this.dialogRef.close(this.formGroup.value?.field || 'ok');
  }

}

export interface DialogData {
  type: 'alert' | 'confirm' | 'prompt';
  preTitle?: { text: string, color: string, bold?: boolean };
  title: string;
  body: string;
  field?: FieldSettings;
}

interface FieldSettings {
  placeholder: string;
  label: string;
  length: { max: number, min: number };
}

export function getPrompt(title: string, body: string, field?: FieldSettings): MatDialogConfig {
  return {
    data: {
      type: 'prompt',
      title,
      body,
      field
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

export function noEmojiValidator(control: AbstractControl) {
  if (typeof control.value === 'string' && control.value.match(emojiRegex)) {
    return { hasEmoji: true };
  }
  return null;
}
