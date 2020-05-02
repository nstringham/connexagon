import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { firestore } from 'firebase/app';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { Subscription, Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  public isEnabled: Observable<boolean>;

  constructor(
    private Messaging: AngularFireMessaging,
    private authService: AuthService,
    private aFirestore: AngularFirestore,
    private fireAuth: AngularFireAuth,
  ) {
    this.isEnabled = this.fireAuth.authState.pipe(switchMap(user => {
      if (user?.uid) {
        return this.aFirestore.doc<string[]>('users/' + user.uid + '/private/tokens').valueChanges().pipe(switchMap((tokens => {
          return this.Messaging.getToken.pipe(map(token => tokens.includes(token)));
        })));
      } else {
        return of(false);
      }
    }));

    this.Messaging.onMessage((message) => { console.log(message); });
  }

  public enable() {
    this.Messaging.requestToken.subscribe( (token) => {
      console.log('Permission granted! Save to the server!', token);
      const data = {};
      data[token] = true;
      this.aFirestore.doc('users/' + this.authService.currentUID + '/private/tokens').set(data, {merge: true});
    }, (error) => { console.error(error); });
  }

  public disable() {
    this.Messaging.getToken.subscribe(token => {
      const data = {};
      data[token] = firestore.FieldValue.delete();
      this.aFirestore.doc('users/' + this.authService.currentUID + '/private/tokens').set(data, {merge: true});
    });
  }

  public deleteToken() {
    this.disable();
    this.Messaging.getToken.subscribe(token => {
      this.Messaging.deleteToken(token);
    });
  }
}
