import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { firestore } from 'firebase/app';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { Observable, of } from 'rxjs';
import { switchMap, map, first, mergeMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { ModalService } from './modal.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  public isEnabled: Observable<boolean>;

  constructor(
    private Messaging: AngularFireMessaging,
    private authService: AuthService,
    private modal: ModalService,
    private aFirestore: AngularFirestore,
    private fireAuth: AngularFireAuth,
    private router: Router
  ) {
    this.isEnabled = this.fireAuth.authState.pipe(switchMap(user => {
      if (user?.uid) {
        return this.aFirestore.doc<string[]>('users/' + user.uid + '/private/tokens').valueChanges().pipe(switchMap((tokens => {
          if (tokens && 'Notification' in window && Notification.permission === 'granted') {
            return this.Messaging.getToken.pipe(map(token => Object.keys(tokens).includes(token)));
          } else {
            return of(false);
          }
        })));
      } else {
        return of(false);
      }
    }));
    this.fireAuth.authState.subscribe(user => {
      if (user == null && 'Notification' in window && Notification.permission === 'granted') {
        this.deleteToken();
      }
    });

    this.Messaging.onMessage((message) => {
      if (message.fcmOptions.link !== this.router.url) {
        this.modal.toast(message.notification.title, message.fcmOptions.link);
      }
    });


    this.authService.addBeforeLogout(() => this.disable());
  }

  public async enable() {
    if ('Notification' in window) {
      if (Notification.permission === 'granted'
      || await this.modal.confirm('Would you like to receive notifications when it\'s your turn?')) {
        this.Messaging.getToken.subscribe( (token) => {
          console.log('Permission granted! Save to the server!', token);
          const data = {};
          data[token] = true;
          this.aFirestore.doc('users/' + this.authService.currentUID + '/private/tokens').set(data, {merge: true});
        }, (error) => {
          if (error.code === 'messaging/permission-blocked') {
            this.modal.alert('Your browser is blocking notifications, so you will not be notified when it is your turn.');
          }
        });
      }
    } else {
      this.modal.alert('Your browser does not support notifications');
    }
  }

  public async disable() {
    if ('Notification' in window && Notification.permission === 'granted'){
      const token = await this.Messaging.getToken.toPromise();
      const data = {};
      data[token] = firestore.FieldValue.delete();
      return this.aFirestore.doc('users/' + this.authService.currentUID + '/private/tokens').set(data, { merge: true });
    }
  }

  public toggle() {
    this.isEnabled.pipe(first()).subscribe(isEnabled => {
      if (isEnabled) {
        return this.disable();
      } else {
        return this.enable();
      }
    });
  }

  public deleteToken() {
    this.Messaging.getToken.pipe(mergeMap(token => this.Messaging.deleteToken(token))).subscribe(
        (token) => { console.log('Token deleted!'); },
      );
  }
}
