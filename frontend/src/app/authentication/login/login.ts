import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth-service/auth-service';
import { Router, RouterLink } from '@angular/router';
import Message from '../../models/message';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  msg = new Message();
  loading = false;
  

  submit() {
    this.loading = true;
    this.msg.message = '';
    this.authService.login(this.username, this.password).subscribe(
      response => {
        this.loading = false;
        if (!response || !response.body) {
          this.msg.message = "Nepredvidjena greska";
          return;
        }
        this.msg = response.body;
        if (response.ok)
        {
          localStorage.setItem("token", this.msg.token);
          this.router.navigate(['dashboard']);
        }
      },
      error => {
        this.loading = false;
        this.msg.message = error?.error?.message || "Prijava neuspesna";
      }
    )
  }
}
