import { Component, OnInit, HostListener } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { LoginComponent } from './login/login.component';
import { AuthService } from './auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Platform } from '@angular/cdk/platform';
import { Location, NgIf } from '@angular/common';
import { NotificationsService } from './notifications.service';

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
    public matDialog: MatDialog,
    public platform: Platform,
    public location: Location,
    private notifications: NotificationsService,
  ) { }

  ngOnInit(): void {
    this.fireAuth.authState.subscribe(user => {
      console.log('logged in as: ', user);
      if (user == null) {
        this.dialog = this.matDialog.open(LoginComponent);
        this.dialog.backdropClick().subscribe(() => {
          this.authService.logInAnonymous();
        });
      } else if (this.dialog) {
        this.dialog.close();
      }
    });
  }

  install() {
    if (this.deferredInstallPrompt) {
      this.deferredInstallPrompt.prompt();
      this.deferredInstallPrompt.userChoice.then(choiceResult => {
        this.deferredInstallPrompt = null;
      });
    }
  }
}
