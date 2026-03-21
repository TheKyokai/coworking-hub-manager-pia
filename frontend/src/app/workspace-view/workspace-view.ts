import { Component, Input, Output, EventEmitter, inject, OnInit, OnChanges, SimpleChanges, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Workspace from '../models/workspace';
import PrivateSpace from '../models/private-space';
import { WorkspaceService } from '../services/workspace-service/workspace-service';
import { PrivateSpaceView } from '../private-space-view/private-space-view';
import { AuthService } from '../services/auth-service/auth-service';
import { firstValueFrom } from 'rxjs';
import User from '../models/user';
import Firm from '../models/firm';
import { FirmService } from '../services/firm-service/firm-service';
import { UserService } from '../services/user-service/user-service';
import { ReservationService } from '../services/reservation-service/reservation-service';
import Reservation from '../models/reservation';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventContentArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';

@Component({
  selector: 'app-workspace-view',
  imports: [CommonModule, FormsModule, PrivateSpaceView, FullCalendarModule],
  templateUrl: './workspace-view.html',
  styleUrl: './workspace-view.css',
})
export class WorkspaceView implements OnChanges, AfterViewInit {
  @Input() workspace: Workspace = new Workspace();
  @Output() back = new EventEmitter<void>();

  private workspaceService = inject(WorkspaceService);
  private authService = inject(AuthService);
  private firmService = inject(FirmService);
  private userService = inject(UserService);
  private reservationService = inject(ReservationService);

  editingWorkspace: Workspace | null = null;
  isEditing = false;
  isReserving = false;
  loading = false;
  successMessage = '';
  errorMessage = '';

  reserveOpenSpace = false;
  selectedPrivateSpace = '';
  selectedReservationType: 'open' | 'office' | 'conference' | '' = '';
  currentPrivateSpaceIndex = 0;
  reservationDay = '';
  reservationStartTime = '';
  reservationEndTime = '';
  newCommentText = '';
  
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
      right: 'next'
    },
    buttonText: {
      today: 'danas'
    },
    titleFormat: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    },
    dateClick: (arg: DateClickArg) => this.onCalendarDateClick(arg),
    eventDisplay: 'block',
    displayEventEnd: true,
    eventContent: (arg: EventContentArg) => {
      return { html: `<span>${arg.timeText}</span>` };
    },
    events: []
  };


  conferenceRooms: PrivateSpace[] = [];
  offices: PrivateSpace[] = [];
  allowedOfficeNamesFromSearch: string[] | null = null;

  showAddNewPrivateSpace = false;
  newPrivateSpaceType = '';
  newPrivateSpace: PrivateSpace | null = null;

  user: User | null = null;
  firm: Firm | null = null;
  managers: User[]  = [];

  @ViewChild('mapContainer') mapContainer: ElementRef | null = null;
  private map: any = null;

  ngOnChanges(changes: SimpleChanges) 
  {
    if (changes['workspace'] && this.workspace) {
      this.allowedOfficeNamesFromSearch = null;
      this.loadData();
      this.initializeMap();
      this.refreshPrivateSpaceTypeLists();
      this.resetReservationForm();
      this.applySearchedWorkspaceFromStorage();
    }
  }

  ngAfterViewInit() {
    this.initializeMap();
  }

  private initializeMap() {
    if (this.mapContainer && this.workspace.lat && this.workspace.lon && !this.map) {
      setTimeout(() => {
        this.createMap();
      }, 100);
    }
  }

  private createMap() {
    const L = (window as any).L;
    if (!L) {
      console.error('Leaflet library not loaded');
      return;
    }

    if (this.map) {
      this.map.remove();
    }

    this.map = L.map(this.mapContainer?.nativeElement).setView(
      [this.workspace.lat, this.workspace.lon],
      15
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    L.marker([this.workspace.lat, this.workspace.lon])
      .addTo(this.map)
      .bindPopup(`<b>${this.workspace.name}</b><br>${this.workspace.address}`);
  }

  async loadData()
  {
    this.user = await this.authService.getUser();
    if (this.workspace.name === '')
      return;
    
    this.firm = await this.firmService.getFirm(this.workspace.firmId);
    
    for (const mName of this.firm.managers) 
    {
      const manager = await this.userService.getUserByUsername(mName);
      if (manager) 
        this.managers.push(manager);
    } 
  }

  toggleEditMode()
  {
    if (!this.isEditing) 
    {
      // Deep copy
      this.editingWorkspace = { 
        ...this.workspace,
        privateSpaces: this.workspace.privateSpaces ? this.workspace.privateSpaces.map(space => ({ ...space })) : []
      };
      this.isEditing = true;
      this.successMessage = '';
      this.errorMessage = '';
    } 
    else
    {
      this.isEditing = false;
      this.editingWorkspace = null;
      this.successMessage = '';
      this.errorMessage = '';
    }
  }

  async saveChanges()
  {
    if (!this.editingWorkspace) {
      return;
    }

    // Validation
    if (!this.editingWorkspace.name || !this.editingWorkspace.name.trim()) {
      this.errorMessage = "Naziv je obavezan";
      return;
    }

    if (!this.editingWorkspace.city || !this.editingWorkspace.city.trim()) {
      this.errorMessage = "Grad je obavezan";
      return;
    }

    if (!this.editingWorkspace.address || !this.editingWorkspace.address.trim()) {
      this.errorMessage = "Adresa je obavezna";
      return;
    }

    if (!this.editingWorkspace.description || !this.editingWorkspace.description.trim()) {
      this.errorMessage = "Opis je obavezan";
      return;
    }

    if (this.editingWorkspace.capacity <= 0) {
      this.errorMessage = "Broj stolova mora biti veći od 0";
      return;
    }

    if (this.editingWorkspace.pricePerHour < 0) {
      this.errorMessage = "Cena po satu ne može biti negativna";
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const response = await this.workspaceService.updateWorkspace(this.editingWorkspace);
      
      if (response && (response as any).ok) {
        this.successMessage = "Radni prostor je uspešno ažuriran";
        this.workspace = { ...this.editingWorkspace };
      } else {
        this.errorMessage = "Greška pri ažuriranju radnog prostora";
      }
    } catch (error) {
      this.errorMessage = "Greška pri ažuriranju radnog prostora";
      console.error("Error updating workspace:", error);
    } finally {
      this.loading = false;
    }
  }

  onBack()
  {
    this.back.emit();
  }

  toggleAddNewPrivateSpace()
  {
    this.showAddNewPrivateSpace = !this.showAddNewPrivateSpace;
    if (this.showAddNewPrivateSpace) {
      this.newPrivateSpace = new PrivateSpace();
      this.newPrivateSpaceType = 'office';
      this.newPrivateSpace.type = 'office';
    } else {
      this.newPrivateSpace = null;
      this.newPrivateSpaceType = '';
    }
  }

  async addNewPrivateSpace()
  {
    if (!this.newPrivateSpace || !this.newPrivateSpace.spaceName || !this.newPrivateSpace.spaceName.trim()) {
      this.errorMessage = "Naziv prostora je obavezan";
      return;
    }

    if (this.newPrivateSpace.type === 'office') {
      if (this.newPrivateSpace.capacity <= 0) {
        this.errorMessage = "Kapacitet mora biti veći od 0";
        return;
      }
    } else if (this.newPrivateSpace.type === 'conference') {
      this.newPrivateSpace.capacity = 10;
    }

    if (this.newPrivateSpace.pricePerHour < 0) {
      this.errorMessage = "Cena po satu ne može biti negativna";
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      
      const response = await this.workspaceService.addPrivateWorkspace(this.workspace.firmId, this.workspace.name, this.newPrivateSpace);      

      if (response && (response as any).ok) {
        this.successMessage = (response as any).body.message;
        this.toggleAddNewPrivateSpace();

        const reloadedWS = await firstValueFrom( await this.workspaceService.getWorkspace(this.workspace.firmId, this.workspace.name));
        if (reloadedWS) {
          this.workspace = reloadedWS;
          this.editingWorkspace = { ...this.workspace };
        }
      }
    } catch (error: any) {
      this.errorMessage = error.error?.message || "Greška pri dodavanju privatnog prostora";
      console.error("Error adding private workspace:", error);
    } finally {
      this.loading = false;
    }
  }

  onNewPrivateSpaceTypeChange()
  {
    if (this.newPrivateSpace) {
      this.newPrivateSpace.type = this.newPrivateSpaceType;
      if (this.newPrivateSpaceType === 'conference') {
        this.newPrivateSpace.capacity = 10;
      }
    }
  }

  getLikeCount()
  {
    let cnt = 0;
    this.workspace.ratings.filter(r => r.rating === 'like').forEach(r => cnt++);
    return cnt;
  }

  getDislikeCount()
  {
    let cnt = 0;
    this.workspace.ratings.filter(r => r.rating === 'dislike').forEach(r => cnt++);
    return cnt;
  }

  canViewWorkspaceFeedback()
  {
    return this.user?.role === 'user' || this.user?.role === 'manager';
  }

  canLeaveWorkspaceFeedback()
  {
    return this.user?.role === 'user';
  }

  getLatestWorkspaceComments()
  {
    if (!this.workspace.comments) {
      return [];
    }

    return [...this.workspace.comments]
      .sort((a: any, b: any) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
      .slice(0, 10);
  }

  getWorkspaceCommentText(comment: any)
  {
    return comment?.comment || comment?.content || '';
  }

  isCurrentUserComment(comment: any)
  {
    return !!this.user && comment?.username === this.user.username;
  }

  formatWorkspaceCommentDate(datetime: any)
  {
    if (!datetime) {
      return '';
    }
    return new Date(datetime).toLocaleString('sr-RS');
  }

  async submitWorkspaceComment()
  {
    this.errorMessage = '';
    this.successMessage = '';

    const commentText = this.newCommentText.trim();
    if (!commentText) {
      this.errorMessage = 'Komentar ne može biti prazan.';
      return;
    }

    if (!this.user) {
      this.errorMessage = 'Morate biti prijavljeni da biste ostavili komentar.';
      return;
    }

    const response = await this.workspaceService.commentOnWorkspace(
      this.workspace.firmId,
      this.workspace.name,
      this.user.username,
      commentText
    );

    if (response && (response as any).ok) {
      this.successMessage = (response as any).body?.message || 'Komentar je uspešno dodat.';
      this.newCommentText = '';
      await this.reloadWorkspaceData();
      return;
    }

    this.errorMessage = (response as any)?.error?.message || 'Greška pri ostavljanju komentara.';
  }

  async submitWorkspaceRating(ratingType: 'like' | 'dislike')
  {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.user) {
      this.errorMessage = 'Morate biti prijavljeni da biste ostavili ocenu.';
      return;
    }

    const response = await this.workspaceService.rateWorkspace(
      this.workspace.firmId,
      this.workspace.name,
      this.user.username,
      ratingType
    );

    if (response && (response as any).ok) {
      this.successMessage = (response as any).body?.message || 'Ocena je uspešno dodata.';
      await this.reloadWorkspaceData();
      return;
    }

    this.errorMessage = (response as any)?.error?.message || 'Greška pri ostavljanju ocene.';
  }

  private async reloadWorkspaceData()
  {
    const reloadedWorkspace = await firstValueFrom(
      await this.workspaceService.getWorkspace(this.workspace.firmId, this.workspace.name)
    );

    if (!reloadedWorkspace) {
      return;
    }

    this.workspace = reloadedWorkspace;
    this.refreshPrivateSpaceTypeLists();

    if (this.isReserving && this.hasAnySelectedReservationTarget()) {
      await this.refreshReservationCalendar();
    }
  }

  toggleReservationMode()
  {
    this.isReserving = !this.isReserving;
    this.successMessage = '';
    this.errorMessage = '';

    this.refreshPrivateSpaceTypeLists();

    if (this.isReserving) {
      this.resetReservationForm();
    }
  }

  private refreshPrivateSpaceTypeLists()
  {
    const allOffices = this.workspace.privateSpaces.filter(ps => ps.type === 'office');
    if (this.allowedOfficeNamesFromSearch && this.allowedOfficeNamesFromSearch.length > 0) 
    {
      this.offices = allOffices.filter(ps => this.allowedOfficeNamesFromSearch!.includes(ps.spaceName));
      this.allowedOfficeNamesFromSearch = null;
    }
    else 
      this.offices = allOffices;
    this.conferenceRooms = this.workspace.privateSpaces.filter(ps => ps.type === 'conference');
  }

  isReservationTypeAvailable(type: 'open' | 'office' | 'conference')
  {
    if (type === 'open') 
      return this.workspace.capacity > 0;
    if (type === 'office') 
      return this.offices.length > 0;
    return this.conferenceRooms.length > 0;
  }

  onReservationTypeChange(type: 'open' | 'office' | 'conference')
  {
    this.selectedReservationType = type;
    this.currentPrivateSpaceIndex = 0;

    if (type === 'open') 
    {
      this.reserveOpenSpace = true;
      this.selectedPrivateSpace = '';
    } 
    else if (type === 'office') 
    {
      this.reserveOpenSpace = false;
      this.selectedPrivateSpace = this.offices.length > 0 ? this.offices[0].spaceName : '';
    }
    else 
    {
      this.reserveOpenSpace = false;
      this.selectedPrivateSpace = this.conferenceRooms.length > 0 ? this.conferenceRooms[0].spaceName : '';
    }

    this.reservationDay = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.refreshReservationCalendar();
  }

  onReservationTypeCheckboxChange(type: 'open' | 'office' | 'conference', isChecked: boolean)
  {
    if (isChecked)
    {
      this.onReservationTypeChange(type);
      return;
    }

    if (this.selectedReservationType === type) 
    {
      this.selectedReservationType = '';
      this.currentPrivateSpaceIndex = 0;
      this.reserveOpenSpace = false;
      this.selectedPrivateSpace = '';
      this.reservationDay = '';
      this.refreshPrivateSpaceTypeLists();
      this.refreshReservationCalendar();
    }
  }

  isReservationTypeChecked(type: 'open' | 'office' | 'conference')
  {
    return this.selectedReservationType === type;
  }

  isReservationTypeCheckboxDisabled(type: 'open' | 'office' | 'conference')
  {
    if (!this.isReservationTypeAvailable(type)) 
      return true;
    
    return this.selectedReservationType !== '' && this.selectedReservationType !== type;
  }

  getCurrentPrivateSpaces()
  {
    if (this.selectedReservationType === 'office') {
      return this.offices;
    }
    if (this.selectedReservationType === 'conference') {
      return this.conferenceRooms;
    }
    return [];
  }

  canNavigatePrivateSpaces()
  {
    return this.getCurrentPrivateSpaces().length > 1;
  }

  goToPreviousPrivateSpace()
  {
    const spaces = this.getCurrentPrivateSpaces();
    if (spaces.length <= 1) {
      return;
    }

    this.currentPrivateSpaceIndex =
      (this.currentPrivateSpaceIndex - 1 + spaces.length) % spaces.length;
    this.selectedPrivateSpace = spaces[this.currentPrivateSpaceIndex].spaceName;
    this.reservationDay = '';
    this.refreshReservationCalendar();
  }

  goToNextPrivateSpace()
  {
    const spaces = this.getCurrentPrivateSpaces();
    if (spaces.length <= 1) {
      return;
    }

    this.currentPrivateSpaceIndex =
      (this.currentPrivateSpaceIndex + 1) % spaces.length;
    this.selectedPrivateSpace = spaces[this.currentPrivateSpaceIndex].spaceName;
    this.reservationDay = '';
    this.refreshReservationCalendar();
  }

  onOpenSpaceSelectionChange(isSelected: boolean)
  {
    this.reserveOpenSpace = isSelected;
    if (isSelected) {
      this.selectedPrivateSpace = '';
    }
    this.refreshReservationCalendar();
  }

  onPrivateSpaceSelectionChange(spaceName: string, isSelected: boolean)
  {
    if (isSelected) {
      this.selectedPrivateSpace = spaceName;
      this.reserveOpenSpace = false;
      this.refreshPrivateSpaceTypeLists();
      this.refreshReservationCalendar();
      return;
    }

    if (this.selectedPrivateSpace === spaceName) {
      this.selectedPrivateSpace = '';
    }
    this.refreshReservationCalendar();
  }

  isOpenSpaceChoiceDisabled()
  {
    return this.loading || !!this.selectedPrivateSpace;
  }

  isPrivateSpaceChoiceDisabled(spaceName: string)
  {
    return this.loading || this.reserveOpenSpace || (!!this.selectedPrivateSpace && this.selectedPrivateSpace !== spaceName);
  }

  async submitReservation()
  {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.reserveOpenSpace && !this.selectedPrivateSpace) {
      this.errorMessage = 'Izaberite šta želite da rezervišete.';
      return;
    }

    if (!this.reservationDay || !this.reservationStartTime || !this.reservationEndTime) {
      this.errorMessage = 'Izaberite datum i vreme početka/kraja rezervacije.';
      return;
    }

    if (this.reservationStartTime >= this.reservationEndTime) {
      this.errorMessage = 'Vreme početka mora biti pre vremena kraja.';
      return;
    }


    // Parse day to Date object
    const reservationDate = new Date(this.reservationDay);
    if (!reservationDate) {
      this.errorMessage = 'Neispravan format datuma.';
      return;
    }

    // Check if selected day is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (reservationDate < today) {
      this.errorMessage = 'Dan rezervacije ne može biti u prošlosti.';
      return;
    }

    // Create start and end Date objects
    const startDateTime = this.combineDateAndTime(reservationDate, this.reservationStartTime);
    const endDateTime = this.combineDateAndTime(reservationDate, this.reservationEndTime);

    if (!startDateTime || !endDateTime) {
      this.errorMessage = 'Neispravan format vremena.';
      return;
    }

    const res: Reservation = {
      firmId: this.workspace.firmId,
      workspaceName: this.workspace.name,
      type: this.reserveOpenSpace? 'open' : 'private',
      privateSpaceName: this.reserveOpenSpace? '': this.selectedPrivateSpace,
      startDate: startDateTime,
      endDate: endDateTime,
      username: this.user!.username,
      status: 'active',
      reservationDate: new Date(),
      ws: new Workspace,
    };
    
    console.log(res);
    const response = await this.reservationService.makeReservation(res);
    if (response.ok) {
      this.successMessage = response.message;
      await this.refreshReservationCalendar();
      localStorage.removeItem('searchedWorkspace');
    }
    else
      this.errorMessage = response.message;
  }

  private combineDateAndTime(date: Date, timeStr: string): Date | null
  {
    if (!timeStr) {
      return null;
    }
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);

    const result = new Date(date);
    result.setHours(h, m, 0, 0);
    return result;
  }

  private resetReservationForm()
  {
    this.selectedReservationType = '';
    this.currentPrivateSpaceIndex = 0;
    this.reserveOpenSpace = false;
    this.selectedPrivateSpace = '';

    this.reservationDay = '';
    this.reservationStartTime = '';
    this.reservationEndTime = '';
    this.calendarEvents = [];
    this.calendarOptions = {
      ...this.calendarOptions,
      events: this.calendarEvents,
    };
  }

  private applySearchedWorkspaceFromStorage()
  {
    const searchedWorkspaceStr = localStorage.getItem('searchedWorkspace');
    if (!searchedWorkspaceStr) 
      return;
    

    try {
      const searchedWorkspace = JSON.parse(searchedWorkspaceStr);

      
      const typeToApply: 'open' | 'office' | 'conference' = searchedWorkspace.type;

      if (typeToApply === 'office') 
      {
        if (Array.isArray(searchedWorkspace.offices) && searchedWorkspace.offices.length > 0) {
          this.allowedOfficeNamesFromSearch = searchedWorkspace.offices;
        } else if (searchedWorkspace.spaceName) {
          this.allowedOfficeNamesFromSearch = [searchedWorkspace.spaceName];
        }
        this.refreshPrivateSpaceTypeLists();
      }
      

      if (!typeToApply || !this.isReservationTypeAvailable(typeToApply)) 
        return;
      

      // Open reservation mode
      this.isReserving = true;
      this.successMessage = '';
      this.errorMessage = '';

      // Set the type
      this.onReservationTypeChange(typeToApply);

      // Private space
      if (typeToApply !== 'open' && searchedWorkspace.spaceName) 
      {
        const spaces = this.getCurrentPrivateSpaces();
        const spaceIndex = spaces.findIndex(s => s.spaceName === searchedWorkspace.spaceName);
        if (spaceIndex !== -1) {
          this.currentPrivateSpaceIndex = spaceIndex;
          this.selectedPrivateSpace = spaces[spaceIndex].spaceName;
          this.refreshReservationCalendar();
        }
      }

      // Remove the saved workspace after applying it
      localStorage.removeItem('searchedWorkspace');
    } catch (error) {
      console.error('Error parsing searchedWorkspace from localStorage:', error);
    }
  }

  onCalendarDateClick(arg: DateClickArg)
  {
    const clickedDate = new Date(arg.date);
    clickedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (clickedDate < today) 
    {
      this.errorMessage = 'Dan rezervacije ne može biti u prošlosti.';
      return;
    }

    this.reservationDay = this.formatDateForInput(clickedDate);
    this.errorMessage = '';
    this.refreshReservationCalendar();
  }

  getSelectedReservationDayLabel()
  {
    if (!this.reservationDay) 
      return 'Izaberite dan klikom na kalendar';
    

    const [year, month, day] = this.reservationDay.split('-');
    return `${day}.${month}.${year}`;
  }

  private formatDateForInput(date: Date)
  {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  async getReservations(spaceName: string)
  {
    const firmReservations = await this.reservationService.getFirmReservations(this.workspace.firmId);
    const wsReservations = firmReservations.filter(res => res.workspaceName === this.workspace.name && (res.status === 'active' || res.status === 'confirmed'));
    if (spaceName === '')
      return wsReservations.filter(res => res.type === 'open');
    return wsReservations.filter(res => res.type === 'private' && res.privateSpaceName === spaceName);
  }

  hasAnySelectedReservationTarget()
  {
    return this.reserveOpenSpace || !!this.selectedPrivateSpace;
  }

  getSelectedReservationLabel()
  {
    if (this.reserveOpenSpace) {
      return 'Sto u otvorenom prostoru';
    }
    if (this.selectedPrivateSpace) {
      const privateSpace = this.workspace.privateSpaces.find(sp => sp.spaceName === this.selectedPrivateSpace);
      return privateSpace?.spaceName 
        + ' ( kapacitet: ' 
        + (privateSpace?.type === 'office'? privateSpace.capacity : '10 - 12 osoba') 
        + ' )';
    }
    return '';
  }

  private async refreshReservationCalendar()
  {
    if (!this.hasAnySelectedReservationTarget()) 
    {
      this.calendarEvents = [];
      this.calendarOptions = {
        ...this.calendarOptions,
        events: this.calendarEvents,
      };
      return;
    }

    const reservations = await this.getReservations(this.reserveOpenSpace ? '' : this.selectedPrivateSpace);

    const reservationEvents: EventInput[] = reservations.map((res) => ({
      title: '',
      start: new Date(res.startDate),
      end: new Date(res.endDate),
      backgroundColor: this.user && res.username === this.user.username ? '#e5f6e8' : '#d97b77',
      borderColor: this.user && res.username === this.user.username ? '#2f7a36' : '#b85f5c',
      textColor: this.user && res.username === this.user.username ? '#2f7a36' : '#ffffff',
    }));

    this.calendarEvents = [...reservationEvents];

    const selectedDayHighlight = this.buildSelectedDayHighlightEvent();
    if (selectedDayHighlight) {
      this.calendarEvents.push(selectedDayHighlight);
    }

    this.calendarOptions = {
      ...this.calendarOptions,
      events: this.calendarEvents,
    };
  }

  private buildSelectedDayHighlightEvent(): EventInput | null
  {
    if (!this.reservationDay) {
      return null;
    }

    const selectedDate = new Date(`${this.reservationDay}T00:00:00`);
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);

    return {
      title: '',
      start: selectedDate,
      end: nextDate,
      allDay: true,
      display: 'background',
      backgroundColor: '#f7d9d6',
    };
  }

}
