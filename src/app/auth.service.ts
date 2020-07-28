import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { auth } from 'firebase/app';
import { User } from 'firebase';
import { switchMap, map, filter, first } from 'rxjs/operators';
import { AngularFirestore, DocumentSnapshot, Action, DocumentChangeAction } from '@angular/fire/firestore';
import { ModalService } from './modal.service';
import { Game } from 'functions/src/types';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  public userDoc$: Observable<DocumentSnapshot<UserData>>;
  public games$: Observable<DocumentChangeAction<Game>[]>;
  public currentUID: string;

  private beforeLogout: (() => Promise<any>)[] = [];

  constructor(
    private fireAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private modal: ModalService
  ) {
    this.userDoc$ = this.fireAuth.authState.pipe(filter(user => user != null), switchMap((user: User) => {
      return this.firestore.doc<UserData>('users/' + user.uid).snapshotChanges().pipe(map((action: Action<DocumentSnapshot<UserData>>) => {
        return action.payload;
      }));
    }));
    this.games$ = this.fireAuth.authState.pipe(filter(user => user != null), switchMap((user: User) => {
      return this.firestore.collection<Game>('games', ref => ref.where('uids', 'array-contains', user.uid)
        .orderBy('modified', 'desc').limit(25)).snapshotChanges();
    }));

    this.userDoc$.subscribe(async (snapshot: DocumentSnapshot<UserData>) => {
      if (!snapshot.exists || !snapshot?.data()?.nickname) {
        this.promptNickname();
      }
    });

    this.fireAuth.authState.subscribe(user => {
      if (user?.uid) {
        this.currentUID = user.uid;
      }
    });
  }

  public getAuthProviderByID(id: string): auth.AuthProvider {
    switch (id) {
      case 'google.com':
        return new auth.GoogleAuthProvider();
      case 'twitter.com':
        return new auth.TwitterAuthProvider();
      default:
        console.error('unknown provider:', id);
    }
  }

  async logIn(provider?: auth.AuthProvider) {
    if (provider) {
      return this.fireAuth.currentUser.then(async currentUser => {
        if (currentUser != null) {
          return currentUser.linkWithPopup(provider).catch(async error => {
            if (error.code === 'auth/credential-already-in-use') {
              if (currentUser.isAnonymous && await this.modal.confirm(
                'delete your current games and sign in?',
                'Are you sure?'
              )) {
                currentUser.delete();
              }
              return this.fireAuth.signInWithCredential(error.credential);
            } else {
              throw error;
            }
          });
        } else {
          return this.fireAuth.signInWithPopup(provider).catch(async error => {
            if (error.code === 'auth/account-exists-with-different-credential') {
              return Promise.all([
                this.modal.alert('It looks like you\'ve used that email before with a different sign in method'),
                this.fireAuth.fetchSignInMethodsForEmail(error.email)
              ]).then(result => {
                return this.fireAuth.signInWithPopup(this.getAuthProviderByID(result[1][0])).then(() => {
                  return this.fireAuth.currentUser.then(newUser => {
                    newUser.linkWithCredential(error.credential);
                  });
                });
              });
            }
            throw error;
          });
        }
      });
    } else {
      return this.fireAuth.signInAnonymously();
    }
  }

  async logOut() {
    await this.doBeforeLogout();
    this.fireAuth.signOut();
  }

  async deleteUser() {
    await this.doBeforeLogout();
    const currentUser = await this.fireAuth.currentUser;
    return currentUser.delete().catch(async error => {
      if (error.code === 'auth/requires-recent-login') {
        await this.modal.alert('Confirm your identity by logging in.');
        await this.fireAuth.signInWithPopup(this.getAuthProviderByID(currentUser.providerData[0].providerId));
        return this.deleteUser();
      } else {
        throw error;
      }
    });
  }

  private async doBeforeLogout() {
    await Promise.all(this.beforeLogout.map(callback => callback()));
  }

  addBeforeLogout(callback: () => Promise<any>) {
    this.beforeLogout.push(callback);
  }

  promptNickname() {
    this.userDoc$.pipe(first()).subscribe(async (snapshot: DocumentSnapshot<UserData>) => {
      snapshot.ref.set(
        { nickname: await this.modal.prompt('', snapshot.data()?.nickname || (await this.fireAuth.currentUser).displayName, 'Nickname', 'Choose a nickname') }
      );
    });
  }
}

export type UserData = {
  nickname: string
};
