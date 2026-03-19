import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service/auth-service';
import Message from '../../models/message';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin {

  private authService = inject(AuthService)
  private router = inject(Router)

  username = ''
  password = ''
  msg = new Message()
  loading = false
  

  submit() {
    this.loading = true;
    this.msg.message = '';
    
    this.authService.adminLogin(this.username, this.password).subscribe(
      response => {
        if (!response || !response.body) {
          this.msg.message = "Nepredvidjena greska";
          this.loading = false;
          return;
        }
        this.msg = response.body;
        if (response.ok)
        {
          localStorage.setItem("token", this.msg.token);
          this.router.navigate(['admin-dashboard']);
        }
        this.loading = false;
      },
      error => {
        this.msg.message = error?.error?.message || "Prijava neuspesna";
        this.loading = false;
      }
    )
  }
}
