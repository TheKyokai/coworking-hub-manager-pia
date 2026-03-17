import { Component, inject, OnInit } from '@angular/core';
import User from '../../../models/user';
import { AdminService } from '../../../services/admin-service/admin-service';
import { UserService } from '../../../services/user-service/user-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-request-view',
  imports: [],
  templateUrl: './admin-request-view.html',
  styleUrl: './admin-request-view.css',
})
export class AdminRequestView implements OnInit {
  private adminService = inject(AdminService);
  private userService = inject(UserService);
  private router = inject(Router);

  pendingRegistrations: User[] = [];
  loading = false;

  ngOnInit()
  {
    this.loadPendingRegistrations();
  }

  async loadPendingRegistrations()
  {
    this.loading = true;
    try {
      this.pendingRegistrations = await this.userService.getPendingRegistrations();
    } finally {
      this.loading = false;
    }
  }

  async approveUser(user: User)
  {
    this.loading = true;
    try {
      const result = await this.adminService.approveUser(user.username);
      console.log(result.message);
      await this.loadPendingRegistrations();
    } finally {
      this.loading = false;
    }
  }

  async declineUser(user: User)
  {
    this.loading = true;
    try {
      const result = await this.adminService.declineUser(user.username);
      console.log(result.message);
      await this.loadPendingRegistrations();
    } finally {
      this.loading = false;
    }
  }

  profilePictureSrc(profilePicture: string)
  {
    return `http://localhost:4000/${profilePicture}`;
  }

  displayRole(role: string)
  {
    if (role === 'user')
      return 'Član';
    if (role === 'manager')
      return 'Menadžer';
    return role;
  }

  showProfile(user: User)
  {
    this.router.navigate(['admin-user-profile', user.username]);
  }
}
