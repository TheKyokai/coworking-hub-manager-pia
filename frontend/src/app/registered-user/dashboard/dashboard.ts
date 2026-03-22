import { Component, inject, OnInit } from '@angular/core';
import { Profile } from '../profile/profile';
import { ManagerReservationView } from '../manager/manager-reservation-view/manager-reservation-view';
import { ManagerWorkspaceView } from '../manager/manager-workspace-view/manager-workspace-view';
import { ManagerWorkspaceRegistration } from '../manager/manager-workspace-registration/manager-workspace-registration';
import { AuthService } from '../../services/auth-service/auth-service';
import { Router } from '@angular/router';
import { UserReservationView } from '../user/user-reservation-view/user-reservation-view';
import { BrowseWorkspaces } from '../../browse-workspaces/browse-workspaces';
import { ManagerReportView } from '../manager/manager-report-view/manager-report-view';

@Component({
  selector: 'app-dashboard',
  imports: [Profile, ManagerReservationView, ManagerWorkspaceView, ManagerWorkspaceRegistration, UserReservationView, BrowseWorkspaces, ManagerReportView],
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
    const storedTab = localStorage.getItem('selectedTab');
    if (user) 
    {
      this.isManager = user.role === 'manager';
      if (user.role === 'admin')
        this.router.navigate(['admin-dashboard']);
      if (storedTab) 
        this.selectedTab = storedTab;
    }
  }

  selectTab(tab: string) 
  {
    this.selectedTab = tab;
    localStorage.setItem('selectedTab', tab);
  }
}
