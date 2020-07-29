import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, Validator, AbstractControl, ValidationErrors, } from '@angular/forms';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { nicknameMaxLength, nicknameMinLength, colors } from 'functions/src/types';
import { AuthService } from '../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { noEmojiValidator } from '../dialog/dialog.component';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent {
  formGroup: FormGroup;
  nickname: FormControl;
  color: FormControl;

  docRef: DocumentReference;

  colors = colors;

  constructor(
    public dialogRef: MatDialogRef<AccountComponent>,
    public fireAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {
    this.nickname = new FormControl('', [
      Validators.required,
      noEmojiValidator,
      Validators.maxLength(nicknameMaxLength),
      Validators.minLength(nicknameMinLength)
    ]);
    this.color = new FormControl(null);
    this.formGroup = new FormGroup({
      nickname: this.nickname,
      color: this.color
    });
    authService.userDoc$.subscribe(userDoc => {
      const data = userDoc.data();
      if (!data.nickname) {
        data.nickname = '';
      }
      if (!data.color) {
        data.color = null;
      }
      this.formGroup.setValue(data);
      this.docRef = userDoc.ref;
    });
  }

  onSubmit() {
    console.log(this.formGroup.value);
    this.docRef.set(this.formGroup.value);
    this.dialogRef.close();
  }

}
