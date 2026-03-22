import { Component, OnInit } from '@angular/core';
import { AdminRequestView } from './admin-request-view/admin-request-view';
import { AdminUserView } from './admin-user-view/admin-user-view';
import { AdminWorkspaceRequestView } from './admin-workspace-request-view/admin-workspace-request-view';

@Component({
  selector: 'app-admin-dashboard',
  imports: [AdminRequestView, AdminUserView, AdminWorkspaceRequestView],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  activeTab: string = 'pending';

  ngOnInit()
  {
    const storedTab = localStorage.getItem('adminSelectedTab');
    if (storedTab) 
      this.activeTab = storedTab; 
  }

  selectTab(tab: string)
  {
    this.activeTab = tab;
    localStorage.setItem('adminSelectedTab', tab);
  }
}
