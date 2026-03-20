import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth-service/auth-service';
import { ReservationService } from '../services/reservation-service/reservation-service';
import Reservation from '../models/reservation';
import { WorkspaceService } from '../services/workspace-service/workspace-service';
import Workspace from '../models/workspace';
import User from '../models/user';

@Component({
  selector: 'app-reservation-view',
  imports: [CommonModule],
  templateUrl: './reservation-view.html',
  styleUrl: './reservation-view.css',
})
export class ReservationView implements OnInit{

  private authService = inject(AuthService);
  private reservationService = inject(ReservationService);
  private workspaceService = inject(WorkspaceService);


  user: User | null = null;
  reservations: Reservation[] = [];
  workspaces: Workspace[] = [];
  sortColumn: 'name' | 'city' | 'startDate' | 'endDate' = 'startDate';
  sortDirection: 'asc' | 'desc' = 'asc';


  async ngOnInit()
  {
    this.user = await this.authService.getUser();
    if (!this.user)
      return;
    if (this.user.role === 'user')
      this.reservations = await this.reservationService.getUserReservations(this.user.username);
    else 
    {
      this.reservations = await this.reservationService.getFirmReservations(this.user.firmId);
      this.reservations = this.reservations.filter(res => res.status === 'active');
    }
    this.workspaces = await this.workspaceService.getAllWorkspaces();
    
    for (let res of this.reservations)
    {
      const workSp = this.workspaces.find(ws => ws.firmId === res.firmId && ws.name === res.workspaceName);
      if (workSp)
        res.ws = workSp;
    }

    this.applySorting();
  }

  sortByColumn(column: 'name' | 'city' | 'startDate' | 'endDate')
  {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.applySorting();
  }

  getSortIndicator(column: 'name' | 'city' | 'startDate' | 'endDate')
  {
    if (this.sortColumn !== column)
      return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  isSortable(column: 'name' | 'city' | 'startDate' | 'endDate')
  {
    return this.sortColumn === column;
  }

  private applySorting()
  {
    this.reservations = [...this.reservations].sort((a, b) => {
      const multiplier = this.sortDirection === 'asc' ? 1 : -1;

      if (this.sortColumn === 'name') {
        return a.workspaceName.localeCompare(b.workspaceName) * multiplier;
      }

      if (this.sortColumn === 'city') {
        const cityA = a.ws?.city || '';
        const cityB = b.ws?.city || '';
        return cityA.localeCompare(cityB) * multiplier;
      }

      if (this.sortColumn === 'startDate') {
        const startA = new Date(a.startDate).getTime();
        const startB = new Date(b.startDate).getTime();
        return (startA - startB) * multiplier;
      }

      const endA = new Date(a.endDate).getTime();
      const endB = new Date(b.endDate).getTime();
      return (endA - endB) * multiplier;
    });
  }


  getStatusDisplay(status: string)
  {
    if (status === 'active')
      return 'Aktivna'
    if (status === 'cancelled')
      return 'Otkazana'
    if (status === 'confirmed')
      return 'Potvrđena'
    if (status === 'declined')
      return 'Odjavljena'
    return ''
  }


  canCancel(res: Reservation)
  {
    if (res.status !== 'active')
      return false;
    const now = new Date();
    const startDate = new Date(res.startDate);
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;
    const diff = startDate.getTime() - now.getTime();
    return diff >= TWELVE_HOURS;
  }

  canConfirmOrDecline(res: Reservation)
  {
    if (res.status !== 'active')
      return false;
    const now = new Date();
    const startDate = new Date(res.startDate);
    const TEN_MIN = 10 * 60 * 1000;
    const diff = now.getTime() - startDate.getTime();
    
    return diff > TEN_MIN;
  }

  async cancelReservation(res: Reservation)
  {
    await this.reservationService.cancelReservation(res);
    await this.ngOnInit();
  } 
  
  async confirmReservation(res: Reservation)
  {
    await this.reservationService.confirmReservation(res);
    await this.ngOnInit();
  }

  async declineReservation(res: Reservation)
  {
    await this.reservationService.declineReservation(res);
    await this.ngOnInit();
  }
}
