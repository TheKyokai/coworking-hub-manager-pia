import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth-service/auth-service';
import { Router } from '@angular/router';
import Message from '../../models/message';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  msg = new Message();
  

  submit() {
    this.authService.login(this.username, this.password).subscribe(
      response => {
        if (!response || !response.body) {
          this.msg.message = "Nepredvidjena greska";
          return;
        }
        this.msg = response.body;
        if (response.ok)
        {
          localStorage.setItem("token", this.msg.token);
          this.router.navigate(['profile']);
        }
      },
      error => {
        this.msg.message = error?.error?.message || "Prijava neuspesna";
      }
    )
  }
}
