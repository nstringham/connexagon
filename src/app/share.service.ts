import { Injectable, OnInit } from '@angular/core';
import { ModalService } from './modal.service';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { map, filter } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShareService{
  shareable: Observable<boolean>;

  constructor(
    private router: Router,
    private matDialog: MatDialog,
    private modal: ModalService
  ) {
    this.shareable = this.router.events.pipe(filter(event => event instanceof NavigationEnd), map(event => {
      return (event as NavigationEnd).urlAfterRedirects.match(/.*\/games\/\w*/) != null;
    }));
  }

  public share() {
    if ((navigator as any).share) {
      (navigator as any).share({url: location.href});
    } else {
      navigator.clipboard.writeText(location.href).then(() => {
        this.modal.toast('Link copied to clipboard.');
      });
    }
  }
}
