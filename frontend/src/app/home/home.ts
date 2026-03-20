import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth-service/auth-service';
import { Router, RouterLink } from '@angular/router';
import Workspace from '../models/workspace';
import { BrowseWorkspaces } from '../browse-workspaces/browse-workspaces';
import { WorkspaceService } from '../services/workspace-service/workspace-service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, BrowseWorkspaces],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit{

  private authService = inject(AuthService);
  private workspaceService = inject(WorkspaceService);
  private router = inject(Router);


  workspaces: Workspace[] = [];
  topWorkspaces: Workspace[] = []

  async ngOnInit()
  {
    const user = await this.authService.getUser();
    if (user != null)
      this.router.navigate(['dashboard']);
    this.workspaces = await this.workspaceService.getAllWorkspaces();
    this.workspaces = this.workspaces.filter(ws => ws.status == 'approved');
    this.topWorkspaces = this.workspaces.sort((wa, wb) => this.getWorkspaceLikeCount(wb) - this.getWorkspaceLikeCount(wa)).slice(0, 5);
  }

  getWorkspaceLikeCount(ws: Workspace)
  {
    let cnt = 0;
    ws.ratings.forEach( r => {if (r.rating === 'like') cnt++;});
    return cnt;
  }

  onWorkspaceClick(workspace: Workspace)
  {
    this.router.navigate(['/workspace', workspace.firmId, workspace.name]);
  }

}
