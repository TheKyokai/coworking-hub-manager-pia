import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import Reservation from '../../models/reservation';
import Message from '../../models/message';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {

  private backUrl = "http://localhost:4000";
  private http = inject(HttpClient);
    
  async getAllReservations()
  {
    const reservations =  await firstValueFrom(
      this.http.get<Reservation[]>(`${this.backUrl}/reservation/get-all`)
    );
    if (!reservations)
      return [];
    return reservations;
  }

  async getUserReservations(username: string)
  {
    const reservations = await this.getAllReservations();
    return reservations.filter(res => res.username === username);
  }

  async getFirmReservations(firmId: string)
  {
    const reservations = await this.getAllReservations();
    return reservations.filter(res => res.firmId === firmId);
  }

  async makeReservation(reservation: Reservation)
  {
    try {
      const response = await firstValueFrom(
        this.http.post<Message>(
          `${this.backUrl}/reservation/make`,
          { ...reservation },
          { observe: 'response' }
        )
      );
      if (response && response.ok)
        return {message: response.body?.message, ok: true};
      return { message: "Došlo je do greške.", ok: false};
    } catch (error: any) {
      console.error("Reservation error: ", error?.error?.message);
      return {message: error?.error?.message, ok: false};
    }
  }

  async cancelReservation(reservation: Reservation)
  {
    try {
      const response = await firstValueFrom(
        this.http.post(
          `${this.backUrl}/reservation/cancel`,
          { ...reservation },
          { observe: 'response' }
        )
      );
      if (response && response.ok)
        return response.body;
      return { message: "Došlo je do greške." };
    } catch (error: any) {
      console.error("Reservation error: ", error?.error?.message);
      return {message: error?.error?.message};
    }
  }

  async confirmReservation(reservation: Reservation)
  {
    try {
      const response = await firstValueFrom(
        this.http.post(
          `${this.backUrl}/reservation/confirm`,
          { ...reservation },
          { observe: 'response' }
        )
      );
      if (response && response.ok)
        return response.body;
      return { message: "Došlo je do greške." };
    } catch (error: any) {
      console.error("Reservation error: ", error?.error?.message);
      return {message: error?.error?.message};
    }
  }

  async declineReservation(reservation: Reservation)
  {
    try {
      const response = await firstValueFrom(
        this.http.post(
          `${this.backUrl}/reservation/decline`,
          { ...reservation },
          { observe: 'response' }
        )
      );
      if (response && response.ok)
        return response.body;
      return { message: "Došlo je do greške." };
    } catch (error: any) {
      console.error("Reservation error: ", error?.error?.message);
      return {message: error?.error?.message};
    }
  }
  
}
