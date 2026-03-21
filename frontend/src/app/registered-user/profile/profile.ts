import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth-service/auth-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import User from '../../models/user';
import Message from '../../models/message';
import { UserService } from '../../services/user-service/user-service';
import Firm from '../../models/firm';
import { FirmService } from '../../services/firm-service/firm-service';

@Component({
  selector: 'app-profile',
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit, OnDestroy {

  private authService = inject(AuthService);
  private userService = inject(UserService);
  private firmService = inject(FirmService);
  private router = inject(Router);

  user = new User();
  firm: Firm | null = null;
  profilePictureSource = "";
  editingUser: User | null = null;
  isEditing = false;

  loading = false;
  successMessage = '';
  errorMessage = '';
  
  profilePicture: File | null = null;
  profilePicturePreview: string | null = null;
  img: HTMLImageElement | null = null;
  
  newPassword = '';
  confirmPassword = '';

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

  async ngOnInit()
  {
    const checkedUser = await this.authService.getUser();
    if (checkedUser == null)
    {
      this.router.navigate(['']);
      return;
    }
    this.user = checkedUser;
    this.editingUser = { ...checkedUser };
    this.profilePictureSource = `http://localhost:4000/${this.user.profilePicture}?ts=${Date.now()}`;

    if (this.user.firmId) {
      try {
        this.firm = await this.firmService.getFirm(this.user.firmId);
      } catch {
        this.firm = null;
      }
    } else {
      this.firm = null;
    }
  }

  onProfilePictureChange(event: any)
  {
    const file = event.target.files[0];
    if (this.img)
      URL.revokeObjectURL(this.img.src);

    this.img = new Image();
    const objectUrl = URL.createObjectURL(file);
    this.img.src = objectUrl;

    const imgRef = this.img;

    this.img.onload = () => {
      const width = imgRef.width;
      const height = imgRef.height;

      if (width < 100 || height < 100 || width > 300 || height > 300)
      {
        this.errorMessage = "Profilna slika mora biti između 100x100 i 300x300 piksela.";
        this.profilePicture = null;
        this.profilePicturePreview = null;
        URL.revokeObjectURL(imgRef.src);
      }
      else
      {
        this.errorMessage = "";
        this.profilePicture = file;
        this.profilePicturePreview = objectUrl;
      }
    };
  }

  ngOnDestroy()
  {
    if (this.img)
      URL.revokeObjectURL(this.img.src);
  }

  onPasswordInput()
  {
    const pwd = this.newPassword;
    this.passwordValidations.length = pwd.length >= 8 && pwd.length <= 12;
    this.passwordValidations.upper = this.upperPattern.test(pwd);
    this.passwordValidations.number = this.numberPattern.test(pwd);
    this.passwordValidations.special = this.specialPattern.test(pwd);
    this.passwordValidations.startsWithLetter = this.startsWithLetterPattern.test(pwd);
    this.passwordValidations.match = pwd.length > 0 && this.newPassword === this.confirmPassword;
    this.passwordValidations.general = this.generalPattern.test(pwd);
  }

  onPasswordConfirmInput()
  {
    this.passwordValidations.match = this.newPassword.length > 0 && this.newPassword === this.confirmPassword;
  }

  async saveChanges()
  {
    if (!this.editingUser)
      return;

    // Validation
    if (!this.editingUser.firstName || !this.editingUser.firstName.trim())
    {
      this.errorMessage = "Ime je obavezno";
      return;
    }

    if (!this.editingUser.lastName || !this.editingUser.lastName.trim())
    {
      this.errorMessage = "Prezime je obavezno";
      return;
    }

    if (!this.editingUser.email || !this.editingUser.email.trim())
    {
      this.errorMessage = "Email je obavezan";
      return;
    }

    if (!this.editingUser.phoneNumber || !this.editingUser.phoneNumber.trim())
    {
      this.errorMessage = "Telefon je obavezan";
      return;
    }

    if (this.newPassword || this.confirmPassword)
    {
      if (!this.passwordValidations.general)
      {
        this.errorMessage = "Lozinka nije validna";
        return;
      }

      if (!this.passwordValidations.match)
      {
        this.errorMessage = "Lozinke se ne poklapaju";
        return;
      }
    }
    
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';
    try {
      const result = await this.userService.updateUser(
        this.editingUser,
        this.profilePicture,
        this.newPassword || undefined
      );
      if (result.message.includes('uspešno'))
        this.successMessage = result.message;
      else
        this.errorMessage = result.message;
      
    } finally {
      this.loading = false;
      this.profilePicture = null;
      this.profilePicturePreview = null;
      this.newPassword = '';
      this.confirmPassword = '';
      this.successMessage = '';
      this.errorMessage = '';
      this.resetPasswordValidations();
      this.ngOnInit();
    }
  }

  resetPasswordValidations()
  {
    this.passwordValidations = {
      length: false,
      upper: false,
      number: false,
      special: false,
      startsWithLetter: false,
      match: false,
      general: false
    };
  }

  toggleEditMode()
  {
    this.isEditing = !this.isEditing;
    if (!this.isEditing)
    {
      this.cancelEditing();
    }
  }

  cancelEditing()
  {
    this.editingUser = { ...this.user };
    this.profilePicture = null;
    this.profilePicturePreview = null;
    this.newPassword = '';
    this.confirmPassword = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.resetPasswordValidations();
    this.isEditing = false;
  }
}
