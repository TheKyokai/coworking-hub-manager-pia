import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Workspace from '../../../models/workspace';
import { WorkspaceService } from '../../../services/workspace-service/workspace-service';
import { AuthService } from '../../../services/auth-service/auth-service';
import User from '../../../models/user';

@Component({
  selector: 'app-manager-workspace-view',
  imports: [CommonModule],
  templateUrl: './manager-workspace-view.html',
  styleUrl: './manager-workspace-view.css',
})
export class ManagerWorkspaceView implements OnInit {
  private workspaceService = inject(WorkspaceService);
  private authService = inject(AuthService);

  workspaces: Workspace[] = [];
  loading = false;
  currentUser: User | null = null;

  ngOnInit()
  {
    this.loadManagerWorkspaces();
  }

  async loadManagerWorkspaces()
  {
    this.loading = true;
    try {
      this.currentUser = await this.authService.getUser();
      if (this.currentUser && this.currentUser.firmId) {
        this.workspaces = await this.workspaceService.getWorkspacesByFirmId(this.currentUser.firmId);
      }
    } catch (error) {
      console.error("Failed to load workspaces", error);
    } finally {
      this.loading = false;
    }
  }

  getPrivateSpacesDisplay(privateSpaces: any[] | undefined)
  {
    if (!privateSpaces || privateSpaces.length === 0) {
      return 'Nema privatnih prostora';
    }
    return privateSpaces.map(space => `${space.name} (${space.type})`).join(', ');
  }
}
