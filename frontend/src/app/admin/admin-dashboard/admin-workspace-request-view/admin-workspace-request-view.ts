import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Workspace from '../../../models/workspace';
import { AdminService } from '../../../services/admin-service/admin-service';
import { WorkspaceService } from '../../../services/workspace-service/workspace-service';

@Component({
  selector: 'app-admin-workspace-request-view',
  imports: [],
  templateUrl: './admin-workspace-request-view.html',
  styleUrl: './admin-workspace-request-view.css',
})
export class AdminWorkspaceRequestView implements OnInit {
  private adminService = inject(AdminService);
  private workspaceService = inject(WorkspaceService);

  pendingWorkspaces: Workspace[] = [];
  loading = false;

  ngOnInit()
  {
    this.loadPendingWorkspaces();
  }

  async loadPendingWorkspaces()
  {
    this.loading = true;
    try {
      this.pendingWorkspaces = await this.workspaceService.getPendingWorkspaces();
    } finally {
      this.loading = false;
    }
  }

  async approveWorkspace(workspace: Workspace)
  {
    this.loading = true;
    try {
      const result = await this.adminService.approveWorkspace(workspace.firmId, workspace.name);
      console.log(result.message);
      await this.loadPendingWorkspaces();
    } finally {
      this.loading = false;
    }
  }

  async declineWorkspace(workspace: Workspace)
  {
    this.loading = true;
    try {
      const result = await this.adminService.declineWorkspace(workspace.firmId, workspace.name);
      console.log(result.message);
      await this.loadPendingWorkspaces();
    } finally {
      this.loading = false;
    }
  }
}
