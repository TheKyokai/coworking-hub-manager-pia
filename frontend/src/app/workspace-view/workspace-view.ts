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

@Component({
  selector: 'app-workspace-view',
  imports: [CommonModule, FormsModule, PrivateSpaceView],
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

  editingWorkspace: Workspace | null = null;
  isEditing = false;
  isReserving = false;
  loading = false;
  successMessage = '';
  errorMessage = '';


  showAddNewPrivateSpace = false;
  newPrivateSpaceType = '';
  newPrivateSpace: PrivateSpace | null = null;

  user: User | null = null;
  firm: Firm | null = null;
  managers: User[]  = [];

  @ViewChild('mapContainer') mapContainer: ElementRef | null = null;
  private map: any = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['workspace'] && this.workspace) {
      this.loadData();
      this.initializeMap();
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

  toggleReservationMode()
  {
    this.isReserving = !this.isReserving;
  }
}
