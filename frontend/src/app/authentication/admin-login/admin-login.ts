import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service/auth-service';
import Message from '../../models/message';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin {

  private authService = inject(AuthService)
  private router = inject(Router)

  username = ''
  password = ''
  msg = new Message()
  

  submit() {
    this.authService.adminLogin(this.username, this.password).subscribe(
      response => {
        if (!response || !response.body) {
          this.msg.message = "Nepredvidjena greska";
          return;
        }
        this.msg = response.body;
        if (response.ok)
        {
          localStorage.setItem("token", this.msg.token);
          this.router.navigate(['admin-dashboard']);
        }
      },
      error => {
        this.msg.message = error?.error?.message || "Prijava neuspesna";
      }
    )
  }
}
