import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import Message from '../../models/message';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  
  private backUrl = "http://localhost:4000";
  private http = inject(HttpClient);
  
  async approveUser(username: string)
  {
    try {
      const response = await firstValueFrom(
        this.http.post<Message>(
          `${this.backUrl}/admin/approve-user`,
          { username },
          { observe: 'response' }
        )
      );
      const msg = new Message();
      msg.message = response.body?.message || 'Korisnik je odobren.';
      return msg;
    } catch (error: any) {
      const msg = new Message();
      msg.message = error?.error?.message || 'Greška pri odobravanju korisnika.';
      return msg;
    }
  }

  async declineUser(username: string)
  {
    try {
      const response = await firstValueFrom(
        this.http.post<Message>(
          `${this.backUrl}/admin/decline-user`,
          { username },
          { observe: 'response' }
        )
      );
      const msg = new Message();
      msg.message = response.body?.message || 'Korisnik je odbijen.';
      return msg;
    } catch (error: any) {
      const msg = new Message();
      msg.message = error?.error?.message || 'Greška pri odbijanju korisnika.';
      return msg;
    }
  }

  async deleteUser(username: string)
  {
    try {
      const response = await firstValueFrom(
        this.http.post<Message>(
          `${this.backUrl}/admin/delete-user`,
          { username },
          { observe: 'response' }
        )
      );
      const msg = new Message();
      msg.message = response.body?.message || 'Korisnik je uspešno obrisan.';
      return msg;
    } catch (error: any) {
      const msg = new Message();
      msg.message = error?.error?.message || 'Greška pri brisanju korisnika.';
      return msg;
    }
  }

  async approveWorkspace(firmId: string, workspaceName: String)
  {
    try {
      const response = await firstValueFrom(
        this.http.post<Message>(
          `${this.backUrl}/admin/approve-workspace`,
          { firmId, workspaceName },
          { observe: 'response' }
        )
      );
      const msg = new Message();
      msg.message = response.body?.message || 'Radni prostor je odobren.';
      return msg;
    } catch (error: any) {
      const msg = new Message();
      msg.message = error?.error?.message || 'Greška pri odobravanju radnog prostora.';
      return msg;
    }
  }

  async declineWorkspace(firmId: string, workspaceName: String)
  {
    try {
      const response = await firstValueFrom(
        this.http.post<Message>(
          `${this.backUrl}/admin/decline-workspace`,
          { firmId, workspaceName },
          { observe: 'response' }
        )
      );
      const msg = new Message();
      msg.message = response.body?.message || 'Radni prostor je odbijen.';
      return msg;
    } catch (error: any) {
      const msg = new Message();
      msg.message = error?.error?.message || 'Greška pri odbijanju radnog prostora.';
      return msg;
    }
  }

}
