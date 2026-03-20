import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import Firm from '../../models/firm';

@Injectable({
  providedIn: 'root',
})
export class FirmService {

  private backUrl = "http://localhost:4000";
  private http = inject(HttpClient);


  async getFirm(firmId: string)
  {
    return firstValueFrom( await this.http.get<Firm>(`${this.backUrl}/firm/get/${firmId}`) );
  }
  
}
