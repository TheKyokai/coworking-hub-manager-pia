import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  
  private backUrl = "http://localhost:4000"
  private http = inject(HttpClient)

  login()
  {
    
  }
  
}
