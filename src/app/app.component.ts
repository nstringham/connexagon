import { Component, OnInit, HostListener } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { LoginComponent } from './login/login.component';
import { AuthService } from './auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Platform } from '@angular/cdk/platform';
import { Location } from '@angular/common';
import { NotificationsService } from './notifications.service';
import { ShareService } from './share.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Tic-Tac-Toe';

  dialog: MatDialogRef<LoginComponent>;

  public navigator = window.navigator;

  public deferredInstallPrompt: any;
  @HostListener('window:beforeinstallprompt', ['$event'])
  onbeforeinstallprompt(event) {
    event.preventDefault();
    this.deferredInstallPrompt = event;
  }

  constructor(
    public authService: AuthService,
    public fireAuth: AngularFireAuth,
    public platform: Platform,
    public location: Location,
    public shareService: ShareService,
    private matDialog: MatDialog,
    private notifications: NotificationsService,
  ) { }

  ngOnInit(): void {
    this.fireAuth.authState.subscribe(user => {
      console.log('logged in as: ', user);
      if (user == null) {
        this.dialog = this.matDialog.open(LoginComponent, {disableClose: true});
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
}
