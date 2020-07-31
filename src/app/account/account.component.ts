import { Component, NgZone } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { nicknameMaxLength, nicknameMinLength, colors } from 'functions/src/types';
import { AuthService } from '../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { noEmojiValidator } from '../dialog/dialog.component';
import { PalletService } from '../pallet.service';
import { NotificationsService } from '../notifications.service';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

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

  notificationsEnabled: boolean;

  constructor(
    public dialogRef: MatDialogRef<AccountComponent>,
    public fireAuth: AngularFireAuth,
    public pallet: PalletService,
    public notifications: NotificationsService,
    private firestore: AngularFirestore,
    private authService: AuthService,
    private zone: NgZone
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

    this.notifications.isEnabled$.subscribe(isEnabled => this.zone.run(() => {
      this.notificationsEnabled = isEnabled;
    }));
  }

  onSubmit() {
    this.docRef.set(this.formGroup.value);
    this.dialogRef.close();
  }

  handleRippleClick(event) {
    requestAnimationFrame(() => event.target.previousElementSibling.blur());
  }

  async toggleNotifications(event) {
    console.log(event)
    if (event.checked) {
      await this.notifications.enable();
    } else {
      await this.notifications.disable();
    }
    this.notifications.isEnabled$.pipe(first()).subscribe(isEnabled => this.zone.run(() => {
      this.notificationsEnabled = isEnabled;
    }));
  }
}
