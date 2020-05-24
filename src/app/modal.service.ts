import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent, getAlert, getConfirm, getPrompt } from './dialog/dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(
    private snackBar: MatSnackBar,
    private matDialog: MatDialog,
    private router: Router,
    private zone: NgZone
  ) { }

  toast(message: string, url?: string) {
    this.zone.run(() => {
      this.snackBar.open(message, url ? 'View' : null, {
        verticalPosition: 'bottom',
        horizontalPosition: 'left',
        duration: url ? 6000 : 4000,
      }).onAction().pipe(take(1)).subscribe(() => {
        this.router.navigateByUrl(url);
      });
    });
  }

  alert(body: string, title?: string) {
    return this.zone.run(() => {
      return this.matDialog.open(DialogComponent, getAlert(title || '', body)).afterClosed().toPromise();
    });
  }

  confirm(body: string, title?: string) {
    return this.zone.run(() => {
      return this.matDialog.open(DialogComponent, getConfirm(title || '', body)).afterClosed().toPromise();
    });
  }

  prompt(body: string, placeholder?: string, lable?: string, title?: string) {
    return this.zone.run(() => {
      return this.matDialog.open(DialogComponent, getPrompt(title || '', body, lable, placeholder)).afterClosed().toPromise();
    });
  }
}
