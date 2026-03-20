import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import PrivateSpace from '../models/private-space';
import { AuthService } from '../services/auth-service/auth-service';
import { WorkspaceService } from '../services/workspace-service/workspace-service';
import User from '../models/user';

@Component({
  selector: 'app-private-space-view',
  imports: [CommonModule, FormsModule],
  templateUrl: './private-space-view.html',
  styleUrl: './private-space-view.css',
})
export class PrivateSpaceView implements OnInit{
  @Input() inputPrivateSpace: PrivateSpace = new PrivateSpace();
  @Input() isEditing = false;
  @Input() workspaceName = '';
  
  private authService = inject(AuthService);
  private workspaceService = inject(WorkspaceService);
  user: User | null = null;

  privateSpace = new PrivateSpace();
  editingSpace: PrivateSpace | null = null;
  loading = false;
  successMessage = '';
  errorMessage = '';


  async ngOnInit()
  {
    this.privateSpace = {... this.inputPrivateSpace};
    this.editingSpace = {... this.inputPrivateSpace};
    this.user = await this.authService.getUser();
  }

  async saveChanges()
  {
    if (!this.editingSpace) {
      return;
    }

    // Checks
    if (!this.editingSpace.spaceName || !this.editingSpace.spaceName.trim()) 
    {
      this.errorMessage = "Naziv je obavezan";
      return;
    }

    if (!this.editingSpace.type || !this.editingSpace.type.trim()) 
    {
      this.errorMessage = "Tip je obavezan";
      return;
    }

    if (this.editingSpace.type === 'office' && this.editingSpace.capacity <= 0) 
    {
      this.errorMessage = "Kapacitet mora biti veći od 0";
      return;
    }

    if (this.editingSpace.pricePerHour < 0)
    {
      this.errorMessage = "Cena po satu ne može biti negativna";
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      console.log(this.editingSpace)
      if (!this.user)
      {
        this.errorMessage = "Greška pri ažuriranju privatnog prostora";
        return;
      }
      
      const response = await this.workspaceService.updatePrivateWorkspace(this.user.firmId, this.workspaceName, this.editingSpace);
      if ((response as any).ok)
        this.successMessage = (response as any).body.message;

    } catch (error) {
      this.errorMessage = "Greška pri ažuriranju privatnog prostora";
      console.error("Error updating space:", error);
    } finally {
      this.loading = false;
    }
  }

  onTypeChange()
  {
    if (this.editingSpace && this.editingSpace.type === 'conference') {
      this.editingSpace.capacity = 10;
    }
  }
}
