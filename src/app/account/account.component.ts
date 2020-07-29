import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, } from '@angular/forms';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { nicknameMaxLength, nicknameMinLength, colors } from 'functions/src/types';
import { AuthService } from '../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';

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
      Validators.maxLength(nicknameMaxLength),
      Validators.minLength(nicknameMinLength)
    ]);
    this.color = new FormControl(undefined);
    this.formGroup = new FormGroup({
      nickname: this.nickname,
      color: this.color
    });
    authService.userDoc$.subscribe(userDoc => {
      this.formGroup.setValue(userDoc.data());
      this.docRef = userDoc.ref;
    });
  }

  onSubmit() {
    console.log(this.formGroup.value);
    this.docRef.set(this.formGroup.value);
    this.dialogRef.close();
  }

}
