import { Component } from '@angular/core';
import { AdminRequestView } from './admin-request-view/admin-request-view';
import { AdminUserView } from './admin-user-view/admin-user-view';
import { AdminWorkspaceRequestView } from './admin-workspace-request-view/admin-workspace-request-view';

@Component({
  selector: 'app-admin-dashboard',
  imports: [AdminRequestView, AdminUserView, AdminWorkspaceRequestView],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  activeTab: string = 'pending';

  switchTab(tab: string)
  {
    this.activeTab = tab;
  }
}
