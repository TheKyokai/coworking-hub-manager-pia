import { Component, inject, OnInit } from '@angular/core';
import User from '../../../models/user';
import { AdminService } from '../../../services/admin-service/admin-service';
import { UserService } from '../../../services/user-service/user-service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-user-view',
  imports: [],
  templateUrl: './admin-user-view.html',
  styleUrl: './admin-user-view.css',
})
export class AdminUserView implements OnInit {
  
  private userService = inject(UserService);
  private router = inject(Router);

  allUsers: User[] = [];
  loading = false;

  ngOnInit()
  {
    this.loadAllUsers();
  }

  async loadAllUsers()
  {
    this.loading = true;
    try {
      this.allUsers = await this.userService.getAllUsers();
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
    if (role === 'admin')
      return 'Admin'
    return role;
  }

  displayStatus(status: string)
  {
    if (status === 'pending')
      return 'Na čekanju';
    if (status === 'approved')
      return 'Odobren';
    if (status === 'rejected')
      return 'Odbijen';
    return status;
  }

  showProfile(user: User)
  {
    this.router.navigate(['admin-user-profile', user.username]);
  }
}

