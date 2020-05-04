import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { auth } from 'firebase/app';
import { User } from 'firebase';
import { switchMap, map, filter } from 'rxjs/operators';
import { AngularFirestore, DocumentSnapshot, Action, DocumentReference, DocumentChangeAction } from '@angular/fire/firestore';
import { colors } from './pallet.service';
import { Game } from './board/board.component';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  userDoc$: Observable<DocumentSnapshot<UserData>>;
  games$: Observable<DocumentChangeAction<Game>[]>;
  public currentUID: string;
  constructor(
    private fireAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {
    this.userDoc$ = this.fireAuth.authState.pipe(filter(user => user != null), switchMap((user: User) => {
      return firestore.doc<UserData>('users/' + user.uid).snapshotChanges().pipe(map(( action: Action<DocumentSnapshot<UserData>>) => {
        return action.payload;
      }));
    }));
    this.games$ = this.fireAuth.authState.pipe(filter(user => user != null), switchMap((user: User) => {
      return firestore.collection<Game>('games', ref => ref.where('uids', 'array-contains', user.uid)
        .orderBy('modified', 'desc').limit(25)).snapshotChanges();
    }));

    this.userDoc$.subscribe(async (snapshot: DocumentSnapshot<UserData>) => {
      if (!snapshot.exists){
        snapshot.ref.set({nickname: this.promptNickname((await fireAuth.currentUser).displayName)});
      }
    });

    this.fireAuth.authState.subscribe(user => {
      if (user?.uid) {
        this.currentUID = user.uid;
      }
    });
  }

  async logInGoogle(){
    const provider = new auth.GoogleAuthProvider();
    this.fireAuth.currentUser.then(async currentUser => {
      if (currentUser != null){
        currentUser.linkWithPopup(provider).catch(error => {
          if (error.code === 'auth/credential-already-in-use'){
            if (confirm(error.email + ' already has an account would you like to delete your current progress and use ' + error.email + ' instead?')){
              currentUser.delete();
              this.fireAuth.signInWithCredential(error.credential);
            }
          }
        });
      } else {
        this.fireAuth.signInWithPopup(provider);
      }
    });
  }

  async logInAnonymous(){
    this.fireAuth.signInAnonymously();
  }

  async logOut() {
    this.fireAuth.signOut();
  }

  async deleteUser() {
    (await this.fireAuth.currentUser).delete();
  }

  private promptNickname(nickname: string) {
    if (nickname == null){
      nickname = 'Anonymous';
    }
    return prompt('Enter your new nickname.', nickname);
  }
}

export type UserData = {
  nickname: string
};
