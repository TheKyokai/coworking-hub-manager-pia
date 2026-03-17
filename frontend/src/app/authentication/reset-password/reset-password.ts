import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service/auth-service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import Message from '../../models/message';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit{

  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  private token = '';

  password = '';
  passwordConfirm = '';
  msg = new Message();

  // Password validation flags
  passwordValidations = {
    length: false,
    upper: false,
    number: false,
    special: false,
    startsWithLetter: false,
    match: false,
    general: false
  };

  // Regex patterns
  private upperPattern = /[A-Z]/;
  private numberPattern = /[0-9]/;
  private specialPattern = /[^A-Za-z0-9]/;
  private startsWithLetterPattern = /^[A-Za-z]/;
  private generalPattern = /^[a-zA-Z][^\s]{7,11}$/;

  onPasswordInput() 
  {
    const pwd = this.password;
    this.passwordValidations.length = pwd.length >= 8 && pwd.length <= 12;
    this.passwordValidations.upper = this.upperPattern.test(pwd);
    this.passwordValidations.number = this.numberPattern.test(pwd);
    this.passwordValidations.special = this.specialPattern.test(pwd);
    this.passwordValidations.startsWithLetter = this.startsWithLetterPattern.test(pwd);
    this.passwordValidations.match = pwd.length > 0 && this.password === this.passwordConfirm;
    this.passwordValidations.general = this.generalPattern.test(pwd);
  }

  onPasswordConfirmInput() 
  {
    this.passwordValidations.match = this.password.length > 0 && this.password === this.passwordConfirm;
  }

  ngOnInit(): void 
  {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    this.msg.message = this.token;
  }

  async submit()
  {
    this.msg = await this.authService.resetPassword(this.password, this.token);
  }

}
