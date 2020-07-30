import { Component, OnInit, ElementRef, ViewChild, NgZone } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { mergeMap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from '../auth.service';
import { firestore } from 'firebase/app';
import { NotificationsService } from '../notifications.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public notificationsEnabled: boolean;

  constructor(
    private authService: AuthService,
    public notifications: NotificationsService,
    private zone: NgZone
  ) {
    this.notifications.isEnabled$.subscribe(isEnabled => zone.run(() => {
      this.notificationsEnabled = isEnabled;
    }));
  }

  ngOnInit(): void {
  }

}
