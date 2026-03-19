import { Component, OnDestroy, OnInit, inject } from '@angular/core';
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

export class Registration implements OnInit, OnDestroy{
  private authService = inject(AuthService);
  user = new User();
  password = '';
  passwordConfirm = '';
  loading = false;

  firm = new Firm();
  msg = new Message();
  profilePicture: File | null = null;
  profilePicturePreview: string | null = null;
  img: HTMLImageElement | null = null;

  // Password and username validation flags
  passwordValidations = {
    length: false,
    upper: false,
    number: false,
    special: false,
    startsWithLetter: false,
    match: false,
    general: false
  };
  usernameHasWhitespace = false;

  // Regex patterns
  private upperPattern = /[A-Z]/;
  private numberPattern = /[0-9]/;
  private specialPattern = /[^A-Za-z0-9]/;
  private startsWithLetterPattern = /^[A-Za-z]/;
  private generalPattern = /^[a-zA-Z][^\s]{7,11}$/;
  private whitespacePattern = /\s/;

  ngOnInit(): void 
  {
    this.user.role = "user"
  }

  onUsernameInput() {
    this.usernameHasWhitespace = this.whitespacePattern.test(this.user.username || '');
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
    this.passwordValidations.general = this.generalPattern.test(pwd);
  }

  onPasswordConfirmInput() 
  {
    this.passwordValidations.match = this.password.length > 0 && this.password === this.passwordConfirm;
  }

  onProfilePictureChange(event: any) {
    const file = event.target.files[0];
    if (this.img)
      URL.revokeObjectURL(this.img.src);

    // Image object to read dimensions
    this.img = new Image();
    const objectUrl = URL.createObjectURL(file);
    this.img.src = objectUrl;

    const imgRef = this.img;

    this.img.onload = () => {
      const width = imgRef.width;
      const height = imgRef.height;

      if (width < 100 || height < 100 || width > 300 || height > 300) {
        this.msg.message = "Profilna slika mora biti između 100x100 i 300x300 piksela.";
        this.profilePicture = null;
        this.profilePicturePreview = null;
        URL.revokeObjectURL(imgRef.src);
      } else {
        this.msg.message = "";
        this.profilePicture = file;
        this.profilePicturePreview = objectUrl;
        console.log(objectUrl);
      }
    };
  }

  ngOnDestroy(): void 
  {
    if (this.img)
      URL.revokeObjectURL(this.img.src);
  }

  async submit() {
    this.loading = true;
    this.msg.message = '';
    
    if (this.user.role === 'manager') {
      this.msg = await this.authService.registerManager(this.user, this.firm, this.password, this.profilePicture);
    } else {
      this.msg = await this.authService.registerUser(this.user, this.password, this.profilePicture);
    }
    
    this.loading = false;
  }
}
