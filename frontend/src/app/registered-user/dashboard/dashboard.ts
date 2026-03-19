import { Component, inject, OnInit } from '@angular/core';
import { Profile } from '../profile/profile';
import { ManagerReservationView } from '../manager/manager-reservation-view/manager-reservation-view';
import { ManagerWorkspaceView } from '../manager/manager-workspace-view/manager-workspace-view';
import { ManagerWorkspaceRegistration } from '../manager/manager-workspace-registration/manager-workspace-registration';
import { AuthService } from '../../services/auth-service/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [Profile, ManagerReservationView, ManagerWorkspaceView, ManagerWorkspaceRegistration],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  selectedTab = 'profile';
  isManager = false;

  async ngOnInit() {
    const user = await this.authService.getUser();
    if (user) {
      this.isManager = user.role === 'manager';
      if (user.role === 'admin')
        this.router.navigate(['admin-dashboard']);
    }
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }
}
