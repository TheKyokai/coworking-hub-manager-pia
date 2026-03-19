import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { AuthService } from '../services/auth-service/auth-service';
import User from '../models/user';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
  selector: 'app-navigation',
  imports: [RouterLink],
  templateUrl: './navigation.html',
  styleUrl: './navigation.css',
})
export class Navigation implements OnInit, OnDestroy {

  private router = inject(Router);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();
  
  loggedIn = false;
  user: User | null = null;

  async ngOnInit() {
    await this.updateAuthState();
    
    // Update auth state on every navigation
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(async () => {
        await this.updateAuthState();
      });
  }

  private async updateAuthState() {
    const currentUser = await this.authService.getUser();
    this.loggedIn = currentUser != null;
    if (currentUser) {
      this.user = currentUser;
    } else {
      this.user = null;
    }
  }

  logout() {
    localStorage.clear();
    this.loggedIn = false;
    this.user = null;
    this.router.navigate(['']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
