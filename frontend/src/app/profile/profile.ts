import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../services/auth-service/auth-service';
import { Router } from '@angular/router';
import User from '../models/user';
import Message from '../models/message';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit{

  private authService = inject(AuthService)
  private router = inject(Router)

  user = new User()
  msg = new Message()

  async ngOnInit()
  {
    const checkedUser = await this.authService.getUser()
    if (checkedUser == null)
    {
      this.router.navigate([''])
      return
    }
    this.user = checkedUser
  }
}
