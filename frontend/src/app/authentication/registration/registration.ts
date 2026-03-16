import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../services/auth-service/auth-service';
import { FormsModule } from '@angular/forms';
import User from '../../models/user';
import Firm from '../../models/firm';
import Message from '../../models/message';

@Component({
  selector: 'app-registration',
  imports: [FormsModule],
  templateUrl: './registration.html',
  styleUrl: './registration.css',
})

export class Registration implements OnInit{
    private authService = inject(AuthService);
  user = new User();
  password = '';
  passwordConfirm = '';

  firm = new Firm();

  msg = new Message();

  // Password validation flags
  passwordValidations = {
    length: false,
    upper: false,
    number: false,
    special: false,
    startsWithLetter: false,
    match: false,
  };

  // Regex patterns
  private upperPattern = /[A-Z]/;
  private numberPattern = /[0-9]/;
  private specialPattern = /[^A-Za-z0-9]/;
  private startsWithLetterPattern = /^[A-Za-z]/;


  ngOnInit(): void 
  {
    this.user.role = "user"
  }

  onPasswordInput() 
  {
    const pwd = this.password;
    this.passwordValidations.length = pwd.length >= 8 && pwd.length <= 12;
    this.passwordValidations.upper = this.upperPattern.test(pwd);
    this.passwordValidations.number = this.numberPattern.test(pwd);
    this.passwordValidations.special = this.specialPattern.test(pwd);
    this.passwordValidations.startsWithLetter = this.startsWithLetterPattern.test(pwd);
    this.passwordValidations.match = pwd.length > 0 && this.password === this.passwordConfirm;
  }

  onPasswordConfirmInput() 
  {
    this.passwordValidations.match = this.password.length > 0 && this.password === this.passwordConfirm;
  }

  async submit() {
    if (this.user.role === 'manager') {
      this.msg = await this.authService.registerManager(this.user, this.firm, this.password);
    } else {
      this.msg = await this.authService.registerUser(this.user, this.password);
    }
  }
}
