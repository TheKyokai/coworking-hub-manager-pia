import { Component, inject, OnInit } from '@angular/core';
import { Registration } from "../authentication/registration/registration";
import { AuthService } from '../services/auth-service/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit{

  private authService = inject(AuthService);
  private router = inject(Router);

  async ngOnInit()
  {
    const user = await this.authService.getUser();
    if (user != null)
      this.router.navigate(['dashboard']);
  }

}
