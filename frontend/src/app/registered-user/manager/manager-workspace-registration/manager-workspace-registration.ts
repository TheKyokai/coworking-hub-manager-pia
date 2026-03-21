import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Workspace from '../../../models/workspace';
import { WorkspaceService } from '../../../services/workspace-service/workspace-service';
import User from '../../../models/user';
import { UserService } from '../../../services/user-service/user-service';
import { AuthService } from '../../../services/auth-service/auth-service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-manager-workspace-registration',
  imports: [FormsModule],
  templateUrl: './manager-workspace-registration.html',
  styleUrl: './manager-workspace-registration.css',
})
export class ManagerWorkspaceRegistration implements OnInit{
  private workspaceService = inject(WorkspaceService);
  private authService = inject(AuthService);

  workspace: Workspace = new Workspace();
  loading = false;
  successMessage = '';
  errorMessage = '';
  uploadedFileName = '';

  user = new User();

  async ngOnInit()
  {
    const user = await this.authService.getUser();
    if (user)
      this.user = user;
    else
      this.errorMessage = "Greška pri učitavanju";
  }

  onKeyPress(event: KeyboardEvent, inputElement: HTMLInputElement, fieldType: string): void {
    const char = event.key;
    
    if (char === '-' || char === '+') {
      event.preventDefault();
      return;
    }
    
    if (fieldType === 'capacity' && char === '0' && inputElement.value === '') {
      event.preventDefault();
      return;
    }
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    if (value.includes('-') || value.includes('+')) {
      value = value.replace(/[-+]/g, '');
      input.value = value;
    }
  }

  async onJsonFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : null;

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.json')) {
      this.errorMessage = 'Dozvoljen je samo .json fajl.';
      this.successMessage = '';
      input.value = '';
      return;
    }

    try {
      const fileContent = await file.text();
      const parsed = JSON.parse(fileContent);

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        this.errorMessage = 'JSON sadržaj mora biti objekat.';
        this.successMessage = '';
        input.value = '';
        return;
      }


      // Upload successful => parse fields
      this.applyWorkspaceFromJson(parsed as Record<string, unknown>);
      this.uploadedFileName = file.name;
      this.successMessage = 'Podaci iz JSON fajla su učitani u formu.';
      this.errorMessage = '';
    } catch {
      this.errorMessage = 'Neispravan JSON fajl.';
      this.successMessage = '';
      input.value = '';
    }
  }

  toNumber(value: unknown, fallback: number)
  {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  };

  // TODO: Simplify
  private applyWorkspaceFromJson(data: Record<string, unknown>) {

    if (typeof data['name'] === 'string')
      this.workspace.name = data['name'].trim();

    if (typeof data['description'] === 'string')
      this.workspace.description = data['description'];

    if (typeof data['address'] === 'string')
      this.workspace.address = data['address'].trim();

    if (typeof data['city'] === 'string')
      this.workspace.city = data['city'].trim();

    this.workspace.capacity = this.toNumber(data['capacity'], this.workspace.capacity);
    this.workspace.pricePerHour = this.toNumber(data['pricePerHour'], this.workspace.pricePerHour);
    this.workspace.maximumViolations = this.toNumber(data['maximumViolations'], this.workspace.maximumViolations);
    this.workspace.lat = this.toNumber(data['lat'], this.workspace.lat);
    this.workspace.lon = this.toNumber(data['lon'], this.workspace.lon);
  }

  async onSubmit() {
    
    if (!this.workspace.name || this.workspace.capacity < 5 || this.workspace.pricePerHour < 0 || 
        !this.workspace.address || !this.workspace.city || this.workspace.lat < 0 || this.workspace.lon < 0) {
      this.errorMessage = 'Popunite sva obavezna polja. Kapacitet mora biti najmanje 5.';
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      this.workspace.firmId = this.user.firmId;
      console.log(this.workspace);

      const response: any = await this.workspaceService.registerWorkspace(this.workspace);
    
      if (!response)
      {
        this.errorMessage = 'Greška pri registraciji radnog prostora';
        return;    
      }
      
      if (response.ok)
        this.successMessage = response.body.message;
      else
        this.errorMessage = response.error.message;
    } catch (error: any) {
      this.errorMessage = error?.error?.message || 'Došlo je do greške pri registraciji radnog prostora';
    } finally {
      this.loading = false;
    }
  }

  onCancel() {
    this.workspace = new Workspace();
    this.uploadedFileName = '';
    this.successMessage = '';
    this.errorMessage = '';
  }
}
