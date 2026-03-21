import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationView } from '../../../reservation-view/reservation-view';
import { AuthService } from '../../../services/auth-service/auth-service';
import { WorkspaceService } from '../../../services/workspace-service/workspace-service';
import { ReservationService } from '../../../services/reservation-service/reservation-service';
import Workspace from '../../../models/workspace';
import Reservation from '../../../models/reservation';
import User from '../../../models/user';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventContentArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

type ElementOption = {
  key: string;
  label: string;
};

@Component({
  selector: 'app-manager-reservation-view',
  imports: [CommonModule, FormsModule, ReservationView, FullCalendarModule],
  templateUrl: './manager-reservation-view.html',
  styleUrl: './manager-reservation-view.css',
})
export class ManagerReservationView implements OnInit {
  private authService = inject(AuthService);
  private workspaceService = inject(WorkspaceService);
  private reservationService = inject(ReservationService);

  user: User | null = null;
  workspaces: Workspace[] = [];
  reservations: Reservation[] = [];

  selectedWorkspaceKey = '';
  selectedElementKey = '';
  elementOptions: ElementOption[] = [];

  calendarEvents: EventInput[] = [];
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    firstDay: 1,
    height: 560,
    nowIndicator: true,
    allDaySlot: false,
    slotMinTime: '00:00:00',
    slotMaxTime: '24:00:00',
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
    headerToolbar: {
      left: 'prev today',
      center: 'title',
      right: 'next',
    },
    buttonText: {
      today: 'danas',
    },
    eventDisplay: 'block',
    displayEventEnd: true,
    eventContent: (arg: EventContentArg) => {
      const username = arg.event.extendedProps['username'] as string;
      return { html: `<div><strong>${arg.timeText}</strong><br>${username}</div>` };
    },
    events: [],
  };

  async ngOnInit()
  {
    this.user = await this.authService.getUser();
    if (!this.user || this.user.role !== 'manager') {
      return;
    }

    const allWorkspaces = await this.workspaceService.getAllWorkspaces();
    this.workspaces = allWorkspaces.filter(ws => ws.firmId === this.user!.firmId);

    const firmReservations = await this.reservationService.getFirmReservations(this.user.firmId);
    this.reservations = firmReservations;
  }

  getWorkspaceKey(ws: Workspace)
  {
    return `${ws.firmId}|${ws.name}`;
  }

  getSelectedWorkspace()
  {
    if (!this.selectedWorkspaceKey) 
    {
      return null;
    }
    return this.workspaces.find(ws => this.getWorkspaceKey(ws) === this.selectedWorkspaceKey) || null;
  }

  onWorkspaceChange()
  {
    this.selectedElementKey = '';
    this.buildElementOptions();
    this.clearCalendar();
  }

  onElementChange()
  {
    this.refreshCalendar();
  }

  private buildElementOptions()
  {
    const ws = this.getSelectedWorkspace();
    if (!ws) {
      this.elementOptions = [];
      return;
    }

    const options: ElementOption[] = [];
    if (ws.capacity > 0) 
      options.push({ key: 'open', label: 'Otvoreni prostor' });
    

    ws.privateSpaces.forEach(ps => {
      const typeLabel = ps.type === 'office' ? 'kancelarija' : 'konferencijska sala';
      options.push({ key: `private:${ps.spaceName}`, label: `${ps.spaceName} (${typeLabel})` });
    });

    this.elementOptions = options;
  }

  shouldShowCalendar()
  {
    return this.selectedWorkspaceKey !== '' && this.selectedElementKey !== '';
  }

  private clearCalendar()
  {
    this.calendarEvents = [];
    this.calendarOptions = {
      ...this.calendarOptions,
      events: this.calendarEvents,
    };
  }

  private getStatusCalendarColors(status: string)
  {
    if (status === 'active') {
      return { backgroundColor: '#e5f6e8', borderColor: '#2f7a36', textColor: '#2f7a36' };
    }
    if (status === 'confirmed') {
      return { backgroundColor: '#e6f2ff', borderColor: '#2b5f9e', textColor: '#2b5f9e' };
    }
    if (status === 'cancelled') {
      return { backgroundColor: '#fde9e8', borderColor: '#9f3e3a', textColor: '#9f3e3a' };
    }
    return { backgroundColor: '#f2ebea', borderColor: '#7a5c57', textColor: '#7a5c57' };
  }

  private refreshCalendar()
  {
    const ws = this.getSelectedWorkspace();
    if (!ws || !this.selectedElementKey) {
      this.clearCalendar();
      return;
    }

    let filtered = this.reservations.filter(res => res.firmId === ws.firmId && res.workspaceName === ws.name);

    if (this.selectedElementKey === 'open') {
      filtered = filtered.filter(res => res.type === 'open');
    } else if (this.selectedElementKey.startsWith('private:')) {
      const privateSpaceName = this.selectedElementKey.slice('private:'.length);
      filtered = filtered.filter(res => res.type === 'private' && res.privateSpaceName === privateSpaceName);
    }

    this.calendarEvents = filtered.map((res) => {
      const statusColors = this.getStatusCalendarColors(res.status);

      return {
        start: new Date(res.startDate),
        end: new Date(res.endDate),
        backgroundColor: statusColors.backgroundColor,
        borderColor: statusColors.borderColor,
        textColor: statusColors.textColor,
        extendedProps: {
          username: res.username,
        },
      };
    });

    this.calendarOptions = {
      ...this.calendarOptions,
      events: this.calendarEvents,
    };
  }

}
