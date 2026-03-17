import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs'
import Message from '../../models/message';
import User from '../../models/user';
import Firm from '../../models/firm';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  
  private backUrl = "http://localhost:4000"
  private http = inject(HttpClient)

  login(username: string, password: string)
  {
    return this.http.post<Message>(
      `${this.backUrl}/user/login`,
      { username: username, password: password},
      { observe: 'response' }
    )
  }

  adminLogin(username: string, password: string)
  {
    return this.http.post<Message>(
      `${this.backUrl}/user/login-admin`,
      { username: username, password: password},
      { observe: 'response' }
    )
  }

  async getUser(): Promise<User | null> {
    try {
      if (localStorage.getItem("token") == null)
        return null;

      const user = await firstValueFrom(
        this.http.get<User>(`${this.backUrl}/user/get`)
      )
      return user ?? null

    } catch (err) {
      // console.error("User retrieval failed", err)
      return null

    }
  }

  async registerUser(user: User, password: string, profilePictureFile?: File | null): Promise<Message> {
    try {

      const formData = new FormData();

      formData.append("userJSON", JSON.stringify(user));
      formData.append("password", password);

      if (profilePictureFile) {
        formData.append("profilePicture", profilePictureFile);
      }

      const response = await firstValueFrom(
        this.http.post<Message>(
          `${this.backUrl}/user/register-user`,
          formData,
          { observe: 'response' }
        )
      );


      const msg = new Message();
      msg.message = response.body?.message || 'Uspešna registracija.';
      return msg;
    } catch (error: any) {
      const msg = new Message();
      msg.message = error?.error?.message || 'Neuspešna registracija.';
      return msg;
    }
  }

  async registerManager(user: User, firm: Firm, password: string, profilePictureFile?: File | null): Promise<Message> {
    try {

      const formData = new FormData();

      formData.append("userJSON", JSON.stringify(user));
      formData.append("password", password);
      formData.append("firmJSON", JSON.stringify(firm));

      if (profilePictureFile) {
        formData.append("profilePicture", profilePictureFile);
      }

      const response = await firstValueFrom(
        this.http.post<Message>(
          `${this.backUrl}/user/register-manager`,
          formData,
          { observe: 'response' }
        )
      );
      const msg = new Message();
      
      msg.message = response.body?.message || 'Uspešna registracija.';
      return msg;
    } catch (error: any) {
      const msg = new Message();
      msg.message = error?.error?.message || 'Neuspešna registracija.';
      return msg;
    }
  }
  
}
