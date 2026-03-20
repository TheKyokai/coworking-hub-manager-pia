import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Workspace from '../../../models/workspace';
import { WorkspaceService } from '../../../services/workspace-service/workspace-service';
import { AuthService } from '../../../services/auth-service/auth-service';
import User from '../../../models/user';
import { WorkspaceView } from '../../../workspace-view/workspace-view';

@Component({
  selector: 'app-manager-workspace-view',
  imports: [CommonModule, WorkspaceView],
  templateUrl: './manager-workspace-view.html',
  styleUrl: './manager-workspace-view.css',
})
export class ManagerWorkspaceView implements OnInit {
  private workspaceService = inject(WorkspaceService);
  private authService = inject(AuthService);

  workspaces: Workspace[] = [];
  loading = false;
  currentUser: User | null = null;
  selectedWorkspace: Workspace | null = null;
  showDetails = false;

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
    console.log("Workspaces");
    console.log(this.workspaces);
  }

  getPrivateSpacesDisplay(privateSpaces: any[] | undefined)
  {
    if (!privateSpaces || privateSpaces.length === 0) {
      return 'Nema privatnih prostora';
    }
    return privateSpaces.map(space => `${space.spaceName} (${space.type})`).join('\n');
  }

  showWorkspaceDetails(workspace: Workspace)
  {
    this.selectedWorkspace = workspace;
    this.showDetails = true;
  }

  backToList()
  {
    this.showDetails = false;
    this.selectedWorkspace = null;
    this.loadManagerWorkspaces();
  }
}
