import { Injectable, NgZone } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { firestore } from 'firebase/app';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { Subscription, Observable, of } from 'rxjs';
import { switchMap, map, first } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

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
    private snackBar: MatSnackBar,
    private router: Router,
    private zone: NgZone
  ) {
    this.isEnabled = this.fireAuth.authState.pipe(switchMap(user => {
      if (user?.uid) {
        return this.aFirestore.doc<string[]>('users/' + user.uid + '/private/tokens').valueChanges().pipe(switchMap((tokens => {
          if (tokens) {
            return this.Messaging.getToken.pipe(map(token => Object.keys(tokens).includes(token)));
          } else {
            return of(false);
          }
        })));
      } else {
        return of(false);
      }
    }));

    this.Messaging.onMessage((message) => {
      this.zone.run(() => {
        this.snackBar.open(message.notification.title, 'Open', {
          verticalPosition: 'bottom',
          horizontalPosition: 'center',
          duration: 5000,
        }).onAction().subscribe(() => {
          this.router.navigateByUrl(message.fcmOptions.link);
        });
      });
    });
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
    this.disable();
    this.Messaging.getToken.subscribe(token => {
      this.Messaging.deleteToken(token);
    });
  }
}
