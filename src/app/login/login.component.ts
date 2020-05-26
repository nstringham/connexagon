import { AuthService } from './../auth.service';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { auth } from 'firebase/app';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<LoginComponent>,
    public authService: AuthService
  ) { }

  async logIn(provider?: auth.AuthProvider) {
    this.authService.logIn(provider);
    this.dialogRef.close();
  }

  ngOnInit(): void { }

}
