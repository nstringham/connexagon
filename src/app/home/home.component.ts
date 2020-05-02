import { Component, OnInit } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { mergeMap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from '../auth.service';
import { firestore } from 'firebase/app';
import { NotificationsService } from '../notifications.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private notifications: NotificationsService
  ) { }

  ngOnInit(): void {
  }

  requestPermission() {
    return this.notifications.enable();
  }

  deleteToken() {
    return this.notifications.deleteToken();
  }

}
