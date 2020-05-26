import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { auth } from 'firebase/app';
import { User } from 'firebase';
import { switchMap, map, filter } from 'rxjs/operators';
import { AngularFirestore, DocumentSnapshot, Action, DocumentChangeAction } from '@angular/fire/firestore';
import { Game } from './board/board.component';
import { ModalService } from './modal.service';

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
      return firestore.doc<UserData>('users/' + user.uid).snapshotChanges().pipe(map(( action: Action<DocumentSnapshot<UserData>>) => {
        return action.payload;
      }));
    }));
    this.games$ = this.fireAuth.authState.pipe(filter(user => user != null), switchMap((user: User) => {
      return firestore.collection<Game>('games', ref => ref.where('uids', 'array-contains', user.uid)
        .orderBy('modified', 'desc').limit(25)).snapshotChanges();
    }));

    this.userDoc$.subscribe(async (snapshot: DocumentSnapshot<UserData>) => {
      if (!snapshot?.data()?.nickname){
        snapshot.ref.set({nickname: await this.promptNickname((await fireAuth.currentUser).displayName)});
      }
    });

    this.fireAuth.authState.subscribe(user => {
      if (user?.uid) {
        this.currentUID = user.uid;
      }
    });
  }

  public getGoogleAuthProvider(){
    return new auth.GoogleAuthProvider();
  }

  async logIn(provider?: auth.AuthProvider) {
    if (provider) {
      this.fireAuth.currentUser.then(async currentUser => {
        if (currentUser != null){
          currentUser.linkWithPopup(provider).catch(async error => {
            if (error.code === 'auth/credential-already-in-use'){
              if (await this.modal.confirm(
                error.email + ' already has an account would you like to delete your current game and use ' + error.email + ' instead?',
                'Are you sure?'
              )){
                currentUser.delete();
                this.fireAuth.signInWithCredential(error.credential);
              }
            }
          });
        } else {
          this.fireAuth.signInWithPopup(provider);
        }
      });
    } else {
      this.fireAuth.signInAnonymously();
    }
  }

  async logOut() {
    await this.doBeforeLogout();
    this.fireAuth.signOut();
  }

  async deleteUser() {
    await this.doBeforeLogout();
    (await this.fireAuth.currentUser).delete();
  }

  private async doBeforeLogout(){
    await Promise.all(this.beforeLogout.map(callback => callback()));
  }

  addBeforeLogout(callback: () => Promise<any>){
    this.beforeLogout.push(callback);
  }

  private async promptNickname(nickname: string) {
    return await this.modal.prompt('', nickname, 'Nickname', 'Choose a nickname');
  }
}

export type UserData = {
  nickname: string
};
