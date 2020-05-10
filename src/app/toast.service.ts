import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  toast(message: string, url?: string) {
    this.snackBar.open(message, url ? 'View' : null, {
      verticalPosition: 'bottom',
      horizontalPosition: 'left',
      duration: url ? 6000 : 4000,
    }).onAction().pipe(first()).subscribe(() => {
      this.router.navigateByUrl(url);
    });
  }
}
