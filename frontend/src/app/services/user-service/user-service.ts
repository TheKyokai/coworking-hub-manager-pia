import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import User from '../../models/user';
import { firstValueFrom } from 'rxjs';
import Message from '../../models/message';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private backUrl = "http://localhost:4000";
  private http = inject(HttpClient);

  async getPendingRegistrations() 
  {
    try {
      const users = await firstValueFrom(
        this.http.get<User[]>(`${this.backUrl}/user/pending-registrations`)
      );
      return users;
    } catch (error) {
      console.error("Failed to fetch pending registrations", error);
      return [];
    }
  }

  async getAllUsers() 
  {
    try {
      const users = await firstValueFrom(
        this.http.get<User[]>(`${this.backUrl}/user/all-users`)
      );
      return users;
    } catch (error) {
      console.error("Failed to fetch all users", error);
      return [];
    }
  }


  async getUserByUsername(username: string)
  {
    try {
      const user = await firstValueFrom(
        this.http.get<User>(`${this.backUrl}/user/get-by-username/${username}`)
      );
      return user;
    } catch (error) {
      console.error("Failed to fetch user", error);
      return null;
    }
  }

  async updateUser(user: User, profilePicture: File | null = null, password?: string)
  {
    try {
      const formData = new FormData();
      formData.append('userJSON', JSON.stringify(user));
      
      if (profilePicture)
        formData.append('profilePicture', profilePicture);

      if (password)
        formData.append('password', password);

      const response = await firstValueFrom(
        this.http.post<Message>(
          `${this.backUrl}/user/update`,
          formData,
          { observe: 'response' }
        )
      );
      const msg = new Message();
      msg.message = response.body?.message || 'Korisnik je uspešno ažuriran.';
      return msg;
    } catch (error: any) {
      const msg = new Message();
      msg.message = error?.error?.message || 'Greška pri ažuriranju korisnika.';
      return msg;
    }
  }
  
}
