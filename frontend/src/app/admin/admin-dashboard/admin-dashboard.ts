import { Component } from '@angular/core';
import { AdminRequestView } from './admin-request-view/admin-request-view';
import { AdminUserView } from './admin-user-view/admin-user-view';

@Component({
  selector: 'app-admin-dashboard',
  imports: [AdminRequestView, AdminUserView],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  activeTab: 'pending' | 'users' = 'pending';

  switchTab(tab: 'pending' | 'users')
  {
    this.activeTab = tab;
  }
}
