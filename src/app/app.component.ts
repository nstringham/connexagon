import { Component, OnInit, HostListener } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { LoginComponent } from './login/login.component';
import { AuthService } from './auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Platform } from '@angular/cdk/platform';
import { Location } from '@angular/common';
import { NotificationsService } from './notifications.service';
import { ShareService } from './share.service';
import { Observable, fromEvent, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModalService } from './modal.service';
import { AccountComponent } from './account/account.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Connexagon';
  scrolledTop = true;
  previousScrollPosition = 0;
  isRoot = false;

  dialog: MatDialogRef<LoginComponent>;

  twitterIcon$: Observable<string>;
  providers$: Observable<string[]>;

  public deferredInstallPrompt: any;
  @HostListener('window:beforeinstallprompt', ['$event'])
  onbeforeinstallprompt(event) {
    event.preventDefault();
    this.deferredInstallPrompt = event;
  }


  constructor(
    public authService: AuthService,
    public modalService: ModalService,
    public fireAuth: AngularFireAuth,
    public platform: Platform,
    public location: Location,
    public shareService: ShareService,
    private matDialog: MatDialog,
    private notifications: NotificationsService,
  ) {
    this.twitterIcon$ = merge(of(window.matchMedia('(prefers-color-scheme: dark)')), fromEvent(window.matchMedia('(prefers-color-scheme: dark)'), 'change')).pipe(map(event => {
      return (event as MediaQueryListEvent | MediaQueryList).matches ? 'assets/img/twitter-white.svg' : 'assets/img/twitter-blue.svg';
    }));

    this.providers$ = this.fireAuth.authState.pipe(map(user => {
      if (user != null) {
        console.log(user.providerData.map(data => data.providerId))
        return user.providerData.map(data => data.providerId);
      } else {
        return [];
      }
    }));

    location.onUrlChange(url => {
      this.isRoot = '/' === url;
    });
  }

  ngOnInit(): void {
    this.fireAuth.authState.subscribe(user => {
      console.log('logged in as: ', user);
      if (user == null) {
        this.dialog = this.matDialog.open(LoginComponent, { disableClose: true });
      } else if (this.dialog) {
        this.dialog.close();
      }
    });
  }

  install() {
    if (this.deferredInstallPrompt) {
      this.deferredInstallPrompt.prompt().then(choiceResult => {
        console.log(choiceResult);
        this.deferredInstallPrompt = null;
      });
    }
  }

  showAccountSettings() {
    return this.matDialog.open(AccountComponent, { autoFocus: false }).afterClosed().toPromise();
  }

  onScroll(event: Event) {
    this.scrolledTop = (event.target as HTMLElement).scrollTop === 0;
  }
}
