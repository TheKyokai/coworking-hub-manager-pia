import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth-service/auth-service';

@Component({
  selector: 'app-navigation',
  imports: [RouterLink],
  templateUrl: './navigation.html',
  styleUrl: './navigation.css',
})
export class Navigation {

  private router = inject(Router);
  private authService = inject(AuthService);
  loggedIn = false;

  async ngOnInit()
  {
    const user = await this.authService.getUser();  
    this.loggedIn = user != null;
  }

  logout()
  {
    localStorage.clear();
    this.router.navigate(['']);
  }
}
