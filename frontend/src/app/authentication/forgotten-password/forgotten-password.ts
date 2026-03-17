import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth-service/auth-service';
import Message from '../../models/message';
import { FormsModule } from '@angular/forms';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-forgotten-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './forgotten-password.html',
  styleUrl: './forgotten-password.css',
})
export class ForgottenPassword {
  
  private authService = inject(AuthService);

  identifier = '';
  msg = new Message();


  async submit()
  {
    this.msg = await this.authService.requestPasswordReset(this.identifier);
  }

}
